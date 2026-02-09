import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Invoice, InvoiceLineItem } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@/common/enums';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceLineItem)
    private readonly lineItemRepository: Repository<InvoiceLineItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(tenantId: string, createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { lineItems, ...invoiceData } = createInvoiceDto;

      const invoiceEntity: any = {
        ...invoiceData,
        tenantId,
        status: InvoiceStatus.DRAFT,
        issuedDate: invoiceData.issueDate || new Date(),
      };

      // Calculate due date from payment terms if not provided
      if (!invoiceEntity.dueDate && invoiceEntity.paymentTerms) {
        const dueDate = new Date(invoiceEntity.issuedDate);
        dueDate.setDate(dueDate.getDate() + invoiceEntity.paymentTerms);
        invoiceEntity.dueDate = dueDate;
      }

      const savedInvoice: Invoice = await queryRunner.manager.save(Invoice, invoiceEntity);

      if (lineItems && lineItems.length > 0) {
        const lineItemEntities = lineItems.map((item: any, index: number) => {
          const total = item.quantity * item.unitPrice;
          return {
            ...item,
            tenantId,
            invoiceId: savedInvoice.id,
            total,
            sortOrder: item.sortOrder ?? index,
          };
        });
        await queryRunner.manager.save(InvoiceLineItem, lineItemEntities);
      }

      await this.calculateTotals(savedInvoice.id, queryRunner.manager);
      await queryRunner.commitTransaction();

      return this.findOne(tenantId, savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateTotals(invoiceId: string, manager?: any): Promise<void> {
    const repo = manager ? manager.getRepository(Invoice) : this.invoiceRepository;
    const lineItemRepo = manager ? manager.getRepository(InvoiceLineItem) : this.lineItemRepository;

    const lineItems = await lineItemRepo.find({ where: { invoiceId } });
    const invoice = await repo.findOne({ where: { id: invoiceId } });

    if (!invoice) return;

    const subtotal = lineItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);

    const discountAmount = invoice.discountType === 'percent'
      ? subtotal * (invoice.discountValue / 100)
      : invoice.discountValue || 0;

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (invoice.taxRate || 0);
    const totalAmount = taxableAmount + taxAmount;
    const balanceDue = totalAmount - (invoice.amountPaid || 0) - (invoice.creditsApplied || 0);

    await repo.update(invoiceId, {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      balanceDue,
    });
  }

  async findAll(tenantId: string, query: InvoiceQueryDto): Promise<{ data: Invoice[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      accountId,
      jobId,
      status,
      overdue,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');
    queryBuilder.where('invoice.tenant_id = :tenantId', { tenantId });

    if (accountId) {
      queryBuilder.andWhere('invoice.account_id = :accountId', { accountId });
    }

    if (jobId) {
      queryBuilder.andWhere('invoice.job_id = :jobId', { jobId });
    }

    if (status) {
      queryBuilder.andWhere('invoice.status = :status', { status });
    }

    if (overdue) {
      queryBuilder.andWhere('invoice.due_date < :now', { now: new Date() });
      queryBuilder.andWhere('invoice.status NOT IN (:...paidStatuses)', {
        paidStatuses: [InvoiceStatus.PAID, InvoiceStatus.VOID],
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(invoice.invoice_number ILIKE :search OR invoice.title ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.leftJoinAndSelect('invoice.account', 'account');
    queryBuilder.orderBy(`invoice.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: ['account', 'job', 'lineItems', 'payments'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async findByAccount(tenantId: string, accountId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { tenantId, accountId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(tenantId: string, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException('Cannot update paid or voided invoices');
    }

    const { lineItems, ...invoiceData } = updateInvoiceDto;
    Object.assign(invoice, invoiceData);
    await this.invoiceRepository.save(invoice);

    if (lineItems !== undefined) {
      await this.lineItemRepository.delete({ invoiceId: id });
      if (lineItems.length > 0) {
        const lineItemEntities = lineItems.map((item: any, index: number) => {
          const total = item.quantity * item.unitPrice;
          return {
            ...item,
            tenantId,
            invoiceId: id,
            total,
            sortOrder: item.sortOrder ?? index,
          };
        });
        await this.lineItemRepository.save(lineItemEntities as any);
      }
      await this.calculateTotals(id);
    }

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const invoice = await this.findOne(tenantId, id);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }
    await this.invoiceRepository.remove(invoice);
  }

  async send(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);
    invoice.status = InvoiceStatus.SENT;
    invoice.sentAt = new Date();
    return this.invoiceRepository.save(invoice);
  }

  async markViewed(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);
    if (!invoice.viewedAt) {
      invoice.viewedAt = new Date();
      if (invoice.status === InvoiceStatus.SENT) {
        invoice.status = InvoiceStatus.VIEWED;
      }
      return this.invoiceRepository.save(invoice);
    }
    return invoice;
  }

  async recordPayment(tenantId: string, id: string, amount: number): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);
    invoice.amountPaid = Number(invoice.amountPaid) + amount;
    invoice.balanceDue = Number(invoice.totalAmount) - Number(invoice.amountPaid) - Number(invoice.creditsApplied);

    if (invoice.balanceDue <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
    } else if (invoice.amountPaid > 0) {
      invoice.status = InvoiceStatus.PARTIAL;
    }

    return this.invoiceRepository.save(invoice);
  }

  async voidInvoice(tenantId: string, id: string, reason: string): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);
    invoice.status = InvoiceStatus.VOID;
    invoice.voidedAt = new Date();
    invoice.voidReason = reason;
    return this.invoiceRepository.save(invoice);
  }

  async getOverdueInvoices(tenantId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: {
        tenantId,
        dueDate: LessThan(new Date()),
        status: InvoiceStatus.SENT,
      },
      relations: ['account'],
      order: { dueDate: 'ASC' },
    });
  }

  async getOutstandingBalance(tenantId: string, accountId: string): Promise<number> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.balance_due)', 'total')
      .where('invoice.tenant_id = :tenantId', { tenantId })
      .andWhere('invoice.account_id = :accountId', { accountId })
      .andWhere('invoice.status NOT IN (:...statuses)', {
        statuses: [InvoiceStatus.PAID, InvoiceStatus.VOID, InvoiceStatus.DRAFT],
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }
}
