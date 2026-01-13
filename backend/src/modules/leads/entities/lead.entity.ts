import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Contact } from '@/modules/contacts/entities/contact.entity';
import { Address } from '@/modules/addresses/entities/address.entity';

// Lead types - determines which pipeline to use
export enum LeadType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
}

// Residential pipeline stages
export enum ResidentialPipelineStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  ESTIMATE_PROVIDED = 'estimate_provided',
  FOLLOW_UP = 'follow_up',
  NEGOTIATING = 'negotiating',
  WON = 'won',
  LOST = 'lost',
}

// Commercial pipeline stages (longer sales cycle)
export enum CommercialPipelineStage {
  NEW = 'new',
  INITIAL_CONTACT = 'initial_contact',
  DISCOVERY_CALL = 'discovery_call',
  SITE_VISIT_SCHEDULED = 'site_visit_scheduled',
  SITE_VISIT_COMPLETED = 'site_visit_completed',
  PROPOSAL_SENT = 'proposal_sent',
  PROPOSAL_REVIEW = 'proposal_review',
  CONTRACT_NEGOTIATION = 'contract_negotiation',
  DECISION_PENDING = 'decision_pending',
  WON = 'won',
  LOST = 'lost',
}

// Lead temperature/score
export enum LeadTemperature {
  COLD = 'cold',
  WARM = 'warm',
  HOT = 'hot',
}

// Lead source tracking
export enum LeadSource {
  WEBSITE = 'website',
  GOOGLE_ADS = 'google_ads',
  FACEBOOK_ADS = 'facebook_ads',
  REFERRAL = 'referral',
  DOOR_TO_DOOR = 'door_to_door',
  YARD_SIGN = 'yard_sign',
  DIRECT_MAIL = 'direct_mail',
  PHONE_CALL = 'phone_call',
  EMAIL_CAMPAIGN = 'email_campaign',
  TRADE_SHOW = 'trade_show',
  PARTNER = 'partner',
  OTHER = 'other',
}

@Entity('leads')
@Index(['tenantId', 'leadType', 'pipelineStage'])
@Index(['tenantId', 'assignedToId'])
@Index(['tenantId', 'temperature'])
@Index(['tenantId', 'source'])
@Index(['tenantId', 'nextFollowUpAt'])
export class Lead extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Lead classification
  @Column({ name: 'lead_type', type: 'varchar', length: 50 })
  leadType: LeadType;

  @Column({ name: 'pipeline_stage', type: 'varchar', length: 50 })
  pipelineStage: string; // ResidentialPipelineStage | CommercialPipelineStage

  @Column({ type: 'varchar', length: 50, default: LeadTemperature.WARM })
  temperature: LeadTemperature;

  // Contact Information (before account/contact is created)
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName?: string;

  // Address (before formal address is created)
  @Column({ name: 'street_address', length: 255, nullable: true })
  streetAddress?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 50, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  // Source and attribution
  @Column({ type: 'varchar', length: 50 })
  source: LeadSource;

  @Column({ name: 'source_detail', length: 255, nullable: true })
  sourceDetail?: string; // e.g., "Google Ads - Power Washing Campaign"

  @Column({ name: 'referral_source', length: 255, nullable: true })
  referralSource?: string; // Name of referrer if referral

  @Column({ name: 'utm_source', length: 100, nullable: true })
  utmSource?: string;

  @Column({ name: 'utm_medium', length: 100, nullable: true })
  utmMedium?: string;

  @Column({ name: 'utm_campaign', length: 100, nullable: true })
  utmCampaign?: string;

  // Services interested in
  @Column({ name: 'services_interested', type: 'text', array: true, nullable: true })
  servicesInterested?: string[];

  @Column({ name: 'estimated_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue?: number;

  // Lead scoring
  @Column({ name: 'lead_score', type: 'int', default: 0 })
  leadScore: number;

  @Column({ name: 'score_factors', type: 'jsonb', nullable: true })
  scoreFactors?: Record<string, number>; // { "website_visit": 5, "email_open": 10, etc. }

  // Assignment
  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId?: string;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt?: Date;

  // Follow-up tracking
  @Column({ name: 'next_follow_up_at', type: 'timestamp', nullable: true })
  nextFollowUpAt?: Date;

  @Column({ name: 'follow_up_count', type: 'int', default: 0 })
  followUpCount: number;

  @Column({ name: 'last_contacted_at', type: 'timestamp', nullable: true })
  lastContactedAt?: Date;

  @Column({ name: 'last_contact_method', length: 50, nullable: true })
  lastContactMethod?: string; // 'phone', 'email', 'sms', 'in_person'

  // Marketing automation
  @Column({ name: 'drip_sequence_id', type: 'uuid', nullable: true })
  dripSequenceId?: string;

  @Column({ name: 'drip_sequence_step', type: 'int', nullable: true })
  dripSequenceStep?: number;

  @Column({ name: 'opted_out_marketing', type: 'boolean', default: false })
  optedOutMarketing: boolean;

  // Conversion tracking
  @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
  convertedAt?: Date;

  @Column({ name: 'converted_to_account_id', type: 'uuid', nullable: true })
  convertedToAccountId?: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'converted_to_account_id' })
  convertedToAccount?: Account;

  @Column({ name: 'converted_to_job_id', type: 'uuid', nullable: true })
  convertedToJobId?: string;

  // Lost lead tracking
  @Column({ name: 'lost_reason', length: 255, nullable: true })
  lostReason?: string;

  @Column({ name: 'lost_to_competitor', length: 255, nullable: true })
  lostToCompetitor?: string;

  @Column({ name: 'lost_at', type: 'timestamp', nullable: true })
  lostAt?: Date;

  // Notes and description
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  description?: string; // What they're looking for

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  // Custom fields for flexibility
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;
}

// Lead Activity/Timeline
@Entity('lead_activities')
@Index(['tenantId', 'leadId', 'createdAt'])
export class LeadActivity extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'lead_id', type: 'uuid' })
  leadId: string;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'activity_type', length: 50 })
  activityType: string; // 'note', 'call', 'email', 'sms', 'meeting', 'stage_change', 'score_change'

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // For stage changes
  @Column({ name: 'old_value', length: 100, nullable: true })
  oldValue?: string;

  @Column({ name: 'new_value', length: 100, nullable: true })
  newValue?: string;

  // For communication activities
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'communication_direction', length: 20, nullable: true })
  communicationDirection?: string; // 'inbound', 'outbound'

  // User who performed the activity
  @Column({ name: 'performed_by_id', type: 'uuid', nullable: true })
  performedById?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

// Pipeline Stage Configuration (per tenant, per lead type)
@Entity('lead_pipeline_configs')
@Index(['tenantId', 'leadType'])
export class LeadPipelineConfig extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'lead_type', type: 'varchar', length: 50 })
  leadType: LeadType;

  @Column({ length: 100 })
  stage: string;

  @Column({ name: 'stage_order', type: 'int' })
  stageOrder: number;

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ length: 50, default: '#1890ff' })
  color: string;

  // Auto-assign drip sequence when entering this stage
  @Column({ name: 'auto_drip_sequence_id', type: 'uuid', nullable: true })
  autoDripSequenceId?: string;

  // Auto follow-up configuration
  @Column({ name: 'auto_follow_up_days', type: 'int', nullable: true })
  autoFollowUpDays?: number;

  // SLA - max days in this stage before alert
  @Column({ name: 'sla_days', type: 'int', nullable: true })
  slaDays?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_won_stage', type: 'boolean', default: false })
  isWonStage: boolean;

  @Column({ name: 'is_lost_stage', type: 'boolean', default: false })
  isLostStage: boolean;
}
