import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Estimate, EstimateLineItem, EstimateApprovalSignature } from './entities/estimate.entity';
import { CreateEstimateDto, UpdateEstimateDto, EstimateQueryDto, ApproveEstimateDto } from './dto/estimate.dto';
import { EstimateStatus } from '@/common/enums';

@Injectable()
export class EstimatesService {
  constructor(
    @InjectRepository(Estimate)
    private readonly estimateRepository: Repository<Estimate>,
    @InjectRepository(EstimateLineItem)
    private readonly lineItemRepository: Repository<EstimateLineItem>,
    @InjectRepository(EstimateApprovalSignature)
    private readonly signatureRepository: Repository<EstimateApprovalSignature>,
    private readonly dataSource: DataSource,
  ) {}

  async create(tenantId: string, createEstimateDto: CreateEstimateDto): Promise<Estimate> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { lineItems, ...estimateData } = createEstimateDto;

      const estimate = this.estimateRepository.create({
        ...estimateData,
        tenantId,
        status: EstimateStatus.DRAFT,
      });

      const savedEstimate = await queryRunner.manager.save(estimate);

      if (lineItems && lineItems.length > 0) {
        const lineItemEntities = lineItems.map((item, index) => {
          const total = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
          return this.lineItemRepository.create({
            ...item,
            tenantId,
            estimateId: savedEstimate.id,
            total,
            discountAmount: item.quantity * item.unitPrice * ((item.discountPercent || 0) / 100),
            sortOrder: item.sortOrder ?? index,
          });
        });
        await queryRunner.manager.save(lineItemEntities);
      }

      await this.calculateTotals(savedEstimate.id, queryRunner.manager);
      await queryRunner.commitTransaction();

      return this.findOne(tenantId, savedEstimate.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateTotals(estimateId: string, manager?: any): Promise<void> {
    const repo = manager ? manager.getRepository(Estimate) : this.estimateRepository;
    const lineItemRepo = manager ? manager.getRepository(EstimateLineItem) : this.lineItemRepository;

    const lineItems = await lineItemRepo.find({ where: { estimateId } });
    const estimate = await repo.findOne({ where: { id: estimateId } });

    if (!estimate) return;

    const subtotal = lineItems
      .filter((item: EstimateLineItem) => !item.optional)
      .reduce((sum: number, item: EstimateLineItem) => sum + Number(item.total), 0);

    const discountAmount = estimate.discountType === 'percent'
      ? subtotal * (estimate.discountValue / 100)
      : estimate.discountValue || 0;

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (estimate.taxRate || 0);
    const totalAmount = taxableAmount + taxAmount;

    const depositAmount = estimate.depositType === 'percent'
      ? totalAmount * (estimate.depositValue / 100)
      : estimate.depositValue || 0;

    await repo.update(estimateId, {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      depositAmount,
    });
  }

  async findAll(tenantId: string, query: EstimateQueryDto): Promise<{ data: Estimate[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      accountId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.estimateRepository.createQueryBuilder('estimate');
    queryBuilder.where('estimate.tenant_id = :tenantId', { tenantId });
    queryBuilder.andWhere('estimate.parent_estimate_id IS NULL'); // Only get parent estimates

    if (accountId) {
      queryBuilder.andWhere('estimate.account_id = :accountId', { accountId });
    }

    if (status) {
      queryBuilder.andWhere('estimate.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(estimate.estimate_number ILIKE :search OR estimate.title ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.leftJoinAndSelect('estimate.account', 'account');
    queryBuilder.orderBy(`estimate.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Estimate> {
    const estimate = await this.estimateRepository.findOne({
      where: { id, tenantId },
      relations: ['account', 'serviceAddress', 'lineItems', 'signatures', 'versions'],
    });
    if (!estimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found`);
    }
    return estimate;
  }

  async update(tenantId: string, id: string, updateEstimateDto: UpdateEstimateDto): Promise<Estimate> {
    const estimate = await this.findOne(tenantId, id);

    if (estimate.status === EstimateStatus.APPROVED || estimate.status === EstimateStatus.CONVERTED) {
      throw new BadRequestException('Cannot update approved or converted estimates');
    }

    const { lineItems, ...estimateData } = updateEstimateDto;
    Object.assign(estimate, estimateData);
    await this.estimateRepository.save(estimate);

    if (lineItems !== undefined) {
      await this.lineItemRepository.delete({ estimateId: id });
      if (lineItems.length > 0) {
        const lineItemEntities = lineItems.map((item, index) => {
          const total = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
          return this.lineItemRepository.create({
            ...item,
            tenantId,
            estimateId: id,
            total,
            discountAmount: item.quantity * item.unitPrice * ((item.discountPercent || 0) / 100),
            sortOrder: item.sortOrder ?? index,
          });
        });
        await this.lineItemRepository.save(lineItemEntities);
      }
      await this.calculateTotals(id);
    }

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const estimate = await this.findOne(tenantId, id);
    await this.estimateRepository.remove(estimate);
  }

  async createVersion(tenantId: string, id: string): Promise<Estimate> {
    const original = await this.findOne(tenantId, id);

    const newVersion = this.estimateRepository.create({
      ...original,
      id: undefined,
      estimateNumber: undefined,
      version: original.version + 1,
      parentEstimateId: original.parentEstimateId || original.id,
      status: EstimateStatus.DRAFT,
      sentAt: undefined,
      viewedAt: undefined,
      approvedAt: undefined,
      rejectedAt: undefined,
      convertedAt: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });

    const savedVersion = await this.estimateRepository.save(newVersion);

    // Copy line items
    const lineItems = original.lineItems.map(item =>
      this.lineItemRepository.create({
        ...item,
        id: undefined,
        estimateId: savedVersion.id,
        createdAt: undefined,
        updatedAt: undefined,
      }),
    );
    await this.lineItemRepository.save(lineItems);

    return this.findOne(tenantId, savedVersion.id);
  }

  async send(tenantId: string, id: string): Promise<Estimate> {
    const estimate = await this.findOne(tenantId, id);
    estimate.status = EstimateStatus.SENT;
    estimate.sentAt = new Date();
    return this.estimateRepository.save(estimate);
  }

  async markViewed(tenantId: string, id: string): Promise<Estimate> {
    const estimate = await this.findOne(tenantId, id);
    if (!estimate.viewedAt) {
      estimate.viewedAt = new Date();
      if (estimate.status === EstimateStatus.SENT) {
        estimate.status = EstimateStatus.VIEWED;
      }
      return this.estimateRepository.save(estimate);
    }
    return estimate;
  }

  async approve(tenantId: string, id: string, approveDto: ApproveEstimateDto): Promise<Estimate> {
    const estimate = await this.findOne(tenantId, id);

    estimate.status = EstimateStatus.APPROVED;
    estimate.approvedAt = new Date();
    estimate.approvedByName = approveDto.approvedByName;
    estimate.approvedByEmail = approveDto.approvedByEmail;
    estimate.selectedOption = approveDto.selectedOption;

    if (approveDto.signatureData) {
      const signature = this.signatureRepository.create({
        tenantId,
        estimateId: id,
        signerName: approveDto.approvedByName,
        signerEmail: approveDto.approvedByEmail,
        signatureData: approveDto.signatureData,
        signatureType: 'drawn',
      });
      await this.signatureRepository.save(signature);
    }

    return this.estimateRepository.save(estimate);
  }

  async reject(tenantId: string, id: string, reason: string): Promise<Estimate> {
    const estimate = await this.findOne(tenantId, id);
    estimate.status = EstimateStatus.REJECTED;
    estimate.rejectedAt = new Date();
    estimate.rejectionReason = reason;
    return this.estimateRepository.save(estimate);
  }

  async convertToJob(tenantId: string, id: string, jobId: string): Promise<Estimate> {
    const estimate = await this.findOne(tenantId, id);
    estimate.status = EstimateStatus.CONVERTED;
    estimate.convertedAt = new Date();
    estimate.convertedJobId = jobId;
    return this.estimateRepository.save(estimate);
  }

  async getVersionHistory(tenantId: string, id: string): Promise<Estimate[]> {
    const estimate = await this.findOne(tenantId, id);
    const parentId = estimate.parentEstimateId || estimate.id;

    return this.estimateRepository.find({
      where: [
        { tenantId, id: parentId },
        { tenantId, parentEstimateId: parentId },
      ],
      order: { version: 'ASC' },
    });
  }
}
