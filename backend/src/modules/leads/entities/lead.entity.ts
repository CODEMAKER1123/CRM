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
  BusinessLine,
  PipelineType,
  LeadSourceType,
  LossReason,
  ActivityType,
  ActivityDirection,
} from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Address } from '@/modules/addresses/entities/address.entity';

@Entity('leads')
@Index(['tenantId', 'stage'])
@Index(['tenantId', 'businessLine'])
@Index(['tenantId', 'pipeline'])
@Index(['tenantId', 'assignedRepId'])
@Index(['tenantId', 'createdAt'])
export class Lead extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId?: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId?: string;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: Address;

  @Column({ length: 100 })
  source: string;

  @Column({ name: 'source_detail', length: 255, nullable: true })
  sourceDetail?: string;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: LeadSourceType,
    default: LeadSourceType.COMPANY_GENERATED,
  })
  sourceType: LeadSourceType;

  @Column({ name: 'is_new_business', type: 'boolean', default: true })
  isNewBusiness: boolean;

  @Column({
    name: 'business_line',
    type: 'enum',
    enum: BusinessLine,
    default: BusinessLine.POWER_WASH,
  })
  businessLine: BusinessLine;

  @Column({
    type: 'enum',
    enum: PipelineType,
    default: PipelineType.RESIDENTIAL,
  })
  pipeline: PipelineType;

  @Column({ length: 50, default: 'new' })
  stage: string;

  @Column({ name: 'assigned_rep_id', type: 'uuid', nullable: true })
  assignedRepId?: string;

  @Column({ name: 'territory_id', type: 'uuid', nullable: true })
  territoryId?: string;

  @Column({ name: 'first_contact_at', type: 'timestamp', nullable: true })
  firstContactAt?: Date;

  @Column({ name: 'minutes_to_first_contact', type: 'int', nullable: true })
  minutesToFirstContact?: number;

  // Contact info (before account is linked)
  @Column({ name: 'contact_name', length: 255, nullable: true })
  contactName?: string;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail?: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone?: string;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName?: string;

  // Address (before property is linked)
  @Column({ name: 'address_line_1', length: 255, nullable: true })
  addressLine1?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 50, nullable: true })
  state?: string;

  @Column({ length: 20, nullable: true })
  zip?: string;

  // Loss tracking
  @Column({
    name: 'loss_reason',
    type: 'enum',
    enum: LossReason,
    nullable: true,
  })
  lossReason?: LossReason;

  @Column({ name: 'loss_notes', type: 'text', nullable: true })
  lossNotes?: string;

  @Column({ name: 'lost_at', type: 'timestamp', nullable: true })
  lostAt?: Date;

  @Column({ name: 'won_at', type: 'timestamp', nullable: true })
  wonAt?: Date;

  // Converted job reference
  @Column({ name: 'converted_job_id', type: 'uuid', nullable: true })
  convertedJobId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Relations
  @OneToMany(() => Activity, (activity) => activity.lead)
  activities: Activity[];

  @OneToMany(() => LeadStageHistory, (history) => history.lead)
  stageHistory: LeadStageHistory[];
}

@Entity('activities')
@Index(['tenantId', 'leadId'])
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'jobId'])
@Index(['tenantId', 'createdAt'])
export class Activity extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId?: string;

  @ManyToOne(() => Lead, (lead) => lead.activities, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead?: Lead;

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId?: string;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId?: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityDirection,
    nullable: true,
  })
  direction?: ActivityDirection;

  @Column({ length: 255, nullable: true })
  subject?: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ length: 255, nullable: true })
  outcome?: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;
}

@Entity('lead_stage_history')
@Index(['leadId', 'changedAt'])
export class LeadStageHistory extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'lead_id', type: 'uuid' })
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.stageHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'from_stage', length: 50, nullable: true })
  fromStage?: string;

  @Column({ name: 'to_stage', length: 50 })
  toStage: string;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy?: string;

  @Column({ name: 'changed_at', type: 'timestamp', default: () => 'NOW()' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
