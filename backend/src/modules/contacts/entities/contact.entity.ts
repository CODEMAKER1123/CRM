import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';

@Entity('contacts')
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'email'])
export class Contact extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'mobile_phone', length: 20, nullable: true })
  mobilePhone?: string;

  @Column({ length: 100, nullable: true })
  title?: string;

  @Column({ length: 100, nullable: true })
  department?: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_billing_contact', type: 'boolean', default: false })
  isBillingContact: boolean;

  @Column({ name: 'receives_marketing', type: 'boolean', default: true })
  receivesMarketing: boolean;

  @Column({ name: 'receives_invoices', type: 'boolean', default: false })
  receivesInvoices: boolean;

  @Column({ name: 'receives_reminders', type: 'boolean', default: true })
  receivesReminders: boolean;

  // Communication preferences
  @Column({ name: 'preferred_contact_method', length: 20, default: 'email' })
  preferredContactMethod: string;

  @Column({ name: 'sms_opt_in', type: 'boolean', default: false })
  smsOptIn: boolean;

  @Column({ name: 'sms_opt_in_date', type: 'timestamp', nullable: true })
  smsOptInDate?: Date;

  @Column({ name: 'sms_opt_out_date', type: 'timestamp', nullable: true })
  smsOptOutDate?: Date;

  @Column({ name: 'email_unsubscribed', type: 'boolean', default: false })
  emailUnsubscribed: boolean;

  @Column({ name: 'email_unsubscribed_date', type: 'timestamp', nullable: true })
  emailUnsubscribedDate?: Date;

  // Portal access
  @Column({ name: 'portal_user_id', length: 255, nullable: true })
  portalUserId?: string;

  @Column({ name: 'portal_last_login', type: 'timestamp', nullable: true })
  portalLastLogin?: Date;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // QuickBooks sync
  @Column({ name: 'quickbooks_id', length: 100, nullable: true })
  quickbooksId?: string;

  // Computed property
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
