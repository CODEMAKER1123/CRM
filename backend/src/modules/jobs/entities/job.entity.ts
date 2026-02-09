import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import {
  JobType,
  JobStatus,
  JobPriority,
  Season,
  SyncStatus,
  BusinessLine,
  DepositStatus,
  HolidayJobType,
  PhotoTag,
} from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Address } from '@/modules/addresses/entities/address.entity';
import { Estimate } from '@/modules/estimates/entities/estimate.entity';
import { Invoice } from '@/modules/invoices/entities/invoice.entity';

@Entity('jobs')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'scheduledDate'])
@Index(['tenantId', 'jobType'])
@Index(['tenantId', 'businessLine'])
@Index(['tenantId', 'crewId'])
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

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId?: string;

  @Column({ name: 'parent_job_id', type: 'uuid', nullable: true })
  parentJobId?: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'parent_job_id' })
  parentJob?: Job;

  @OneToMany(() => Job, (job) => job.parentJob)
  childJobs: Job[];

  // Business line
  @Column({
    name: 'business_line',
    type: 'enum',
    enum: BusinessLine,
    default: BusinessLine.POWER_WASH,
  })
  businessLine: BusinessLine;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    default: JobType.POWER_WASHING,
  })
  jobType: JobType;

  @Column({ name: 'service_type', length: 100, nullable: true })
  serviceType?: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.UNSCHEDULED,
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

  // Crew assignment
  @Column({ name: 'crew_id', type: 'uuid', nullable: true })
  crewId?: string;

  // Scheduling
  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate?: Date;

  @Column({ name: 'scheduled_time_start', type: 'timestamp', nullable: true })
  scheduledTimeStart?: Date;

  @Column({ name: 'scheduled_time_end', type: 'timestamp', nullable: true })
  scheduledTimeEnd?: Date;

  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes?: number;

  @Column({ name: 'route_order', type: 'int', nullable: true })
  routeOrder?: number;

  // Actual times
  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'actual_duration_minutes', type: 'int', nullable: true })
  actualDurationMinutes?: number;

  // Financials
  @Column({ name: 'total_price_cents', type: 'int', default: 0 })
  totalPriceCents: number;

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // Callback tracking
  @Column({ name: 'is_callback', type: 'boolean', default: false })
  isCallback: boolean;

  @Column({ name: 'callback_of_job_id', type: 'uuid', nullable: true })
  callbackOfJobId?: string;

  @Column({ name: 'callback_reason', type: 'text', nullable: true })
  callbackReason?: string;

  // Deposit tracking
  @Column({
    name: 'deposit_status',
    type: 'enum',
    enum: DepositStatus,
    nullable: true,
  })
  depositStatus?: DepositStatus;

  @Column({ name: 'require_deposit_for_scheduling', type: 'boolean', default: false })
  requireDepositForScheduling: boolean;

  // Holiday lights linkage
  @Column({ name: 'holiday_contract_id', type: 'uuid', nullable: true })
  holidayContractId?: string;

  @Column({
    name: 'holiday_job_type',
    type: 'enum',
    enum: HolidayJobType,
    nullable: true,
  })
  holidayJobType?: HolidayJobType;

  // Recurring
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_pattern', type: 'jsonb', nullable: true })
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
    interval: number;
    endDate?: string;
    occurrences?: number;
  };

  @Column({ name: 'recurring_parent_id', type: 'uuid', nullable: true })
  recurringParentId?: string;

  // Seasonal
  @Column({ type: 'enum', enum: Season, nullable: true })
  season?: Season;

  // Commercial-specific
  @Column({ name: 'customer_po_number', length: 100, nullable: true })
  customerPoNumber?: string;

  // Source reference
  @Column({ name: 'source_type', length: 50, nullable: true })
  sourceType?: string;

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

  // Notes
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ name: 'crew_notes', type: 'text', nullable: true })
  crewNotes?: string;

  // Cancellation
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  // Custom fields
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Invoice reference
  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId?: string;

  // Relations
  @OneToMany(() => JobLineItem, (lineItem) => lineItem.job)
  lineItems: JobLineItem[];

  @OneToMany(() => JobAssignment, (assignment) => assignment.job)
  assignments: JobAssignment[];

  @OneToMany(() => JobStatusHistory, (history) => history.job)
  statusHistory: JobStatusHistory[];

  @OneToMany(() => JobPhoto, (photo) => photo.job)
  photos: JobPhoto[];

  @OneToMany(() => JobChecklistItem, (item) => item.job)
  checklistItems: JobChecklistItem[];

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

  @Column({ name: 'service_type', length: 100, nullable: true })
  serviceType?: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity: number;

  @Column({ length: 50, nullable: true })
  unit?: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'unit_price_cents', type: 'int', default: 0 })
  unitPriceCents: number;

  @Column({ name: 'total_cents', type: 'int', default: 0 })
  totalCents: number;

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

  @Column({ length: 50, default: 'member' })
  role: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('job_photos')
@Index(['tenantId', 'jobId'])
@Index(['tenantId', 'propertyId'])
@Index(['tenantId', 'capturedAt'])
export class JobPhoto extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'enum', enum: PhotoTag, default: PhotoTag.BEFORE })
  tag: PhotoTag;

  @Column({ length: 255, nullable: true })
  annotation?: string;

  @Column({ name: 'captured_at', type: 'timestamp', default: () => 'NOW()' })
  capturedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ name: 'captured_by', type: 'uuid', nullable: true })
  capturedBy?: string;

  @Column({ name: 'width_px', type: 'int', nullable: true })
  widthPx?: number;

  @Column({ name: 'height_px', type: 'int', nullable: true })
  heightPx?: number;

  @Column({ name: 'file_size_bytes', type: 'int', nullable: true })
  fileSizeBytes?: number;

  @Column({ name: 'is_uploaded', type: 'boolean', default: false })
  isUploaded: boolean;

  @Column({ name: 'uploaded_at', type: 'timestamp', nullable: true })
  uploadedAt?: Date;
}

@Entity('job_checklist_items')
@Index(['jobId'])
export class JobChecklistItem extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.checklistItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ length: 50 })
  phase: string; // 'pre_job', 'post_job'

  @Column({ length: 255 })
  label: string;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ name: 'completed_by', type: 'uuid', nullable: true })
  completedBy?: string;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
