import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { JobType, JobStatus, JobPriority, Season, SyncStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Address } from '@/modules/addresses/entities/address.entity';
import { Estimate } from '@/modules/estimates/entities/estimate.entity';
import { Invoice } from '@/modules/invoices/entities/invoice.entity';

@Entity('jobs')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'scheduledDate'])
@Index(['tenantId', 'jobType'])
@Index(['tenantId', 'createdAt'])
export class Job extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_number', length: 50, unique: true, nullable: true })
  jobNumber?: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'service_address_id', type: 'uuid' })
  serviceAddressId: string;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'service_address_id' })
  serviceAddress: Address;

  @Column({ name: 'estimate_id', type: 'uuid', nullable: true })
  estimateId?: string;

  @ManyToOne(() => Estimate, { nullable: true })
  @JoinColumn({ name: 'estimate_id' })
  estimate?: Estimate;

  @Column({ name: 'parent_job_id', type: 'uuid', nullable: true })
  parentJobId?: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'parent_job_id' })
  parentJob?: Job;

  @OneToMany(() => Job, (job) => job.parentJob)
  childJobs: Job[];

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    default: JobType.POWER_WASHING,
  })
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.LEAD,
  })
  status: JobStatus;

  @Column({
    type: 'enum',
    enum: JobPriority,
    default: JobPriority.NORMAL,
  })
  priority: JobPriority;

  @Column({ length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Scheduling
  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate?: Date;

  @Column({ name: 'scheduled_start_time', type: 'time', nullable: true })
  scheduledStartTime?: string;

  @Column({ name: 'scheduled_end_time', type: 'time', nullable: true })
  scheduledEndTime?: string;

  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes?: number;

  // Actual times
  @Column({ name: 'actual_start_time', type: 'timestamp', nullable: true })
  actualStartTime?: Date;

  @Column({ name: 'actual_end_time', type: 'timestamp', nullable: true })
  actualEndTime?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Financials
  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // Recurring
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_pattern', type: 'jsonb', nullable: true })
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: string;
    occurrences?: number;
  };

  @Column({ name: 'recurring_parent_id', type: 'uuid', nullable: true })
  recurringParentId?: string;

  // Seasonal
  @Column({
    type: 'enum',
    enum: Season,
    nullable: true,
  })
  season?: Season;

  // Commercial-specific
  @Column({ name: 'customer_po_number', length: 100, nullable: true })
  customerPoNumber?: string;

  // Source reference
  @Column({ name: 'source_type', length: 50, nullable: true })
  sourceType?: string; // 'estimate', 'recurring', 'manual'

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId?: string;

  // External integrations
  @Column({
    name: 'quickbooks_sync_status',
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  quickbooksSyncStatus: SyncStatus;

  @Column({ name: 'quickbooks_id', length: 100, nullable: true })
  quickbooksId?: string;

  @Column({ name: 'companycam_project_id', length: 100, nullable: true })
  companycamProjectId?: string;

  // Notes
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ name: 'crew_notes', type: 'text', nullable: true })
  crewNotes?: string;

  // Custom fields
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Relations
  @OneToMany(() => JobLineItem, (lineItem) => lineItem.job)
  lineItems: JobLineItem[];

  @OneToMany(() => JobAssignment, (assignment) => assignment.job)
  assignments: JobAssignment[];

  @OneToMany(() => JobStatusHistory, (history) => history.job)
  statusHistory: JobStatusHistory[];

  @OneToMany(() => Invoice, (invoice) => invoice.job)
  invoices: Invoice[];
}

@Entity('job_line_items')
@Index(['jobId'])
export class JobLineItem extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId?: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'boolean', default: true })
  taxable: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('job_assignments')
@Index(['jobId', 'crewMemberId'])
export class JobAssignment extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'crew_id', type: 'uuid', nullable: true })
  crewId?: string;

  @Column({ name: 'crew_member_id', type: 'uuid' })
  crewMemberId: string;

  @Column({ length: 50, default: 'assistant' })
  role: string; // 'lead', 'assistant', 'trainee'

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'NOW()' })
  assignedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('job_status_history')
@Index(['jobId', 'changedAt'])
export class JobStatusHistory extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Explicitly redeclare tenantId to avoid confusion with relation
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'previous_status', type: 'enum', enum: JobStatus, nullable: true })
  previousStatus?: JobStatus;

  @Column({ name: 'new_status', type: 'enum', enum: JobStatus })
  newStatus: JobStatus;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy?: string;

  @Column({ name: 'changed_by_name', length: 255, nullable: true })
  changedByName?: string;

  @Column({ name: 'changed_at', type: 'timestamp', default: () => 'NOW()' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
