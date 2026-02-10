import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Job, JobLineItem, JobAssignment, JobStatusHistory } from './entities/job.entity';
import { JobStateMachine, JobEvent, JobContext } from './job-state-machine';
import { CreateJobDto, UpdateJobDto, JobQueryDto, JobTransitionDto } from './dto/job.dto';
import { JobStatus } from '@/common/enums';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobLineItem)
    private readonly lineItemRepository: Repository<JobLineItem>,
    @InjectRepository(JobAssignment)
    private readonly assignmentRepository: Repository<JobAssignment>,
    @InjectRepository(JobStatusHistory)
    private readonly statusHistoryRepository: Repository<JobStatusHistory>,
    private readonly jobStateMachine: JobStateMachine,
  ) {}

  async create(tenantId: string, createJobDto: CreateJobDto): Promise<Job> {
    const jobNumber = await this.generateJobNumber(tenantId);

    const job = this.jobRepository.create({
      ...createJobDto,
      tenantId,
      jobNumber,
      status: JobStatus.LEAD,
    });

    const savedJob = await this.jobRepository.save(job);

    // Create initial status history
    await this.createStatusHistory(tenantId, savedJob.id, null, JobStatus.LEAD);

    return savedJob;
  }

  async findAll(tenantId: string, query: JobQueryDto): Promise<{ data: Job[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      jobType,
      accountId,
      crewId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.jobRepository.createQueryBuilder('job');
    queryBuilder.where('job.tenant_id = :tenantId', { tenantId });

    if (search) {
      queryBuilder.andWhere(
        '(job.job_number ILIKE :search OR job.title ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere('job.status IN (:...status)', { status });
      } else {
        queryBuilder.andWhere('job.status = :status', { status });
      }
    }

    if (jobType) {
      queryBuilder.andWhere('job.job_type = :jobType', { jobType });
    }

    if (accountId) {
      queryBuilder.andWhere('job.account_id = :accountId', { accountId });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('job.scheduled_date BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      queryBuilder.andWhere('job.scheduled_date >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      queryBuilder.andWhere('job.scheduled_date <= :dateTo', { dateTo });
    }

    queryBuilder.leftJoinAndSelect('job.account', 'account');
    queryBuilder.leftJoinAndSelect('job.serviceAddress', 'serviceAddress');
    queryBuilder.orderBy(`job.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id, tenantId },
      relations: [
        'account',
        'serviceAddress',
        'estimate',
        'lineItems',
        'assignments',
        'statusHistory',
      ],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(tenantId: string, id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(tenantId, id);
    Object.assign(job, updateJobDto);
    return this.jobRepository.save(job);
  }

  async transition(
    tenantId: string,
    id: string,
    transitionDto: JobTransitionDto,
    userId?: string,
  ): Promise<Job> {
    const job = await this.findOne(tenantId, id);

    const context: JobContext = {
      jobId: job.id,
      tenantId: job.tenantId,
      status: job.status,
      scheduledDate: job.scheduledDate,
      estimateId: job.estimateId,
      hasContactInfo: true, // Should check actual contact info
      isFullyPaid: false, // Should check actual payment status
    };

    const event: JobEvent = this.buildEvent(transitionDto);

    if (!this.jobStateMachine.canTransition(context, event)) {
      throw new BadRequestException(
        `Cannot transition job from ${job.status} with action ${transitionDto.action}`,
      );
    }

    const newStatus = this.jobStateMachine.getNextState(context, event);
    if (!newStatus) {
      throw new BadRequestException('Invalid transition');
    }

    const previousStatus = job.status;
    job.status = newStatus;

    // Update related fields based on transition
    if (transitionDto.action === 'SCHEDULE' && transitionDto.scheduledDate) {
      job.scheduledDate = transitionDto.scheduledDate;
    }

    if (transitionDto.action === 'START_WORK') {
      job.actualStartTime = new Date();
    }

    if (transitionDto.action === 'COMPLETE_WORK') {
      job.actualEndTime = new Date();
      job.completedAt = new Date();
    }

    const savedJob = await this.jobRepository.save(job);

    // Create status history
    await this.createStatusHistory(
      tenantId,
      job.id,
      previousStatus,
      newStatus,
      userId,
      transitionDto.reason,
    );

    return savedJob;
  }

  async getAvailableTransitions(tenantId: string, id: string): Promise<string[]> {
    const job = await this.findOne(tenantId, id);

    const context: JobContext = {
      jobId: job.id,
      tenantId: job.tenantId,
      status: job.status,
      scheduledDate: job.scheduledDate,
      estimateId: job.estimateId,
      hasContactInfo: true,
      isFullyPaid: false,
    };

    return this.jobStateMachine.getAvailableTransitions(context);
  }

  async addLineItem(
    tenantId: string,
    jobId: string,
    lineItemData: Partial<JobLineItem>,
  ): Promise<JobLineItem> {
    const job = await this.findOne(tenantId, jobId);

    const lineItem = this.lineItemRepository.create({
      ...lineItemData,
      tenantId,
      jobId: job.id,
      total: (lineItemData.quantity || 0) * (lineItemData.unitPrice || 0),
    });

    const savedLineItem = await this.lineItemRepository.save(lineItem);
    await this.recalculateJobTotals(tenantId, jobId);

    return savedLineItem;
  }

  async assignCrew(
    tenantId: string,
    jobId: string,
    crewMemberId: string,
    role: string,
    crewId?: string,
  ): Promise<JobAssignment> {
    const job = await this.findOne(tenantId, jobId);

    const assignment = this.assignmentRepository.create({
      tenantId,
      jobId: job.id,
      crewMemberId,
      crewId,
      role,
    });

    return this.assignmentRepository.save(assignment);
  }

  async getJobsByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    crewId?: string,
  ): Promise<Job[]> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');
    queryBuilder.where('job.tenant_id = :tenantId', { tenantId });
    queryBuilder.andWhere('job.scheduled_date BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
    queryBuilder.andWhere('job.status NOT IN (:...excludedStatuses)', {
      excludedStatuses: [JobStatus.CANCELLED, JobStatus.LOST],
    });

    if (crewId) {
      queryBuilder.innerJoin('job.assignments', 'assignment');
      queryBuilder.andWhere('assignment.crew_id = :crewId', { crewId });
    }

    queryBuilder.leftJoinAndSelect('job.account', 'account');
    queryBuilder.leftJoinAndSelect('job.serviceAddress', 'serviceAddress');
    queryBuilder.orderBy('job.scheduled_date', 'ASC');
    queryBuilder.addOrderBy('job.scheduled_start_time', 'ASC');

    return queryBuilder.getMany();
  }

  private async generateJobNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.jobRepository.count({
      where: { tenantId },
    });
    return `JOB-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private async createStatusHistory(
    tenantId: string,
    jobId: string,
    previousStatus: JobStatus | null,
    newStatus: JobStatus,
    changedBy?: string,
    reason?: string,
  ): Promise<void> {
    const history = this.statusHistoryRepository.create({
      tenantId,
      jobId,
      previousStatus: previousStatus || undefined,
      newStatus,
      changedBy,
      reason,
    });
    await this.statusHistoryRepository.save(history);
  }

  private async recalculateJobTotals(tenantId: string, jobId: string): Promise<void> {
    const lineItems = await this.lineItemRepository.find({
      where: { tenantId, jobId },
    });

    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total), 0);
    const taxableAmount = lineItems
      .filter((item) => item.taxable)
      .reduce((sum, item) => sum + Number(item.total), 0);

    // Assume 8% tax rate - should come from tenant settings
    const taxRate = 0.08;
    const taxAmount = taxableAmount * taxRate;
    const totalAmount = subtotal + taxAmount;

    await this.jobRepository.update(
      { id: jobId, tenantId },
      { subtotal, taxAmount, totalAmount },
    );
  }

  private buildEvent(transitionDto: JobTransitionDto): JobEvent {
    switch (transitionDto.action) {
      case 'QUALIFY':
        return { type: 'QUALIFY' };
      case 'SEND_ESTIMATE':
        return { type: 'SEND_ESTIMATE' };
      case 'APPROVE_ESTIMATE':
        return { type: 'APPROVE_ESTIMATE' };
      case 'REJECT_ESTIMATE':
        return { type: 'REJECT_ESTIMATE' };
      case 'SCHEDULE':
        return { type: 'SCHEDULE', scheduledDate: transitionDto.scheduledDate! };
      case 'DISPATCH':
        return { type: 'DISPATCH' };
      case 'START_WORK':
        return { type: 'START_WORK' };
      case 'COMPLETE_WORK':
        return { type: 'COMPLETE_WORK' };
      case 'CREATE_INVOICE':
        return { type: 'CREATE_INVOICE', invoiceId: transitionDto.invoiceId! };
      case 'MARK_PAID':
        return { type: 'MARK_PAID' };
      case 'CANCEL':
        return { type: 'CANCEL', reason: transitionDto.reason || '' };
      case 'MARK_LOST':
        return { type: 'MARK_LOST', reason: transitionDto.reason || '' };
      default:
        throw new BadRequestException(`Unknown action: ${transitionDto.action}`);
    }
  }
}
