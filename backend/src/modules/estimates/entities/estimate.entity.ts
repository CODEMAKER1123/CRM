import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { EstimateStatus, SyncStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Address } from '@/modules/addresses/entities/address.entity';

@Entity('estimates')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'createdAt'])
export class Estimate extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'estimate_number', length: 50, unique: true, nullable: true })
  estimateNumber?: string;

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

  // Financial
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_type', length: 20, nullable: true })
  discountType?: 'percent' | 'fixed';

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // Deposit
  @Column({ name: 'deposit_required', type: 'boolean', default: false })
  depositRequired: boolean;

  @Column({ name: 'deposit_type', length: 20, nullable: true })
  depositType?: 'percent' | 'fixed';

  @Column({ name: 'deposit_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositValue: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount: number;

  // Dates
  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt?: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
  convertedAt?: Date;

  // Approval
  @Column({ name: 'approved_by_name', length: 255, nullable: true })
  approvedByName?: string;

  @Column({ name: 'approved_by_email', length: 255, nullable: true })
  approvedByEmail?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

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

  // Notes and terms
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions?: string;

  // Good-Better-Best options
  @Column({ name: 'pricing_options', type: 'jsonb', nullable: true })
  pricingOptions?: {
    standard?: { total: number; description: string };
    premium?: { total: number; description: string };
    ultimate?: { total: number; description: string };
  };

  @Column({ name: 'selected_option', length: 50, nullable: true })
  selectedOption?: string;

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

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_of_measure', length: 50, nullable: true })
  unitOfMeasure?: string;

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

  @Column({ type: 'boolean', default: false })
  optional: boolean;

  @Column({ name: 'pricing_option', length: 50, nullable: true })
  pricingOption?: string; // 'standard', 'premium', 'ultimate'

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
  signatureData: string; // Base64 encoded signature image

  @Column({ name: 'signature_type', length: 50, default: 'drawn' })
  signatureType: string; // 'drawn', 'typed', 'uploaded'

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'signed_at', type: 'timestamp', default: () => 'NOW()' })
  signedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
