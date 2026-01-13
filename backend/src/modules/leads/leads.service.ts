import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, IsNull, Not } from 'typeorm';
import {
  Lead,
  LeadActivity,
  LeadPipelineConfig,
  LeadType,
  LeadTemperature,
  ResidentialPipelineStage,
  CommercialPipelineStage,
} from './entities/lead.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadQueryDto,
  MoveLeadStageDto,
  ConvertLeadDto,
  AssignLeadDto,
  BulkAssignLeadsDto,
  CreateLeadActivityDto,
  LeadActivityQueryDto,
  CreatePipelineConfigDto,
  UpdatePipelineConfigDto,
  LeadStatsDto,
  PipelineViewDto,
} from './dto/lead.dto';
import { AccountType } from '@/common/enums';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(LeadActivity)
    private readonly activityRepository: Repository<LeadActivity>,
    @InjectRepository(LeadPipelineConfig)
    private readonly pipelineConfigRepository: Repository<LeadPipelineConfig>,
  ) {}

  // Lead CRUD Operations
  async create(tenantId: string, createDto: CreateLeadDto, performedById?: string): Promise<Lead> {
    // Set default pipeline stage based on lead type
    const defaultStage = createDto.leadType === LeadType.RESIDENTIAL
      ? ResidentialPipelineStage.NEW
      : CommercialPipelineStage.NEW;

    const lead = this.leadRepository.create({
      ...createDto,
      tenantId,
      pipelineStage: createDto.pipelineStage || defaultStage,
      temperature: createDto.temperature || LeadTemperature.WARM,
      nextFollowUpAt: createDto.nextFollowUpAt ? new Date(createDto.nextFollowUpAt) : undefined,
    });

    const savedLead = await this.leadRepository.save(lead);

    // Log activity
    await this.createActivity(tenantId, savedLead.id, {
      activityType: 'created',
      title: 'Lead created',
      description: `New ${createDto.leadType} lead created from ${createDto.source}`,
    }, performedById);

    return savedLead;
  }

  async findAll(tenantId: string, query: LeadQueryDto): Promise<{ data: Lead[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      leadType,
      pipelineStage,
      temperature,
      source,
      assignedToId,
      unassigned,
      search,
      followUpDue,
      includeConverted,
      includeLost,
      createdAfter,
      createdBefore,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.leadRepository.createQueryBuilder('lead');
    queryBuilder.where('lead.tenant_id = :tenantId', { tenantId });

    // Filter by lead type
    if (leadType) {
      queryBuilder.andWhere('lead.lead_type = :leadType', { leadType });
    }

    // Filter by pipeline stage
    if (pipelineStage) {
      queryBuilder.andWhere('lead.pipeline_stage = :pipelineStage', { pipelineStage });
    }

    // Filter by temperature
    if (temperature) {
      queryBuilder.andWhere('lead.temperature = :temperature', { temperature });
    }

    // Filter by source
    if (source) {
      queryBuilder.andWhere('lead.source = :source', { source });
    }

    // Filter by assignment
    if (assignedToId) {
      queryBuilder.andWhere('lead.assigned_to_id = :assignedToId', { assignedToId });
    }

    if (unassigned) {
      queryBuilder.andWhere('lead.assigned_to_id IS NULL');
    }

    // Search by name, email, phone, company
    if (search) {
      queryBuilder.andWhere(
        `(lead.first_name ILIKE :search OR lead.last_name ILIKE :search OR lead.email ILIKE :search OR lead.phone ILIKE :search OR lead.company_name ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // Filter by follow-up due
    if (followUpDue) {
      queryBuilder.andWhere('lead.next_follow_up_at <= :now', { now: new Date() });
    }

    // Exclude converted leads by default
    if (!includeConverted) {
      queryBuilder.andWhere('lead.converted_at IS NULL');
    }

    // Exclude lost leads by default
    if (!includeLost) {
      queryBuilder.andWhere('lead.lost_at IS NULL');
    }

    // Date filters
    if (createdAfter) {
      queryBuilder.andWhere('lead.created_at >= :createdAfter', { createdAfter: new Date(createdAfter) });
    }

    if (createdBefore) {
      queryBuilder.andWhere('lead.created_at <= :createdBefore', { createdBefore: new Date(createdBefore) });
    }

    // Sorting
    const sortColumn = this.getSortColumn(sortBy);
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Pagination
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  private getSortColumn(sortBy: string): string {
    const sortMap: Record<string, string> = {
      createdAt: 'lead.created_at',
      firstName: 'lead.first_name',
      lastName: 'lead.last_name',
      temperature: 'lead.temperature',
      leadScore: 'lead.lead_score',
      estimatedValue: 'lead.estimated_value',
      nextFollowUpAt: 'lead.next_follow_up_at',
      pipelineStage: 'lead.pipeline_stage',
    };
    return sortMap[sortBy] || 'lead.created_at';
  }

  async findOne(tenantId: string, id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id, tenantId },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(tenantId: string, id: string, updateDto: UpdateLeadDto, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);

    // Track changes for activity log
    const changes: string[] = [];
    if (updateDto.temperature && updateDto.temperature !== lead.temperature) {
      changes.push(`Temperature changed from ${lead.temperature} to ${updateDto.temperature}`);
    }
    if (updateDto.leadScore !== undefined && updateDto.leadScore !== lead.leadScore) {
      changes.push(`Lead score changed from ${lead.leadScore} to ${updateDto.leadScore}`);
    }

    Object.assign(lead, updateDto);
    if (updateDto.nextFollowUpAt) {
      lead.nextFollowUpAt = new Date(updateDto.nextFollowUpAt);
    }

    const savedLead = await this.leadRepository.save(lead);

    // Log activity if there were changes
    if (changes.length > 0) {
      await this.createActivity(tenantId, id, {
        activityType: 'updated',
        title: 'Lead updated',
        description: changes.join('. '),
      }, performedById);
    }

    return savedLead;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const lead = await this.findOne(tenantId, id);
    await this.leadRepository.remove(lead);
  }

  // Pipeline Stage Management
  async moveStage(tenantId: string, id: string, moveDto: MoveLeadStageDto, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    const oldStage = lead.pipelineStage;
    const newStage = moveDto.newStage;

    // Validate the new stage exists for this lead type
    await this.validateStage(tenantId, lead.leadType, newStage);

    lead.pipelineStage = newStage;

    // Handle won stage
    if (this.isWonStage(newStage)) {
      lead.convertedAt = new Date();
    }

    // Handle lost stage
    if (this.isLostStage(newStage)) {
      lead.lostAt = new Date();
      lead.lostReason = moveDto.reason;
      lead.lostToCompetitor = moveDto.lostToCompetitor;
    }

    const savedLead = await this.leadRepository.save(lead);

    // Log activity
    await this.createActivity(tenantId, id, {
      activityType: 'stage_change',
      title: `Stage changed to ${newStage}`,
      description: moveDto.reason,
    }, performedById);

    // Update activity with old/new values
    const activity = await this.activityRepository.findOne({
      where: { leadId: id },
      order: { createdAt: 'DESC' },
    });
    if (activity) {
      activity.oldValue = oldStage;
      activity.newValue = newStage;
      await this.activityRepository.save(activity);
    }

    return savedLead;
  }

  private async validateStage(tenantId: string, leadType: LeadType, stage: string): Promise<void> {
    // First check custom pipeline config
    const customConfig = await this.pipelineConfigRepository.findOne({
      where: { tenantId, leadType, stage, isActive: true },
    });

    if (customConfig) return;

    // Check default stages
    const validStages: string[] = leadType === LeadType.RESIDENTIAL
      ? Object.values(ResidentialPipelineStage)
      : Object.values(CommercialPipelineStage);

    if (!validStages.includes(stage)) {
      throw new BadRequestException(`Invalid stage "${stage}" for ${leadType} pipeline`);
    }
  }

  private isWonStage(stage: string): boolean {
    return stage === ResidentialPipelineStage.WON || stage === CommercialPipelineStage.WON;
  }

  private isLostStage(stage: string): boolean {
    return stage === ResidentialPipelineStage.LOST || stage === CommercialPipelineStage.LOST;
  }

  // Lead Conversion
  async convertLead(tenantId: string, id: string, convertDto: ConvertLeadDto, performedById?: string): Promise<{ lead: Lead; accountId?: string; jobId?: string }> {
    const lead = await this.findOne(tenantId, id);

    if (lead.convertedAt) {
      throw new BadRequestException('Lead has already been converted');
    }

    let accountId: string | undefined;
    let jobId: string | undefined;

    // Use existing account or create new one
    if (convertDto.existingAccountId) {
      accountId = convertDto.existingAccountId;
    } else if (convertDto.createAccount) {
      // In a real implementation, you would inject AccountsService
      // accountId = await this.accountsService.create(tenantId, { ... });
      // For now, we'll just mark as converted and let the frontend handle account creation
    }

    // Create job if requested
    if (convertDto.createJob && accountId) {
      // In a real implementation, you would inject JobsService
      // jobId = await this.jobsService.create(tenantId, { accountId, ... });
    }

    // Update lead
    lead.convertedAt = new Date();
    lead.convertedToAccountId = accountId;
    lead.convertedToJobId = jobId;
    lead.pipelineStage = lead.leadType === LeadType.RESIDENTIAL
      ? ResidentialPipelineStage.WON
      : CommercialPipelineStage.WON;

    const savedLead = await this.leadRepository.save(lead);

    // Log activity
    await this.createActivity(tenantId, id, {
      activityType: 'converted',
      title: 'Lead converted',
      description: `Lead converted to ${accountId ? 'account' : 'customer'}${jobId ? ' with job' : ''}`,
    }, performedById);

    return { lead: savedLead, accountId, jobId };
  }

  // Lead Assignment
  async assign(tenantId: string, id: string, assignDto: AssignLeadDto, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    const previousAssignee = lead.assignedToId;

    lead.assignedToId = assignDto.assignedToId;
    lead.assignedAt = new Date();

    const savedLead = await this.leadRepository.save(lead);

    // Log activity
    await this.createActivity(tenantId, id, {
      activityType: 'assigned',
      title: 'Lead assigned',
      description: previousAssignee
        ? `Lead reassigned from ${previousAssignee} to ${assignDto.assignedToId}`
        : `Lead assigned to ${assignDto.assignedToId}`,
    }, performedById);

    return savedLead;
  }

  async bulkAssign(tenantId: string, bulkDto: BulkAssignLeadsDto, performedById?: string): Promise<{ updated: number }> {
    const result = await this.leadRepository.update(
      { id: In(bulkDto.leadIds), tenantId },
      {
        assignedToId: bulkDto.assignedToId,
        assignedAt: new Date(),
      },
    );

    // Log activities for each lead
    for (const leadId of bulkDto.leadIds) {
      await this.createActivity(tenantId, leadId, {
        activityType: 'assigned',
        title: 'Lead assigned (bulk)',
        description: `Lead assigned to ${bulkDto.assignedToId}`,
      }, performedById);
    }

    return { updated: result.affected || 0 };
  }

  async unassign(tenantId: string, id: string, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    const previousAssignee = lead.assignedToId;

    lead.assignedToId = undefined;
    lead.assignedAt = undefined;

    const savedLead = await this.leadRepository.save(lead);

    // Log activity
    await this.createActivity(tenantId, id, {
      activityType: 'unassigned',
      title: 'Lead unassigned',
      description: `Lead unassigned from ${previousAssignee}`,
    }, performedById);

    return savedLead;
  }

  // Follow-up Management
  async setFollowUp(tenantId: string, id: string, followUpAt: Date, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    lead.nextFollowUpAt = followUpAt;

    const savedLead = await this.leadRepository.save(lead);

    await this.createActivity(tenantId, id, {
      activityType: 'follow_up_scheduled',
      title: 'Follow-up scheduled',
      description: `Follow-up scheduled for ${followUpAt.toISOString()}`,
    }, performedById);

    return savedLead;
  }

  async completeFollowUp(tenantId: string, id: string, notes?: string, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);

    lead.followUpCount = (lead.followUpCount || 0) + 1;
    lead.lastContactedAt = new Date();
    lead.nextFollowUpAt = undefined;

    const savedLead = await this.leadRepository.save(lead);

    await this.createActivity(tenantId, id, {
      activityType: 'follow_up_completed',
      title: 'Follow-up completed',
      description: notes,
    }, performedById);

    return savedLead;
  }

  async getOverdueFollowUps(tenantId: string): Promise<Lead[]> {
    return this.leadRepository.find({
      where: {
        tenantId,
        nextFollowUpAt: LessThanOrEqual(new Date()),
        convertedAt: IsNull(),
        lostAt: IsNull(),
      },
      order: { nextFollowUpAt: 'ASC' },
    });
  }

  // Lead Scoring
  async updateScore(tenantId: string, id: string, scoreChange: number, factor: string, performedById?: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);

    const oldScore = lead.leadScore;
    lead.leadScore = Math.max(0, Math.min(100, lead.leadScore + scoreChange));
    lead.scoreFactors = {
      ...lead.scoreFactors,
      [factor]: (lead.scoreFactors?.[factor] || 0) + scoreChange,
    };

    // Update temperature based on score
    if (lead.leadScore >= 70) {
      lead.temperature = LeadTemperature.HOT;
    } else if (lead.leadScore >= 40) {
      lead.temperature = LeadTemperature.WARM;
    } else {
      lead.temperature = LeadTemperature.COLD;
    }

    const savedLead = await this.leadRepository.save(lead);

    await this.createActivity(tenantId, id, {
      activityType: 'score_change',
      title: 'Lead score updated',
      description: `Score changed from ${oldScore} to ${lead.leadScore} (${factor}: ${scoreChange > 0 ? '+' : ''}${scoreChange})`,
    }, performedById);

    return savedLead;
  }

  // Pipeline View (Kanban)
  async getPipelineView(tenantId: string, leadType: LeadType): Promise<PipelineViewDto[]> {
    // Get pipeline config
    const configs = await this.pipelineConfigRepository.find({
      where: { tenantId, leadType, isActive: true },
      order: { stageOrder: 'ASC' },
    });

    // Use default stages if no custom config
    const stages = configs.length > 0
      ? configs
      : this.getDefaultPipelineConfig(leadType);

    const pipelineView: PipelineViewDto[] = [];

    for (const stage of stages) {
      const leads = await this.leadRepository.find({
        where: {
          tenantId,
          leadType,
          pipelineStage: stage.stage,
          convertedAt: IsNull(),
          lostAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      const totalValue = leads.reduce((sum, lead) => sum + (Number(lead.estimatedValue) || 0), 0);

      pipelineView.push({
        stage: stage.stage,
        displayName: stage.displayName,
        color: stage.color,
        leads,
        count: leads.length,
        totalValue,
      });
    }

    return pipelineView;
  }

  private getDefaultPipelineConfig(leadType: LeadType): Array<{ stage: string; displayName: string; color: string; stageOrder: number }> {
    if (leadType === LeadType.RESIDENTIAL) {
      return [
        { stage: ResidentialPipelineStage.NEW, displayName: 'New', color: '#1890ff', stageOrder: 0 },
        { stage: ResidentialPipelineStage.CONTACTED, displayName: 'Contacted', color: '#13c2c2', stageOrder: 1 },
        { stage: ResidentialPipelineStage.APPOINTMENT_SCHEDULED, displayName: 'Appointment Scheduled', color: '#52c41a', stageOrder: 2 },
        { stage: ResidentialPipelineStage.ESTIMATE_PROVIDED, displayName: 'Estimate Provided', color: '#faad14', stageOrder: 3 },
        { stage: ResidentialPipelineStage.FOLLOW_UP, displayName: 'Follow Up', color: '#722ed1', stageOrder: 4 },
        { stage: ResidentialPipelineStage.NEGOTIATING, displayName: 'Negotiating', color: '#eb2f96', stageOrder: 5 },
      ];
    } else {
      return [
        { stage: CommercialPipelineStage.NEW, displayName: 'New', color: '#1890ff', stageOrder: 0 },
        { stage: CommercialPipelineStage.INITIAL_CONTACT, displayName: 'Initial Contact', color: '#13c2c2', stageOrder: 1 },
        { stage: CommercialPipelineStage.DISCOVERY_CALL, displayName: 'Discovery Call', color: '#52c41a', stageOrder: 2 },
        { stage: CommercialPipelineStage.SITE_VISIT_SCHEDULED, displayName: 'Site Visit Scheduled', color: '#a0d911', stageOrder: 3 },
        { stage: CommercialPipelineStage.SITE_VISIT_COMPLETED, displayName: 'Site Visit Completed', color: '#faad14', stageOrder: 4 },
        { stage: CommercialPipelineStage.PROPOSAL_SENT, displayName: 'Proposal Sent', color: '#fa8c16', stageOrder: 5 },
        { stage: CommercialPipelineStage.PROPOSAL_REVIEW, displayName: 'Proposal Review', color: '#722ed1', stageOrder: 6 },
        { stage: CommercialPipelineStage.CONTRACT_NEGOTIATION, displayName: 'Contract Negotiation', color: '#eb2f96', stageOrder: 7 },
        { stage: CommercialPipelineStage.DECISION_PENDING, displayName: 'Decision Pending', color: '#f5222d', stageOrder: 8 },
      ];
    }
  }

  // Statistics
  async getStats(tenantId: string): Promise<LeadStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total leads (not converted, not lost)
    const total = await this.leadRepository.count({
      where: { tenantId, convertedAt: IsNull(), lostAt: IsNull() },
    });

    // By type
    const byTypeResults = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.lead_type', 'leadType')
      .addSelect('COUNT(*)', 'count')
      .where('lead.tenant_id = :tenantId', { tenantId })
      .andWhere('lead.converted_at IS NULL')
      .andWhere('lead.lost_at IS NULL')
      .groupBy('lead.lead_type')
      .getRawMany();

    const byType = byTypeResults.reduce((acc, row) => {
      acc[row.leadType] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // By stage
    const byStageResults = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.pipeline_stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where('lead.tenant_id = :tenantId', { tenantId })
      .andWhere('lead.converted_at IS NULL')
      .andWhere('lead.lost_at IS NULL')
      .groupBy('lead.pipeline_stage')
      .getRawMany();

    const byStage = byStageResults.reduce((acc, row) => {
      acc[row.stage] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // By temperature
    const byTempResults = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.temperature', 'temperature')
      .addSelect('COUNT(*)', 'count')
      .where('lead.tenant_id = :tenantId', { tenantId })
      .andWhere('lead.converted_at IS NULL')
      .andWhere('lead.lost_at IS NULL')
      .groupBy('lead.temperature')
      .getRawMany();

    const byTemperature = byTempResults.reduce((acc, row) => {
      acc[row.temperature] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // By source
    const bySourceResults = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('lead.tenant_id = :tenantId', { tenantId })
      .andWhere('lead.converted_at IS NULL')
      .andWhere('lead.lost_at IS NULL')
      .groupBy('lead.source')
      .getRawMany();

    const bySource = bySourceResults.reduce((acc, row) => {
      acc[row.source] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Converted this month
    const convertedThisMonth = await this.leadRepository.count({
      where: {
        tenantId,
        convertedAt: Not(IsNull()),
      },
    });

    // Lost this month
    const lostThisMonth = await this.leadRepository.count({
      where: {
        tenantId,
        lostAt: Not(IsNull()),
      },
    });

    // Average time to conversion (in days)
    const conversionTimeResult = await this.leadRepository
      .createQueryBuilder('lead')
      .select('AVG(EXTRACT(EPOCH FROM (lead.converted_at - lead.created_at)) / 86400)', 'avgDays')
      .where('lead.tenant_id = :tenantId', { tenantId })
      .andWhere('lead.converted_at IS NOT NULL')
      .getRawOne();

    const avgTimeToConversion = Math.round(parseFloat(conversionTimeResult?.avgDays || '0'));

    // Follow-ups due
    const followUpsDue = await this.leadRepository.count({
      where: {
        tenantId,
        nextFollowUpAt: LessThanOrEqual(now),
        convertedAt: IsNull(),
        lostAt: IsNull(),
      },
    });

    return {
      total,
      byType: byType as Record<LeadType, number>,
      byStage,
      byTemperature: byTemperature as Record<LeadTemperature, number>,
      bySource: bySource as Record<any, number>,
      convertedThisMonth,
      lostThisMonth,
      avgTimeToConversion,
      followUpsDue,
    };
  }

  // Activity Management
  async createActivity(
    tenantId: string,
    leadId: string,
    activityDto: CreateLeadActivityDto,
    performedById?: string,
  ): Promise<LeadActivity> {
    const activity = this.activityRepository.create({
      tenantId,
      leadId,
      ...activityDto,
      performedById,
    });
    return this.activityRepository.save(activity);
  }

  async getActivities(
    tenantId: string,
    leadId: string,
    query: LeadActivityQueryDto,
  ): Promise<{ data: LeadActivity[]; total: number }> {
    const { page = 1, limit = 50, activityType } = query;

    const queryBuilder = this.activityRepository.createQueryBuilder('activity');
    queryBuilder.where('activity.tenant_id = :tenantId', { tenantId });
    queryBuilder.andWhere('activity.lead_id = :leadId', { leadId });

    if (activityType) {
      queryBuilder.andWhere('activity.activity_type = :activityType', { activityType });
    }

    queryBuilder.orderBy('activity.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  // Log contact activity
  async logContact(
    tenantId: string,
    leadId: string,
    method: string,
    direction: string,
    content?: string,
    performedById?: string,
  ): Promise<LeadActivity> {
    const lead = await this.findOne(tenantId, leadId);

    lead.lastContactedAt = new Date();
    lead.lastContactMethod = method;
    await this.leadRepository.save(lead);

    return this.createActivity(tenantId, leadId, {
      activityType: method,
      title: `${direction === 'outbound' ? 'Outgoing' : 'Incoming'} ${method}`,
      content,
      communicationDirection: direction,
    }, performedById);
  }

  // Pipeline Config Management
  async createPipelineConfig(tenantId: string, configDto: CreatePipelineConfigDto): Promise<LeadPipelineConfig> {
    const config = this.pipelineConfigRepository.create({
      ...configDto,
      tenantId,
    });
    return this.pipelineConfigRepository.save(config);
  }

  async updatePipelineConfig(tenantId: string, id: string, updateDto: UpdatePipelineConfigDto): Promise<LeadPipelineConfig> {
    const config = await this.pipelineConfigRepository.findOne({
      where: { id, tenantId },
    });
    if (!config) {
      throw new NotFoundException(`Pipeline config with ID ${id} not found`);
    }
    Object.assign(config, updateDto);
    return this.pipelineConfigRepository.save(config);
  }

  async getPipelineConfigs(tenantId: string, leadType?: LeadType): Promise<LeadPipelineConfig[]> {
    const where: any = { tenantId };
    if (leadType) {
      where.leadType = leadType;
    }
    return this.pipelineConfigRepository.find({
      where,
      order: { leadType: 'ASC', stageOrder: 'ASC' },
    });
  }

  async deletePipelineConfig(tenantId: string, id: string): Promise<void> {
    const config = await this.pipelineConfigRepository.findOne({
      where: { id, tenantId },
    });
    if (!config) {
      throw new NotFoundException(`Pipeline config with ID ${id} not found`);
    }
    await this.pipelineConfigRepository.remove(config);
  }
}
