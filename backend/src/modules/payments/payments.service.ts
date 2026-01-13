import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentAllocation, Credit } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto, RefundPaymentDto } from './dto/payment.dto';
import { PaymentStatus } from '@/common/enums';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentAllocation)
    private readonly allocationRepository: Repository<PaymentAllocation>,
    @InjectRepository(Credit)
    private readonly creditRepository: Repository<Credit>,
  ) {}

  async create(tenantId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      tenantId,
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
      netAmount: createPaymentDto.amount - (createPaymentDto.processingFee || 0),
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(tenantId: string, query: PaymentQueryDto): Promise<{ data: Payment[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      accountId,
      invoiceId,
      status,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'paymentDate',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');
    queryBuilder.where('payment.tenant_id = :tenantId', { tenantId });

    if (accountId) {
      queryBuilder.andWhere('payment.account_id = :accountId', { accountId });
    }

    if (invoiceId) {
      queryBuilder.andWhere('payment.invoice_id = :invoiceId', { invoiceId });
    }

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('payment.payment_method = :paymentMethod', { paymentMethod });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('payment.payment_date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('payment.payment_date <= :endDate', { endDate });
    }

    queryBuilder.leftJoinAndSelect('payment.account', 'account');
    queryBuilder.leftJoinAndSelect('payment.invoice', 'invoice');
    queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, tenantId },
      relations: ['account', 'invoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByAccount(tenantId: string, accountId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { tenantId, accountId },
      relations: ['invoice'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findByInvoice(tenantId: string, invoiceId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { tenantId, invoiceId },
      order: { paymentDate: 'DESC' },
    });
  }

  async update(tenantId: string, id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(tenantId, id);

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Cannot update refunded payments');
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const payment = await this.findOne(tenantId, id);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be deleted');
    }
    await this.paymentRepository.remove(payment);
  }

  async refund(tenantId: string, id: string, refundDto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.findOne(tenantId, id);

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment already refunded');
    }

    const totalRefunded = Number(payment.refundAmount) + refundDto.amount;
    if (totalRefunded > Number(payment.amount)) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    payment.refundAmount = totalRefunded;
    payment.refundReason = refundDto.reason;
    payment.refundedAt = new Date();

    if (totalRefunded >= Number(payment.amount)) {
      payment.status = PaymentStatus.REFUNDED;
    } else {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    }

    return this.paymentRepository.save(payment);
  }

  async allocateToInvoice(
    tenantId: string,
    paymentId: string,
    invoiceId: string,
    amount: number,
  ): Promise<PaymentAllocation> {
    const allocation = this.allocationRepository.create({
      tenantId,
      paymentId,
      invoiceId,
      amount,
    });
    return this.allocationRepository.save(allocation);
  }

  async getPaymentsByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: {
        tenantId,
        paymentDate: Between(startDate, endDate),
        status: PaymentStatus.COMPLETED,
      },
      relations: ['account'],
      order: { paymentDate: 'ASC' },
    });
  }

  async getTotalPayments(tenantId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.tenant_id = :tenantId', { tenantId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED });

    if (startDate && endDate) {
      queryBuilder.andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const result = await queryBuilder.getRawOne();
    return Number(result?.total) || 0;
  }

  // Credits management
  async createCredit(
    tenantId: string,
    accountId: string,
    amount: number,
    reason: string,
    sourceType?: string,
    sourceId?: string,
  ): Promise<Credit> {
    const credit = this.creditRepository.create({
      tenantId,
      accountId,
      originalAmount: amount,
      remainingAmount: amount,
      reason,
      sourceType,
      sourceId,
    });
    return this.creditRepository.save(credit);
  }

  async getAccountCredits(tenantId: string, accountId: string): Promise<Credit[]> {
    return this.creditRepository.find({
      where: { tenantId, accountId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async getAvailableCredit(tenantId: string, accountId: string): Promise<number> {
    const result = await this.creditRepository
      .createQueryBuilder('credit')
      .select('SUM(credit.remaining_amount)', 'total')
      .where('credit.tenant_id = :tenantId', { tenantId })
      .andWhere('credit.account_id = :accountId', { accountId })
      .andWhere('credit.is_active = true')
      .andWhere('(credit.expires_at IS NULL OR credit.expires_at > NOW())')
      .getRawOne();

    return Number(result?.total) || 0;
  }
}
