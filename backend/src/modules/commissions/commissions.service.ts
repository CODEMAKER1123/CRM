import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CommissionRule,
  BonusRule,
  CommissionRecord,
  BonusRecord,
  JobExpense,
} from './entities/commission.entity';
import {
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
  CreateBonusRuleDto,
  CommissionQueryDto,
  RuleQueryDto,
  CreateJobExpenseDto,
} from './dto/commission.dto';
import { CommissionStatus } from '@/common/enums';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(CommissionRule)
    private readonly commissionRuleRepository: Repository<CommissionRule>,
    @InjectRepository(BonusRule)
    private readonly bonusRuleRepository: Repository<BonusRule>,
    @InjectRepository(CommissionRecord)
    private readonly commissionRecordRepository: Repository<CommissionRecord>,
    @InjectRepository(BonusRecord)
    private readonly bonusRecordRepository: Repository<BonusRecord>,
    @InjectRepository(JobExpense)
    private readonly jobExpenseRepository: Repository<JobExpense>,
  ) {}

  // ---------------------------------------------------------------------------
  // Commission Rules
  // ---------------------------------------------------------------------------

  async createRule(tenantId: string, dto: CreateCommissionRuleDto): Promise<CommissionRule> {
    const rule = this.commissionRuleRepository.create({
      ...dto,
      tenantId,
      isActive: true,
    });

    return this.commissionRuleRepository.save(rule);
  }

  async findAllRules(
    tenantId: string,
    query: RuleQueryDto,
  ): Promise<{ data: CommissionRule[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      roleType,
      businessLine,
      isActive,
    } = query;

    const queryBuilder = this.commissionRuleRepository.createQueryBuilder('rule');
    queryBuilder.where('rule.tenant_id = :tenantId', { tenantId });

    if (roleType) {
      queryBuilder.andWhere('rule.role_type = :roleType', { roleType });
    }

    if (businessLine) {
      queryBuilder.andWhere('rule.business_line = :businessLine', { businessLine });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('rule.is_active = :isActive', { isActive });
    }

    queryBuilder.orderBy('rule.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOneRule(tenantId: string, id: string): Promise<CommissionRule> {
    const rule = await this.commissionRuleRepository.findOne({
      where: { id, tenantId },
    });
    if (!rule) {
      throw new NotFoundException(`Commission rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateRule(
    tenantId: string,
    id: string,
    dto: UpdateCommissionRuleDto,
  ): Promise<CommissionRule> {
    const existingRule = await this.findOneRule(tenantId, id);

    // Deactivate the old rule
    existingRule.isActive = false;
    existingRule.endDate = new Date();
    await this.commissionRuleRepository.save(existingRule);

    // Create a new version of the rule
    const newRule = this.commissionRuleRepository.create({
      ...existingRule,
      ...dto,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      isActive: true,
      endDate: undefined,
      previousVersionId: existingRule.id,
      effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
    });

    return this.commissionRuleRepository.save(newRule);
  }

  async deactivateRule(tenantId: string, id: string): Promise<CommissionRule> {
    const rule = await this.findOneRule(tenantId, id);

    if (!rule.isActive) {
      throw new BadRequestException(`Commission rule with ID ${id} is already inactive`);
    }

    rule.isActive = false;
    rule.endDate = new Date();

    return this.commissionRuleRepository.save(rule);
  }

  async testRule(
    tenantId: string,
    ruleId: string,
    jobId: string,
  ): Promise<{
    rule: CommissionRule;
    jobId: string;
    grossRevenueCents: number;
    deductionsCents: number;
    commissionBaseCents: number;
    commissionCents: number;
    commissionRate: number;
  }> {
    const rule = await this.findOneRule(tenantId, ruleId);

    // Fetch job expenses for deduction calculation
    const expenses = await this.jobExpenseRepository.find({
      where: { tenantId, jobId },
    });

    // Calculate deductible expenses based on the rule's deductible categories
    let deductionsCents = 0;
    if (rule.deductibleExpenseCategories && rule.deductibleExpenseCategories.length > 0) {
      deductionsCents = expenses
        .filter((expense) => rule.deductibleExpenseCategories!.includes(expense.category))
        .reduce((sum, expense) => sum + expense.amountCents, 0);
    }

    // For testing purposes, use a placeholder gross revenue
    // In production, this would be fetched from the job/invoice
    const grossRevenueCents = 0;
    const commissionBaseCents = grossRevenueCents - deductionsCents;
    const commissionCents = Math.round(commissionBaseCents * Number(rule.rate));

    return {
      rule,
      jobId,
      grossRevenueCents,
      deductionsCents,
      commissionBaseCents: Math.max(commissionBaseCents, 0),
      commissionCents: Math.max(commissionCents, 0),
      commissionRate: Number(rule.rate),
    };
  }

  async calculateCrewCommission(
    tenantId: string,
    jobId: string,
  ): Promise<CommissionRecord[]> {
    // Find active crew commission rules for this tenant
    const rules = await this.commissionRuleRepository.find({
      where: {
        tenantId,
        roleType: 'crew' as any,
        isActive: true,
      },
    });

    if (rules.length === 0) {
      return [];
    }

    // Fetch job expenses for deduction
    const expenses = await this.jobExpenseRepository.find({
      where: { tenantId, jobId },
    });

    const records: CommissionRecord[] = [];

    for (const rule of rules) {
      // Calculate deductions
      let deductionsCents = 0;
      if (rule.deductibleExpenseCategories && rule.deductibleExpenseCategories.length > 0) {
        deductionsCents = expenses
          .filter((expense) => rule.deductibleExpenseCategories!.includes(expense.category))
          .reduce((sum, expense) => sum + expense.amountCents, 0);
      }

      // Placeholder: gross revenue should come from the job
      const grossRevenueCents = 0;
      const commissionBaseCents = Math.max(grossRevenueCents - deductionsCents, 0);
      const commissionCents = Math.round(commissionBaseCents * Number(rule.rate));

      const now = new Date();
      const payPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const payPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const record = this.commissionRecordRepository.create({
        tenantId,
        jobId,
        ruleId: rule.id,
        roleType: rule.roleType,
        userId: '', // Should be populated from job assignments
        grossRevenueCents,
        deductionsCents,
        commissionBaseCents,
        commissionRate: Number(rule.rate),
        commissionCents,
        status: CommissionStatus.PENDING,
        payPeriodStart,
        payPeriodEnd,
      });

      const savedRecord = await this.commissionRecordRepository.save(record);
      records.push(savedRecord);
    }

    return records;
  }

  async calculateSalesRepCommission(
    tenantId: string,
    invoiceId: string,
  ): Promise<CommissionRecord[]> {
    // Find active sales rep commission rules for this tenant
    const rules = await this.commissionRuleRepository.find({
      where: {
        tenantId,
        roleType: 'sales_rep' as any,
        isActive: true,
      },
    });

    if (rules.length === 0) {
      return [];
    }

    const records: CommissionRecord[] = [];

    for (const rule of rules) {
      // Placeholder: invoice amount should come from the invoice
      const grossRevenueCents = 0;
      const commissionBaseCents = grossRevenueCents;
      const commissionCents = Math.round(commissionBaseCents * Number(rule.rate));

      const now = new Date();
      const payPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const payPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const record = this.commissionRecordRepository.create({
        tenantId,
        ruleId: rule.id,
        roleType: rule.roleType,
        userId: '', // Should be populated from the invoice/account sales rep
        grossRevenueCents,
        deductionsCents: 0,
        commissionBaseCents,
        commissionRate: Number(rule.rate),
        commissionCents,
        status: CommissionStatus.PENDING,
        payPeriodStart,
        payPeriodEnd,
      });

      const savedRecord = await this.commissionRecordRepository.save(record);
      records.push(savedRecord);
    }

    return records;
  }

  // ---------------------------------------------------------------------------
  // Bonus Rules
  // ---------------------------------------------------------------------------

  async createBonusRule(tenantId: string, dto: CreateBonusRuleDto): Promise<BonusRule> {
    const bonusRule = this.bonusRuleRepository.create({
      ...dto,
      tenantId,
      isActive: true,
    });

    return this.bonusRuleRepository.save(bonusRule);
  }

  async findAllBonusRules(
    tenantId: string,
    query: RuleQueryDto,
  ): Promise<{ data: BonusRule[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      roleType,
      businessLine,
      isActive,
    } = query;

    const queryBuilder = this.bonusRuleRepository.createQueryBuilder('rule');
    queryBuilder.where('rule.tenant_id = :tenantId', { tenantId });

    if (roleType) {
      queryBuilder.andWhere('rule.role_type = :roleType', { roleType });
    }

    if (businessLine) {
      queryBuilder.andWhere('rule.business_line = :businessLine', { businessLine });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('rule.is_active = :isActive', { isActive });
    }

    queryBuilder.orderBy('rule.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async evaluateMonthlyBonuses(
    tenantId: string,
    month: number,
    year: number,
  ): Promise<BonusRecord[]> {
    // Determine the evaluation period
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Find active bonus rules
    const bonusRules = await this.bonusRuleRepository.find({
      where: {
        tenantId,
        isActive: true,
      },
    });

    if (bonusRules.length === 0) {
      return [];
    }

    const records: BonusRecord[] = [];

    for (const rule of bonusRules) {
      // Placeholder: metric values should be computed from actual data
      // For monthly_revenue, sum all commission records in the period
      // For contract_signed, count contracts signed in the period
      const metricValueCents = 0;

      // Check if threshold is met
      if (rule.thresholdCents && metricValueCents < rule.thresholdCents) {
        continue;
      }

      const record = this.bonusRecordRepository.create({
        tenantId,
        ruleId: rule.id,
        userId: '', // Should be populated per-user evaluation
        periodStart,
        periodEnd,
        metricValueCents,
        thresholdCents: rule.thresholdCents,
        bonusAmountCents: rule.bonusAmountCents,
        status: CommissionStatus.PENDING,
      });

      const savedRecord = await this.bonusRecordRepository.save(record);
      records.push(savedRecord);
    }

    return records;
  }

  // ---------------------------------------------------------------------------
  // Commission Records
  // ---------------------------------------------------------------------------

  async findAllRecords(
    tenantId: string,
    query: CommissionQueryDto,
  ): Promise<{ data: CommissionRecord[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      roleType,
      status,
      userId,
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.commissionRecordRepository.createQueryBuilder('record');
    queryBuilder.where('record.tenant_id = :tenantId', { tenantId });

    if (roleType) {
      queryBuilder.andWhere('record.role_type = :roleType', { roleType });
    }

    if (status) {
      queryBuilder.andWhere('record.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('record.user_id = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'record.pay_period_start >= :startDate AND record.pay_period_end <= :endDate',
        { startDate, endDate },
      );
    } else if (startDate) {
      queryBuilder.andWhere('record.pay_period_start >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('record.pay_period_end <= :endDate', { endDate });
    }

    queryBuilder.leftJoinAndSelect('record.rule', 'rule');
    queryBuilder.orderBy('record.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async approveRecord(
    tenantId: string,
    id: string,
    approvedBy: string,
  ): Promise<CommissionRecord> {
    const record = await this.commissionRecordRepository.findOne({
      where: { id, tenantId },
    });

    if (!record) {
      throw new NotFoundException(`Commission record with ID ${id} not found`);
    }

    if (record.status !== CommissionStatus.PENDING) {
      throw new BadRequestException(
        `Commission record with ID ${id} is not in pending status`,
      );
    }

    record.status = CommissionStatus.APPROVED;
    record.approvedBy = approvedBy;
    record.approvedAt = new Date();

    return this.commissionRecordRepository.save(record);
  }

  // ---------------------------------------------------------------------------
  // Job Expenses
  // ---------------------------------------------------------------------------

  async addJobExpense(
    tenantId: string,
    jobId: string,
    dto: CreateJobExpenseDto,
  ): Promise<JobExpense> {
    const expense = this.jobExpenseRepository.create({
      ...dto,
      tenantId,
      jobId,
    });

    return this.jobExpenseRepository.save(expense);
  }

  async findJobExpenses(tenantId: string, jobId: string): Promise<JobExpense[]> {
    return this.jobExpenseRepository.find({
      where: { tenantId, jobId },
      order: { createdAt: 'DESC' },
    });
  }

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------

  async getCommissionReport(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    totalCommissionCents: number;
    totalBonusCents: number;
    recordCount: number;
    byRoleType: Record<string, { totalCents: number; count: number }>;
    byStatus: Record<string, { totalCents: number; count: number }>;
  }> {
    // Commission records in the date range
    const commissionQueryBuilder = this.commissionRecordRepository.createQueryBuilder('record');
    commissionQueryBuilder.where('record.tenant_id = :tenantId', { tenantId });
    commissionQueryBuilder.andWhere(
      'record.pay_period_start >= :startDate AND record.pay_period_end <= :endDate',
      { startDate, endDate },
    );

    const commissionRecords = await commissionQueryBuilder.getMany();

    // Bonus records in the date range
    const bonusQueryBuilder = this.bonusRecordRepository.createQueryBuilder('bonus');
    bonusQueryBuilder.where('bonus.tenant_id = :tenantId', { tenantId });
    bonusQueryBuilder.andWhere(
      'bonus.period_start >= :startDate AND bonus.period_end <= :endDate',
      { startDate, endDate },
    );

    const bonusRecords = await bonusQueryBuilder.getMany();

    // Aggregate commission data
    const totalCommissionCents = commissionRecords.reduce(
      (sum, r) => sum + r.commissionCents,
      0,
    );
    const totalBonusCents = bonusRecords.reduce(
      (sum, r) => sum + r.bonusAmountCents,
      0,
    );

    const byRoleType: Record<string, { totalCents: number; count: number }> = {};
    const byStatus: Record<string, { totalCents: number; count: number }> = {};

    for (const record of commissionRecords) {
      // By role type
      if (!byRoleType[record.roleType]) {
        byRoleType[record.roleType] = { totalCents: 0, count: 0 };
      }
      byRoleType[record.roleType].totalCents += record.commissionCents;
      byRoleType[record.roleType].count += 1;

      // By status
      if (!byStatus[record.status]) {
        byStatus[record.status] = { totalCents: 0, count: 0 };
      }
      byStatus[record.status].totalCents += record.commissionCents;
      byStatus[record.status].count += 1;
    }

    return {
      totalCommissionCents,
      totalBonusCents,
      recordCount: commissionRecords.length,
      byRoleType,
      byStatus,
    };
  }
}
