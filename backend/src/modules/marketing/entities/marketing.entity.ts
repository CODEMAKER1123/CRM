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
  CampaignType,
  CampaignStatus,
  AutomationTriggerType,
  AutomationActionType,
  EnrollmentStatus,
} from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Contact } from '@/modules/contacts/entities/contact.entity';

@Entity('email_templates')
@Index(['tenantId', 'isActive'])
export class EmailTemplate extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ name: 'preview_text', length: 255, nullable: true })
  previewText?: string;

  @Column({ name: 'html_content', type: 'text' })
  htmlContent: string;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent?: string;

  @Column({ length: 100, nullable: true })
  category?: string; // 'transactional', 'marketing', 'follow-up'

  @Column({ name: 'template_type', length: 50, default: 'custom' })
  templateType: string; // 'custom', 'system', 'estimate', 'invoice', 'reminder'

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Variables available in template
  @Column({ type: 'text', array: true, nullable: true })
  variables?: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;
}

@Entity('sms_templates')
@Index(['tenantId', 'isActive'])
export class SmsTemplate extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ name: 'template_type', length: 50, default: 'custom' })
  templateType: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  variables?: string[];
}

@Entity('campaigns')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'scheduledAt'])
export class Campaign extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.EMAIL,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  // Content
  @Column({ name: 'email_template_id', type: 'uuid', nullable: true })
  emailTemplateId?: string;

  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'email_template_id' })
  emailTemplate?: EmailTemplate;

  @Column({ name: 'sms_template_id', type: 'uuid', nullable: true })
  smsTemplateId?: string;

  @ManyToOne(() => SmsTemplate, { nullable: true })
  @JoinColumn({ name: 'sms_template_id' })
  smsTemplate?: SmsTemplate;

  // Subject line (for email, can override template)
  @Column({ length: 255, nullable: true })
  subject?: string;

  // Audience
  @Column({ name: 'audience_filter', type: 'jsonb', nullable: true })
  audienceFilter?: Record<string, unknown>;

  @Column({ name: 'segment_id', type: 'uuid', nullable: true })
  segmentId?: string;

  @Column({ name: 'recipient_count', type: 'int', default: 0 })
  recipientCount: number;

  // Scheduling
  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  // A/B Testing
  @Column({ name: 'is_ab_test', type: 'boolean', default: false })
  isAbTest: boolean;

  @Column({ name: 'ab_test_config', type: 'jsonb', nullable: true })
  abTestConfig?: {
    variants: { name: string; subject?: string; templateId?: string; percentage: number }[];
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion';
    testDuration: number;
  };

  // Metrics
  @Column({ name: 'sent_count', type: 'int', default: 0 })
  sentCount: number;

  @Column({ name: 'delivered_count', type: 'int', default: 0 })
  deliveredCount: number;

  @Column({ name: 'open_count', type: 'int', default: 0 })
  openCount: number;

  @Column({ name: 'click_count', type: 'int', default: 0 })
  clickCount: number;

  @Column({ name: 'bounce_count', type: 'int', default: 0 })
  bounceCount: number;

  @Column({ name: 'unsubscribe_count', type: 'int', default: 0 })
  unsubscribeCount: number;

  @Column({ name: 'complaint_count', type: 'int', default: 0 })
  complaintCount: number;

  @Column({ name: 'conversion_count', type: 'int', default: 0 })
  conversionCount: number;

  @Column({ name: 'revenue_generated', type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenueGenerated: number;

  // Settings
  @Column({ name: 'from_name', length: 255, nullable: true })
  fromName?: string;

  @Column({ name: 'from_email', length: 255, nullable: true })
  fromEmail?: string;

  @Column({ name: 'reply_to', length: 255, nullable: true })
  replyTo?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];
}

@Entity('automation_sequences')
@Index(['tenantId', 'isActive'])
export class AutomationSequence extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'trigger_type',
    type: 'enum',
    enum: AutomationTriggerType,
  })
  triggerType: AutomationTriggerType;

  // Trigger configuration
  @Column({ name: 'trigger_event', length: 100, nullable: true })
  triggerEvent?: string; // 'job.completed', 'estimate.sent', 'invoice.overdue'

  @Column({ name: 'trigger_conditions', type: 'jsonb', nullable: true })
  triggerConditions?: Record<string, unknown>;

  // Entry conditions
  @Column({ name: 'entry_conditions', type: 'jsonb', nullable: true })
  entryConditions?: Record<string, unknown>;

  // Exit conditions
  @Column({ name: 'exit_conditions', type: 'jsonb', nullable: true })
  exitConditions?: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Metrics
  @Column({ name: 'total_enrolled', type: 'int', default: 0 })
  totalEnrolled: number;

  @Column({ name: 'total_completed', type: 'int', default: 0 })
  totalCompleted: number;

  @Column({ name: 'total_exited', type: 'int', default: 0 })
  totalExited: number;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Relations
  @OneToMany(() => SequenceStep, (step) => step.sequence)
  steps: SequenceStep[];

  @OneToMany(() => SequenceEnrollment, (enrollment) => enrollment.sequence)
  enrollments: SequenceEnrollment[];
}

@Entity('sequence_steps')
@Index(['sequenceId', 'stepOrder'])
export class SequenceStep extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'sequence_id', type: 'uuid' })
  sequenceId: string;

  @ManyToOne(() => AutomationSequence, (sequence) => sequence.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sequence_id' })
  sequence: AutomationSequence;

  @Column({ name: 'step_order', type: 'int' })
  stepOrder: number;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({
    name: 'action_type',
    type: 'enum',
    enum: AutomationActionType,
  })
  actionType: AutomationActionType;

  // Action configuration
  @Column({ name: 'action_config', type: 'jsonb' })
  actionConfig: {
    templateId?: string;
    delayMinutes?: number;
    delayDays?: number;
    field?: string;
    value?: unknown;
    condition?: Record<string, unknown>;
    notificationType?: string;
    notificationRecipients?: string[];
  };

  // Conditional branching
  @Column({ name: 'conditions', type: 'jsonb', nullable: true })
  conditions?: Record<string, unknown>;

  @Column({ name: 'next_step_on_success', type: 'uuid', nullable: true })
  nextStepOnSuccess?: string;

  @Column({ name: 'next_step_on_failure', type: 'uuid', nullable: true })
  nextStepOnFailure?: string;

  // Metrics
  @Column({ name: 'executed_count', type: 'int', default: 0 })
  executedCount: number;

  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount: number;

  @Column({ name: 'failure_count', type: 'int', default: 0 })
  failureCount: number;
}

@Entity('sequence_enrollments')
@Index(['sequenceId', 'contactId'])
@Index(['tenantId', 'status'])
export class SequenceEnrollment extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'sequence_id', type: 'uuid' })
  sequenceId: string;

  @ManyToOne(() => AutomationSequence, (sequence) => sequence.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sequence_id' })
  sequence: AutomationSequence;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId?: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ name: 'current_step_id', type: 'uuid', nullable: true })
  currentStepId?: string;

  @Column({ name: 'current_step_order', type: 'int', default: 0 })
  currentStepOrder: number;

  @Column({ name: 'enrolled_at', type: 'timestamp', default: () => 'NOW()' })
  enrolledAt: Date;

  @Column({ name: 'next_action_at', type: 'timestamp', nullable: true })
  nextActionAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'exited_at', type: 'timestamp', nullable: true })
  exitedAt?: Date;

  @Column({ name: 'exit_reason', type: 'text', nullable: true })
  exitReason?: string;

  // Trigger context
  @Column({ name: 'trigger_entity_type', length: 100, nullable: true })
  triggerEntityType?: string;

  @Column({ name: 'trigger_entity_id', type: 'uuid', nullable: true })
  triggerEntityId?: string;

  @Column({ name: 'context_data', type: 'jsonb', nullable: true })
  contextData?: Record<string, unknown>;
}

@Entity('marketing_events')
@Index(['tenantId', 'contactId'])
@Index(['tenantId', 'eventType', 'createdAt'])
export class MarketingEvent extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId?: string;

  @Column({ name: 'sequence_id', type: 'uuid', nullable: true })
  sequenceId?: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string; // 'email_sent', 'email_opened', 'email_clicked', 'sms_sent', 'sms_delivered', 'unsubscribed'

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  // Email-specific
  @Column({ name: 'message_id', length: 255, nullable: true })
  messageId?: string;

  @Column({ length: 255, nullable: true })
  link?: string;

  // Device/Location
  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ length: 100, nullable: true })
  device?: string;

  @Column({ length: 100, nullable: true })
  location?: string;
}

@Entity('review_requests')
@Index(['tenantId', 'jobId'])
@Index(['tenantId', 'status'])
export class ReviewRequest extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId: string;

  @Column({ length: 50, default: 'pending' })
  status: string; // 'pending', 'sent', 'clicked', 'reviewed', 'expired'

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
  clickedAt?: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ length: 50, nullable: true })
  platform?: string; // 'google', 'yelp', 'facebook', 'internal'

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column({ name: 'review_text', type: 'text', nullable: true })
  reviewText?: string;

  @Column({ name: 'review_url', length: 500, nullable: true })
  reviewUrl?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;
}
