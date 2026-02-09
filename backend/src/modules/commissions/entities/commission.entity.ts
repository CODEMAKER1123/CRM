import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import {
  BusinessLine,
  CommissionRoleType,
  CommissionBase,
  CommissionTrigger,
  CommissionStatus,
  BonusMetric,
  BonusPeriod,
} from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('commission_rules')
@Index(['tenantId', 'roleType'])
@Index(['tenantId', 'isActive'])
export class CommissionRule extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: CommissionRoleType,
  })
  roleType: CommissionRoleType;

  @Column({
    name: 'business_line',
    type: 'enum',
    enum: BusinessLine,
    nullable: true,
  })
  businessLine?: BusinessLine;

  // Rule conditions (JSON structure for flexible matching)
  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  rate: number;

  @Column({
    type: 'enum',
    enum: CommissionBase,
    default: CommissionBase.GROSS_REVENUE,
  })
  base: CommissionBase;

  @Column({
    type: 'enum',
    enum: CommissionTrigger,
    default: CommissionTrigger.ON_JOB_COMPLETE,
  })
  trigger: CommissionTrigger;

  @Column({ name: 'deductible_expense_categories', type: 'text', array: true, nullable: true })
  deductibleExpenseCategories?: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'effective_date', type: 'timestamp', default: () => 'NOW()' })
  effectiveDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
  previousVersionId?: string;
}

@Entity('bonus_rules')
@Index(['tenantId', 'roleType'])
@Index(['tenantId', 'isActive'])
export class BonusRule extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: CommissionRoleType,
  })
  roleType: CommissionRoleType;

  @Column({
    name: 'business_line',
    type: 'enum',
    enum: BusinessLine,
    nullable: true,
  })
  businessLine?: BusinessLine;

  @Column({
    type: 'enum',
    enum: BonusMetric,
  })
  metric: BonusMetric;

  @Column({ name: 'threshold_cents', type: 'int', nullable: true })
  thresholdCents?: number;

  @Column({ name: 'threshold_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  thresholdValue?: number;

  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, unknown>;

  @Column({ name: 'bonus_amount_cents', type: 'int' })
  bonusAmountCents: number;

  @Column({
    type: 'enum',
    enum: BonusPeriod,
    default: BonusPeriod.MONTHLY,
  })
  period: BonusPeriod;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'effective_date', type: 'timestamp', default: () => 'NOW()' })
  effectiveDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;
}

@Entity('commission_records')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'jobId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'payPeriodStart', 'payPeriodEnd'])
export class CommissionRecord extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId?: string;

  @Column({ name: 'rule_id', type: 'uuid' })
  ruleId: string;

  @ManyToOne(() => CommissionRule)
  @JoinColumn({ name: 'rule_id' })
  rule: CommissionRule;

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: CommissionRoleType,
  })
  roleType: CommissionRoleType;

  @Column({ name: 'pay_period_start', type: 'timestamp' })
  payPeriodStart: Date;

  @Column({ name: 'pay_period_end', type: 'timestamp' })
  payPeriodEnd: Date;

  @Column({ name: 'gross_revenue_cents', type: 'int' })
  grossRevenueCents: number;

  @Column({ name: 'deductions_cents', type: 'int', default: 0 })
  deductionsCents: number;

  @Column({ name: 'commission_base_cents', type: 'int' })
  commissionBaseCents: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 4 })
  commissionRate: number;

  @Column({ name: 'commission_cents', type: 'int' })
  commissionCents: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('bonus_records')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
export class BonusRecord extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'rule_id', type: 'uuid' })
  ruleId: string;

  @ManyToOne(() => BonusRule)
  @JoinColumn({ name: 'rule_id' })
  rule: BonusRule;

  @Column({ name: 'period_start', type: 'timestamp' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamp' })
  periodEnd: Date;

  @Column({ name: 'metric_value_cents', type: 'int', nullable: true })
  metricValueCents?: number;

  @Column({ name: 'threshold_cents', type: 'int', nullable: true })
  thresholdCents?: number;

  @Column({ name: 'bonus_amount_cents', type: 'int' })
  bonusAmountCents: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'trigger_details', type: 'text', nullable: true })
  triggerDetails?: string;
}

@Entity('job_expenses')
@Index(['jobId'])
export class JobExpense extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents: number;

  @Column({ length: 255, nullable: true })
  vendor?: string;

  @Column({ name: 'receipt_url', length: 500, nullable: true })
  receiptUrl?: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;
}
