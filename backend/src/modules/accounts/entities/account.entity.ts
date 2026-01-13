import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { AccountType, LeadSource } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Contact } from '@/modules/contacts/entities/contact.entity';
import { Address } from '@/modules/addresses/entities/address.entity';
import { Job } from '@/modules/jobs/entities/job.entity';
import { Estimate } from '@/modules/estimates/entities/estimate.entity';
import { Invoice } from '@/modules/invoices/entities/invoice.entity';

@Entity('accounts')
@Index(['tenantId', 'accountType'])
@Index(['tenantId', 'createdAt'])
export class Account extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'account_number', length: 50, nullable: true })
  accountNumber?: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'display_name', length: 255, nullable: true })
  displayName?: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
    default: AccountType.RESIDENTIAL,
  })
  accountType: AccountType;

  // Company info for commercial accounts
  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName?: string;

  @Column({ length: 255, nullable: true })
  industry?: string;

  // Primary contact info (denormalized for quick access)
  @Column({ name: 'primary_email', length: 255, nullable: true })
  primaryEmail?: string;

  @Column({ name: 'primary_phone', length: 20, nullable: true })
  primaryPhone?: string;

  // Lead source tracking
  @Column({
    name: 'lead_source',
    type: 'enum',
    enum: LeadSource,
    nullable: true,
  })
  leadSource?: LeadSource;

  @Column({ name: 'lead_source_detail', length: 255, nullable: true })
  leadSourceDetail?: string;

  @Column({ name: 'referred_by_account_id', type: 'uuid', nullable: true })
  referredByAccountId?: string;

  // Financial
  @Column({
    name: 'lifetime_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  lifetimeValue: number;

  @Column({
    name: 'outstanding_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  outstandingBalance: number;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditLimit?: number;

  @Column({ name: 'payment_terms', type: 'int', nullable: true })
  paymentTerms?: number;

  // Tax
  @Column({ name: 'tax_exempt', type: 'boolean', default: false })
  taxExempt: boolean;

  @Column({ name: 'tax_id', length: 50, nullable: true })
  taxId?: string;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'do_not_contact', type: 'boolean', default: false })
  doNotContact: boolean;

  // QuickBooks
  @Column({ name: 'quickbooks_id', length: 100, nullable: true })
  quickbooksId?: string;

  @Column({ name: 'quickbooks_sync_token', length: 50, nullable: true })
  quickbooksSyncToken?: string;

  // Notes and custom fields
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Relations
  @OneToMany(() => Contact, (contact) => contact.account)
  contacts: Contact[];

  @OneToMany(() => Address, (address) => address.account)
  addresses: Address[];

  @OneToMany(() => Job, (job) => job.account)
  jobs: Job[];

  @OneToMany(() => Estimate, (estimate) => estimate.account)
  estimates: Estimate[];

  @OneToMany(() => Invoice, (invoice) => invoice.account)
  invoices: Invoice[];
}
