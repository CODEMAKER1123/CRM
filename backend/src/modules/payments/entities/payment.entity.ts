import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { PaymentMethod, PaymentStatus, SyncStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Invoice } from '@/modules/invoices/entities/invoice.entity';

@Entity('payments')
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'invoiceId'])
@Index(['tenantId', 'paymentDate'])
export class Payment extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'payment_number', length: 50, nullable: true })
  paymentNumber?: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId?: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, { nullable: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CREDIT_CARD,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  // Check details
  @Column({ name: 'check_number', length: 50, nullable: true })
  checkNumber?: string;

  @Column({ name: 'check_date', type: 'date', nullable: true })
  checkDate?: Date;

  // Card details (masked)
  @Column({ name: 'card_last_four', length: 4, nullable: true })
  cardLastFour?: string;

  @Column({ name: 'card_brand', length: 50, nullable: true })
  cardBrand?: string;

  // External payment references
  @Column({ name: 'stripe_payment_id', length: 100, nullable: true })
  stripePaymentId?: string;

  @Column({ name: 'stripe_charge_id', length: 100, nullable: true })
  stripeChargeId?: string;

  @Column({ name: 'stripe_refund_id', length: 100, nullable: true })
  stripeRefundId?: string;

  // QuickBooks
  @Column({
    name: 'quickbooks_sync_status',
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  quickbooksSyncStatus: SyncStatus;

  @Column({ name: 'quickbooks_id', length: 100, nullable: true })
  quickbooksId?: string;

  @Column({ name: 'quickbooks_sync_token', length: 50, nullable: true })
  quickbooksSyncToken?: string;

  // Refund information
  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason?: string;

  // Deposit/Prepayment
  @Column({ name: 'is_deposit', type: 'boolean', default: false })
  isDeposit: boolean;

  @Column({ name: 'deposit_for_estimate_id', type: 'uuid', nullable: true })
  depositForEstimateId?: string;

  // Processing fees
  @Column({ name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  netAmount?: number;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  // Reference
  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber?: string;

  // Recorded by
  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy?: string;

  @Column({ name: 'recorded_by_name', length: 255, nullable: true })
  recordedByName?: string;

  // Custom fields
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Error tracking
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'error_code', length: 50, nullable: true })
  errorCode?: string;
}

@Entity('payment_allocations')
@Index(['paymentId'])
@Index(['invoiceId'])
export class PaymentAllocation extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'allocated_at', type: 'timestamp', default: () => 'NOW()' })
  allocatedAt: Date;
}

@Entity('credits')
@Index(['tenantId', 'accountId'])
export class Credit extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'original_amount', type: 'decimal', precision: 10, scale: 2 })
  originalAmount: number;

  @Column({ name: 'remaining_amount', type: 'decimal', precision: 10, scale: 2 })
  remainingAmount: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'source_type', length: 50, nullable: true })
  sourceType?: string; // 'refund', 'overpayment', 'adjustment', 'promotion'

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // QuickBooks
  @Column({ name: 'quickbooks_id', length: 100, nullable: true })
  quickbooksId?: string;
}
