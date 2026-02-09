import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import {
  EstimateStatus,
  EstimateTier,
  DiscountType,
  ApprovalStatus,
  SyncStatus,
  BusinessLine,
} from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Address } from '@/modules/addresses/entities/address.entity';

@Entity('estimates')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'leadId'])
@Index(['tenantId', 'createdAt'])
export class Estimate extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'estimate_number', length: 50, unique: true, nullable: true })
  estimateNumber?: string;

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId?: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.estimates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'service_address_id', type: 'uuid' })
  serviceAddressId: string;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'service_address_id' })
  serviceAddress: Address;

  @Column({
    name: 'business_line',
    type: 'enum',
    enum: BusinessLine,
    default: BusinessLine.POWER_WASH,
  })
  businessLine: BusinessLine;

  // Versioning
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'parent_estimate_id', type: 'uuid', nullable: true })
  parentEstimateId?: string;

  @ManyToOne(() => Estimate, { nullable: true })
  @JoinColumn({ name: 'parent_estimate_id' })
  parentEstimate?: Estimate;

  @OneToMany(() => Estimate, (estimate) => estimate.parentEstimate)
  versions: Estimate[];

  @Column({
    type: 'enum',
    enum: EstimateStatus,
    default: EstimateStatus.DRAFT,
  })
  status: EstimateStatus;

  @Column({ length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Financial (in cents per spec)
  @Column({ name: 'subtotal_cents', type: 'int', default: 0 })
  subtotalCents: number;

  @Column({ name: 'discount_cents', type: 'int', default: 0 })
  discountCents: number;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discountType?: DiscountType;

  @Column({ name: 'tax_cents', type: 'int', default: 0 })
  taxCents: number;

  @Column({ name: 'total_cents', type: 'int', default: 0 })
  totalCents: number;

  // Backward-compat decimal fields
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // Tiered proposals (Good/Better/Best)
  @Column({ type: 'enum', enum: EstimateTier, nullable: true })
  tier?: EstimateTier;

  @Column({ name: 'grouped_with', type: 'uuid', nullable: true })
  groupedWith?: string;

  // Deposit
  @Column({ name: 'deposit_required', type: 'boolean', default: false })
  depositRequired: boolean;

  @Column({ name: 'deposit_percentage', type: 'decimal', precision: 5, scale: 2, default: 50 })
  depositPercentage: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount: number;

  // Recurring
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_frequency', length: 50, nullable: true })
  recurringFrequency?: string;

  @Column({ name: 'recurring_occurrences', type: 'int', nullable: true })
  recurringOccurrences?: number;

  @Column({ name: 'recurring_end_date', type: 'date', nullable: true })
  recurringEndDate?: Date;

  // Dates
  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil?: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt?: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'declined_at', type: 'timestamp', nullable: true })
  declinedAt?: Date;

  @Column({ name: 'decline_reason', type: 'text', nullable: true })
  declineReason?: string;

  // Signature
  @Column({ name: 'signed_at', type: 'timestamp', nullable: true })
  signedAt?: Date;

  @Column({ name: 'signed_by', length: 255, nullable: true })
  signedBy?: string;

  @Column({ name: 'signature_data', type: 'text', nullable: true })
  signatureData?: string;

  // Converted job reference
  @Column({ name: 'converted_job_id', type: 'uuid', nullable: true })
  convertedJobId?: string;

  // Sales rep
  @Column({ name: 'sales_rep_id', type: 'uuid', nullable: true })
  salesRepId?: string;

  @Column({ name: 'sales_rep_name', length: 255, nullable: true })
  salesRepName?: string;

  // External
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
  @Column({ name: 'notes_to_customer', type: 'text', nullable: true })
  notesToCustomer?: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions?: string;

  // Custom fields
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Relations
  @OneToMany(() => EstimateLineItem, (lineItem) => lineItem.estimate)
  lineItems: EstimateLineItem[];

  @OneToMany(() => EstimateApprovalSignature, (signature) => signature.estimate)
  signatures: EstimateApprovalSignature[];

  @OneToOne(() => SaveOffer, (saveOffer) => saveOffer.estimate)
  saveOffer?: SaveOffer;
}

@Entity('estimate_line_items')
@Index(['estimateId'])
export class EstimateLineItem extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'estimate_id', type: 'uuid' })
  estimateId: string;

  @ManyToOne(() => Estimate, (estimate) => estimate.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estimate_id' })
  estimate: Estimate;

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

  @Column({ type: 'boolean', default: false })
  optional: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('estimate_approval_signatures')
@Index(['estimateId'])
export class EstimateApprovalSignature extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'estimate_id', type: 'uuid' })
  estimateId: string;

  @ManyToOne(() => Estimate, (estimate) => estimate.signatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estimate_id' })
  estimate: Estimate;

  @Column({ name: 'signer_name', length: 255 })
  signerName: string;

  @Column({ name: 'signer_email', length: 255 })
  signerEmail: string;

  @Column({ name: 'signature_data', type: 'text' })
  signatureData: string;

  @Column({ name: 'signature_type', length: 50, default: 'drawn' })
  signatureType: string;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'signed_at', type: 'timestamp', default: () => 'NOW()' })
  signedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('save_offers')
@Index(['tenantId', 'estimateId'])
export class SaveOffer extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'estimate_id', type: 'uuid', unique: true })
  estimateId: string;

  @OneToOne(() => Estimate, (estimate) => estimate.saveOffer)
  @JoinColumn({ name: 'estimate_id' })
  estimate: Estimate;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  discountType: DiscountType;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 4 })
  discountPercent: number;

  @Column({ name: 'discount_cents', type: 'int' })
  discountCents: number;

  @Column({ name: 'new_total_cents', type: 'int' })
  newTotalCents: number;

  @Column({ name: 'original_total_cents', type: 'int' })
  originalTotalCents: number;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING_APPROVAL,
  })
  approvalStatus: ApprovalStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'offered_at', type: 'timestamp', default: () => 'NOW()' })
  offeredAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'customer_accepted', type: 'boolean', nullable: true })
  customerAccepted?: boolean;

  @Column({ name: 'customer_responded_at', type: 'timestamp', nullable: true })
  customerRespondedAt?: Date;
}

@Entity('save_offer_rules')
@Index(['tenantId', 'isActive'])
export class SaveOfferRule extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'customer_type', length: 50, nullable: true })
  customerType?: string;

  @Column({
    name: 'business_line',
    type: 'enum',
    enum: BusinessLine,
    nullable: true,
  })
  businessLine?: BusinessLine;

  @Column({ name: 'min_discount_percent', type: 'decimal', precision: 5, scale: 4 })
  minDiscountPercent: number;

  @Column({ name: 'max_discount_percent', type: 'decimal', precision: 5, scale: 4 })
  maxDiscountPercent: number;

  @Column({ name: 'default_discount_percent', type: 'decimal', precision: 5, scale: 4 })
  defaultDiscountPercent: number;

  @Column({ name: 'auto_approve_max_percent', type: 'decimal', precision: 5, scale: 4 })
  autoApproveMaxPercent: number;

  @Column({ name: 'auto_approve_max_cents', type: 'int', nullable: true })
  autoApproveMaxCents?: number;

  @Column({ name: 'trigger_decline_reasons', type: 'text', array: true })
  triggerDeclineReasons: string[];

  @Column({ name: 'max_offers_per_customer', type: 'int', default: 1 })
  maxOffersPerCustomer: number;

  @Column({ name: 'offer_expiration_hours', type: 'int', default: 72 })
  offerExpirationHours: number;

  @Column({ name: 'offer_headline', type: 'text' })
  offerHeadline: string;

  @Column({ name: 'offer_body', type: 'text' })
  offerBody: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
