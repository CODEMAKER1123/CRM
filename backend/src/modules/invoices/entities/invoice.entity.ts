import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { InvoiceStatus, SyncStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';
import { Job } from '@/modules/jobs/entities/job.entity';
import { Payment } from '@/modules/payments/entities/payment.entity';

@Entity('invoices')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'dueDate'])
@Index(['tenantId', 'createdAt'])
export class Invoice extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'invoice_number', length: 50, unique: true, nullable: true })
  invoiceNumber?: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'billing_address_id', type: 'uuid', nullable: true })
  billingAddressId?: string;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId?: string;

  @ManyToOne(() => Job, (job) => job.invoices, { nullable: true })
  @JoinColumn({ name: 'job_id' })
  job?: Job;

  @Column({ name: 'estimate_id', type: 'uuid', nullable: true })
  estimateId?: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ length: 255, nullable: true })
  title?: string;

  // Financials
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

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceDue: number;

  // Credits
  @Column({ name: 'credits_applied', type: 'decimal', precision: 10, scale: 2, default: 0 })
  creditsApplied: number;

  // Dates
  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt?: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ name: 'voided_at', type: 'timestamp', nullable: true })
  voidedAt?: Date;

  // Payment terms
  @Column({ name: 'payment_terms', type: 'int', default: 30 })
  paymentTerms: number;

  // Commercial
  @Column({ name: 'customer_po_number', length: 100, nullable: true })
  customerPoNumber?: string;

  // QuickBooks integration
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

  @Column({ name: 'quickbooks_last_sync', type: 'timestamp', nullable: true })
  quickbooksLastSync?: Date;

  @Column({ name: 'quickbooks_sync_error', type: 'text', nullable: true })
  quickbooksSyncError?: string;

  // Stripe
  @Column({ name: 'stripe_invoice_id', length: 100, nullable: true })
  stripeInvoiceId?: string;

  @Column({ name: 'stripe_payment_intent_id', length: 100, nullable: true })
  stripePaymentIntentId?: string;

  @Column({ name: 'stripe_hosted_invoice_url', length: 500, nullable: true })
  stripeHostedInvoiceUrl?: string;

  // Notes
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ name: 'payment_instructions', type: 'text', nullable: true })
  paymentInstructions?: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions?: string;

  // Void reason
  @Column({ name: 'void_reason', type: 'text', nullable: true })
  voidReason?: string;

  // Custom fields
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Relations
  @OneToMany(() => InvoiceLineItem, (lineItem) => lineItem.invoice)
  lineItems: InvoiceLineItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  // Reminder tracking
  @Column({ name: 'reminder_count', type: 'int', default: 0 })
  reminderCount: number;

  @Column({ name: 'last_reminder_sent_at', type: 'timestamp', nullable: true })
  lastReminderSentAt?: Date;

  @Column({ name: 'next_reminder_date', type: 'date', nullable: true })
  nextReminderDate?: Date;
}

@Entity('invoice_line_items')
@Index(['invoiceId'])
export class InvoiceLineItem extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'job_line_item_id', type: 'uuid', nullable: true })
  jobLineItemId?: string;

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

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  // QuickBooks
  @Column({ name: 'quickbooks_item_id', length: 100, nullable: true })
  quickbooksItemId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
