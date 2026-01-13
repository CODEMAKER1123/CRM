import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmailTemplate,
  SmsTemplate,
  Campaign,
  AutomationSequence,
  SequenceStep,
  SequenceEnrollment,
  MarketingEvent,
  ReviewRequest,
} from './entities/marketing.entity';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateAutomationSequenceDto,
  UpdateAutomationSequenceDto,
  CreateSequenceStepDto,
  CampaignQueryDto,
} from './dto/marketing.dto';
import { CampaignStatus, EnrollmentStatus } from '@/common/enums';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(SmsTemplate)
    private readonly smsTemplateRepository: Repository<SmsTemplate>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(AutomationSequence)
    private readonly sequenceRepository: Repository<AutomationSequence>,
    @InjectRepository(SequenceStep)
    private readonly stepRepository: Repository<SequenceStep>,
    @InjectRepository(SequenceEnrollment)
    private readonly enrollmentRepository: Repository<SequenceEnrollment>,
    @InjectRepository(MarketingEvent)
    private readonly eventRepository: Repository<MarketingEvent>,
    @InjectRepository(ReviewRequest)
    private readonly reviewRequestRepository: Repository<ReviewRequest>,
  ) {}

  // Email Templates
  async createEmailTemplate(tenantId: string, createDto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create({
      ...createDto,
      tenantId,
    });
    return this.emailTemplateRepository.save(template);
  }

  async findAllEmailTemplates(tenantId: string, isActive?: boolean): Promise<EmailTemplate[]> {
    const where: any = { tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.emailTemplateRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOneEmailTemplate(tenantId: string, id: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async updateEmailTemplate(tenantId: string, id: string, updateDto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.findOneEmailTemplate(tenantId, id);
    Object.assign(template, updateDto);
    return this.emailTemplateRepository.save(template);
  }

  async removeEmailTemplate(tenantId: string, id: string): Promise<void> {
    const template = await this.findOneEmailTemplate(tenantId, id);
    template.isActive = false;
    await this.emailTemplateRepository.save(template);
  }

  // Campaigns
  async createCampaign(tenantId: string, createDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...createDto,
      tenantId,
      status: CampaignStatus.DRAFT,
    });
    return this.campaignRepository.save(campaign);
  }

  async findAllCampaigns(tenantId: string, query: CampaignQueryDto): Promise<{ data: Campaign[]; total: number }> {
    const { page = 1, limit = 20, type, status, search } = query;

    const queryBuilder = this.campaignRepository.createQueryBuilder('campaign');
    queryBuilder.where('campaign.tenant_id = :tenantId', { tenantId });

    if (type) {
      queryBuilder.andWhere('campaign.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('campaign.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder.orderBy('campaign.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOneCampaign(tenantId: string, id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, tenantId },
      relations: ['emailTemplate', 'smsTemplate'],
    });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async updateCampaign(tenantId: string, id: string, updateDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOneCampaign(tenantId, id);
    Object.assign(campaign, updateDto);
    return this.campaignRepository.save(campaign);
  }

  async scheduleCampaign(tenantId: string, id: string, scheduledAt: Date): Promise<Campaign> {
    const campaign = await this.findOneCampaign(tenantId, id);
    campaign.status = CampaignStatus.SCHEDULED;
    campaign.scheduledAt = scheduledAt;
    return this.campaignRepository.save(campaign);
  }

  async startCampaign(tenantId: string, id: string): Promise<Campaign> {
    const campaign = await this.findOneCampaign(tenantId, id);
    campaign.status = CampaignStatus.ACTIVE;
    campaign.startedAt = new Date();
    return this.campaignRepository.save(campaign);
  }

  async pauseCampaign(tenantId: string, id: string): Promise<Campaign> {
    const campaign = await this.findOneCampaign(tenantId, id);
    campaign.status = CampaignStatus.PAUSED;
    return this.campaignRepository.save(campaign);
  }

  async completeCampaign(tenantId: string, id: string): Promise<Campaign> {
    const campaign = await this.findOneCampaign(tenantId, id);
    campaign.status = CampaignStatus.COMPLETED;
    campaign.completedAt = new Date();
    return this.campaignRepository.save(campaign);
  }

  // Automation Sequences
  async createSequence(tenantId: string, createDto: CreateAutomationSequenceDto): Promise<AutomationSequence> {
    const sequence = this.sequenceRepository.create({
      ...createDto,
      tenantId,
    });
    return this.sequenceRepository.save(sequence);
  }

  async findAllSequences(tenantId: string, isActive?: boolean): Promise<AutomationSequence[]> {
    const where: any = { tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.sequenceRepository.find({
      where,
      relations: ['steps'],
      order: { name: 'ASC' },
    });
  }

  async findOneSequence(tenantId: string, id: string): Promise<AutomationSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id, tenantId },
      relations: ['steps', 'enrollments'],
    });
    if (!sequence) {
      throw new NotFoundException(`Sequence with ID ${id} not found`);
    }
    return sequence;
  }

  async updateSequence(tenantId: string, id: string, updateDto: UpdateAutomationSequenceDto): Promise<AutomationSequence> {
    const sequence = await this.findOneSequence(tenantId, id);
    Object.assign(sequence, updateDto);
    return this.sequenceRepository.save(sequence);
  }

  // Sequence Steps
  async addStep(tenantId: string, createDto: CreateSequenceStepDto): Promise<SequenceStep> {
    const step = this.stepRepository.create({
      ...createDto,
      tenantId,
    });
    return this.stepRepository.save(step);
  }

  async updateStep(tenantId: string, id: string, updateDto: Partial<CreateSequenceStepDto>): Promise<SequenceStep> {
    const step = await this.stepRepository.findOne({ where: { id, tenantId } });
    if (!step) {
      throw new NotFoundException(`Step with ID ${id} not found`);
    }
    Object.assign(step, updateDto);
    return this.stepRepository.save(step);
  }

  async removeStep(tenantId: string, id: string): Promise<void> {
    const step = await this.stepRepository.findOne({ where: { id, tenantId } });
    if (step) {
      await this.stepRepository.remove(step);
    }
  }

  // Enrollments
  async enrollContact(
    tenantId: string,
    sequenceId: string,
    contactId: string,
    accountId?: string,
    contextData?: Record<string, unknown>,
  ): Promise<SequenceEnrollment> {
    const sequence = await this.findOneSequence(tenantId, sequenceId);
    const firstStep = sequence.steps.find(s => s.stepOrder === 0);

    const enrollment = this.enrollmentRepository.create({
      tenantId,
      sequenceId,
      contactId,
      accountId,
      status: EnrollmentStatus.ACTIVE,
      currentStepId: firstStep?.id,
      currentStepOrder: 0,
      contextData,
    });

    const saved = await this.enrollmentRepository.save(enrollment);

    // Update sequence metrics
    await this.sequenceRepository.increment({ id: sequenceId }, 'totalEnrolled', 1);

    return saved;
  }

  async unenrollContact(tenantId: string, enrollmentId: string, reason?: string): Promise<SequenceEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    enrollment.status = EnrollmentStatus.EXITED;
    enrollment.exitedAt = new Date();
    enrollment.exitReason = reason;

    await this.sequenceRepository.increment({ id: enrollment.sequenceId }, 'totalExited', 1);

    return this.enrollmentRepository.save(enrollment);
  }

  // Marketing Events
  async trackEvent(
    tenantId: string,
    eventType: string,
    contactId?: string,
    campaignId?: string,
    sequenceId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<MarketingEvent> {
    const event = this.eventRepository.create({
      tenantId,
      eventType,
      contactId,
      campaignId,
      sequenceId,
      metadata,
    });
    return this.eventRepository.save(event);
  }

  // Review Requests
  async createReviewRequest(
    tenantId: string,
    jobId: string,
    accountId: string,
    contactId: string,
  ): Promise<ReviewRequest> {
    const request = this.reviewRequestRepository.create({
      tenantId,
      jobId,
      accountId,
      contactId,
      status: 'pending',
    });
    return this.reviewRequestRepository.save(request);
  }

  async findReviewRequests(tenantId: string, status?: string): Promise<ReviewRequest[]> {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }
    return this.reviewRequestRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async updateReviewRequest(tenantId: string, id: string, data: Partial<ReviewRequest>): Promise<ReviewRequest> {
    const request = await this.reviewRequestRepository.findOne({ where: { id, tenantId } });
    if (!request) {
      throw new NotFoundException(`Review request with ID ${id} not found`);
    }
    Object.assign(request, data);
    return this.reviewRequestRepository.save(request);
  }
}
