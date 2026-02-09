import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, Activity, LeadStageHistory } from './entities/lead.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadQueryDto,
  CreateActivityDto,
} from './dto/lead.dto';
import { ActivityDirection, LifecycleStage } from '@/common/enums';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(LeadStageHistory)
    private readonly stageHistoryRepository: Repository<LeadStageHistory>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(tenantId: string, createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      tenantId,
      stage: 'new',
    });

    // Auto-assign based on territory if zip is provided
    if (createLeadDto.zip) {
      const assignedRepId = await this.findRepByTerritory(tenantId, createLeadDto.zip);
      if (assignedRepId) {
        lead.assignedRepId = assignedRepId;
      }
    }

    const savedLead = await this.leadRepository.save(lead);

    // Record initial stage history
    await this.createStageHistory(tenantId, savedLead.id, null, 'new');

    return savedLead;
  }

  async findAll(
    tenantId: string,
    query: LeadQueryDto,
  ): Promise<{ data: Lead[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      pipeline,
      stage,
      assignedRepId,
      businessLine,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.leadRepository.createQueryBuilder('lead');
    queryBuilder.where('lead.tenant_id = :tenantId', { tenantId });

    if (pipeline) {
      queryBuilder.andWhere('lead.pipeline = :pipeline', { pipeline });
    }

    if (stage) {
      queryBuilder.andWhere('lead.stage = :stage', { stage });
    }

    if (assignedRepId) {
      queryBuilder.andWhere('lead.assigned_rep_id = :assignedRepId', { assignedRepId });
    }

    if (businessLine) {
      queryBuilder.andWhere('lead.business_line = :businessLine', { businessLine });
    }

    queryBuilder.leftJoinAndSelect('lead.account', 'account');
    queryBuilder.leftJoinAndSelect('lead.property', 'property');
    queryBuilder.orderBy(`lead.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id, tenantId },
      relations: ['account', 'property', 'activities', 'stageHistory'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(tenantId: string, id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    Object.assign(lead, updateLeadDto);
    return this.leadRepository.save(lead);
  }

  async transition(
    tenantId: string,
    id: string,
    toStage: string,
    userId?: string,
    reason?: string,
  ): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    const fromStage = lead.stage;

    if (fromStage === toStage) {
      throw new BadRequestException(`Lead is already in stage "${toStage}"`);
    }

    // Update stage
    lead.stage = toStage;

    // Handle won/lost timestamps
    if (toStage === 'won') {
      lead.wonAt = new Date();
    } else if (toStage === 'lost') {
      lead.lostAt = new Date();
    }

    const savedLead = await this.leadRepository.save(lead);

    // Record stage history
    await this.createStageHistory(tenantId, id, fromStage, toStage, userId, reason);

    return savedLead;
  }

  async addActivity(
    tenantId: string,
    leadId: string,
    activityDto: CreateActivityDto,
  ): Promise<Activity> {
    const lead = await this.findOne(tenantId, leadId);

    const activity = this.activityRepository.create({
      ...activityDto,
      tenantId,
      leadId: lead.id,
      accountId: lead.accountId,
    });

    const savedActivity = await this.activityRepository.save(activity);

    // Calculate minutes_to_first_contact on first outbound activity
    if (
      activityDto.direction === ActivityDirection.OUTBOUND &&
      !lead.firstContactAt
    ) {
      const now = new Date();
      const minutesToFirstContact = Math.round(
        (now.getTime() - lead.createdAt.getTime()) / 60000,
      );
      await this.leadRepository.update(
        { id: leadId, tenantId },
        {
          firstContactAt: now,
          minutesToFirstContact,
        },
      );
    }

    return savedActivity;
  }

  async convertToJob(tenantId: string, id: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);

    if (lead.stage === 'won') {
      throw new BadRequestException('Lead has already been converted');
    }

    // Transition lead to WON
    lead.stage = 'won';
    lead.wonAt = new Date();

    const savedLead = await this.leadRepository.save(lead);

    // Record stage transition
    await this.createStageHistory(tenantId, id, lead.stage, 'won');

    // Update customer lifecycle stage to ACTIVE if account is linked
    if (lead.accountId) {
      await this.accountRepository.update(
        { id: lead.accountId, tenantId },
        { lifecycleStage: LifecycleStage.ACTIVE },
      );
    }

    return savedLead;
  }

  async getActivities(tenantId: string, leadId: string): Promise<Activity[]> {
    // Verify lead exists
    await this.findOne(tenantId, leadId);

    return this.activityRepository.find({
      where: { tenantId, leadId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPipelineStats(
    tenantId: string,
    pipeline: string,
  ): Promise<{ stage: string; count: number }[]> {
    const results = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.stage', 'stage')
      .addSelect('COUNT(lead.id)', 'count')
      .where('lead.tenant_id = :tenantId', { tenantId })
      .andWhere('lead.pipeline = :pipeline', { pipeline })
      .andWhere('lead.deleted_at IS NULL')
      .groupBy('lead.stage')
      .getRawMany();

    return results.map((r) => ({
      stage: r.stage,
      count: parseInt(r.count, 10),
    }));
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const lead = await this.findOne(tenantId, id);
    await this.leadRepository.softRemove(lead);
  }

  // ---- Private helpers ----

  private async findRepByTerritory(
    tenantId: string,
    zip: string,
  ): Promise<string | null> {
    // Placeholder: territory-based auto-assignment logic.
    // In a real implementation this would query a territories table
    // and return the assigned rep's user ID for the matching zip code.
    return null;
  }

  private async createStageHistory(
    tenantId: string,
    leadId: string,
    fromStage: string | null,
    toStage: string,
    changedBy?: string,
    reason?: string,
  ): Promise<void> {
    const history = this.stageHistoryRepository.create({
      tenantId,
      leadId,
      fromStage: fromStage ?? undefined,
      toStage,
      changedBy,
      reason,
      changedAt: new Date(),
    });
    await this.stageHistoryRepository.save(history);
  }
}
