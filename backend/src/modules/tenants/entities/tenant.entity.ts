import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ name: 'business_name', length: 255, nullable: true })
  businessName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 500, nullable: true })
  website?: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ name: 'primary_color', length: 7, default: '#1890ff' })
  primaryColor: string;

  @Column({ name: 'secondary_color', length: 7, default: '#52c41a' })
  secondaryColor: string;

  @Column({ name: 'custom_domain', length: 255, nullable: true })
  customDomain?: string;

  // Address
  @Column({ name: 'street_address', length: 255, nullable: true })
  streetAddress?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 50, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  @Column({ length: 2, default: 'US' })
  country: string;

  @Column({ length: 50, nullable: true })
  timezone?: string;

  // Business Settings
  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number;

  @Column({ name: 'default_payment_terms', type: 'int', default: 30 })
  defaultPaymentTerms: number;

  @Column({ name: 'estimate_expiry_days', type: 'int', default: 30 })
  estimateExpiryDays: number;

  // QuickBooks Integration
  @Column({ name: 'quickbooks_realm_id', length: 100, nullable: true })
  quickbooksRealmId?: string;

  @Column({ name: 'quickbooks_access_token', type: 'text', nullable: true })
  quickbooksAccessToken?: string;

  @Column({ name: 'quickbooks_refresh_token', type: 'text', nullable: true })
  quickbooksRefreshToken?: string;

  @Column({ name: 'quickbooks_token_expires_at', type: 'timestamp', nullable: true })
  quickbooksTokenExpiresAt?: Date;

  // CompanyCam Integration
  @Column({ name: 'companycam_access_token', type: 'text', nullable: true })
  companycamAccessToken?: string;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  features?: string[];
}
