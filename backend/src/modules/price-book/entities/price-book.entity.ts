import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { PricingType, JobType, Season, SyncStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('services')
@Index(['tenantId', 'isActive'])
@Index(['tenantId', 'category'])
export class Service extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 50, nullable: true })
  code?: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    nullable: true,
  })
  jobType?: JobType;

  // Pricing
  @Column({
    name: 'pricing_type',
    type: 'enum',
    enum: PricingType,
    default: PricingType.FIXED,
  })
  pricingType: PricingType;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @Column({ name: 'unit_of_measure', length: 50, nullable: true })
  unitOfMeasure?: string; // 'each', 'sqft', 'linear_ft', 'hour'

  @Column({ name: 'minimum_charge', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumCharge?: number;

  @Column({ name: 'maximum_charge', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumCharge?: number;

  // Formula-based pricing
  @Column({ type: 'text', nullable: true })
  formula?: string; // e.g., '(sqft * 0.15) + (stories > 1 ? 50 : 0)'

  @Column({ name: 'formula_variables', type: 'jsonb', nullable: true })
  formulaVariables?: Record<string, unknown>;

  // Duration
  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes?: number;

  @Column({ name: 'duration_per_unit_minutes', type: 'int', nullable: true })
  durationPerUnitMinutes?: number;

  // Tax
  @Column({ type: 'boolean', default: true })
  taxable: boolean;

  @Column({ name: 'tax_code', length: 50, nullable: true })
  taxCode?: string;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_visible_to_customers', type: 'boolean', default: true })
  isVisibleToCustomers: boolean;

  // External
  @Column({
    name: 'quickbooks_sync_status',
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  quickbooksSyncStatus: SyncStatus;

  @Column({ name: 'quickbooks_item_id', length: 100, nullable: true })
  quickbooksItemId?: string;

  // Display
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'icon_url', length: 500, nullable: true })
  iconUrl?: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Relations
  @OneToMany(() => PricingRule, (rule) => rule.service)
  pricingRules: PricingRule[];
}

@Entity('pricing_rules')
@Index(['serviceId'])
@Index(['tenantId', 'isActive'])
export class PricingRule extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId?: string;

  @ManyToOne(() => Service, (service) => service.pricingRules, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service?: Service;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Conditions (JSONB for flexibility)
  @Column({ type: 'jsonb' })
  conditions: {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
    value: unknown;
  }[];

  // Action
  @Column({ name: 'action_type', length: 50 })
  actionType: string; // 'multiply', 'add', 'subtract', 'set', 'discount_percent', 'discount_fixed'

  @Column({ name: 'action_value', type: 'decimal', precision: 10, scale: 4 })
  actionValue: number;

  @Column({ name: 'reason', length: 255, nullable: true })
  reason?: string; // e.g., 'Multi-story access fee'

  // Priority
  @Column({ type: 'int', default: 0 })
  priority: number;

  // Applicability
  @Column({ name: 'applies_to_account_types', type: 'text', array: true, nullable: true })
  appliesToAccountTypes?: string[]; // ['residential', 'commercial']

  @Column({ name: 'applies_to_seasons', type: 'enum', enum: Season, array: true, nullable: true })
  appliesToSeasons?: Season[];

  // Date range (for promotional rules)
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

@Entity('packages')
@Index(['tenantId', 'isActive'])
export class Package extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 50, nullable: true })
  code?: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Discount
  @Column({ name: 'discount_type', length: 20, default: 'percent' })
  discountType: 'percent' | 'fixed';

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number;

  // Price override (optional)
  @Column({ name: 'fixed_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedPrice?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Relations
  @OneToMany(() => PackageItem, (item) => item.package)
  items: PackageItem[];
}

@Entity('package_items')
@Index(['packageId'])
export class PackageItem extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'package_id', type: 'uuid' })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  optional: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}

@Entity('seasonal_pricing')
@Index(['tenantId', 'season'])
export class SeasonalPricing extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: Season,
  })
  season: Season;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  multiplier: number;

  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId?: string;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service?: Service;

  @Column({ name: 'applies_to_all_services', type: 'boolean', default: false })
  appliesToAllServices: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('discounts')
@Index(['tenantId', 'code'])
@Index(['tenantId', 'isActive'])
export class Discount extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 50, unique: true, nullable: true })
  code?: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'discount_type', length: 20 })
  discountType: 'percent' | 'fixed';

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  // Limitations
  @Column({ name: 'minimum_order_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderAmount?: number;

  @Column({ name: 'maximum_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount?: number;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit?: number;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'usage_limit_per_customer', type: 'int', nullable: true })
  usageLimitPerCustomer?: number;

  // Applicability
  @Column({ name: 'applies_to_services', type: 'uuid', array: true, nullable: true })
  appliesToServices?: string[];

  @Column({ name: 'applies_to_account_types', type: 'text', array: true, nullable: true })
  appliesToAccountTypes?: string[];

  // Validity
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;
}
