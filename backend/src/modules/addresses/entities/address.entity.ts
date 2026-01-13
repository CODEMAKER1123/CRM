import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { AddressType } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Account } from '@/modules/accounts/entities/account.entity';

@Entity('addresses')
@Index(['tenantId', 'accountId'])
@Index(['tenantId', 'addressType'])
export class Address extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ length: 100, nullable: true })
  label?: string; // e.g., "Main Office", "Warehouse", "Home"

  @Column({
    name: 'address_type',
    type: 'enum',
    enum: AddressType,
    default: AddressType.SERVICE,
  })
  addressType: AddressType;

  @Column({ name: 'street_address_1', length: 255 })
  streetAddress1: string;

  @Column({ name: 'street_address_2', length: 255, nullable: true })
  streetAddress2?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 50 })
  state: string;

  @Column({ name: 'postal_code', length: 20 })
  postalCode: string;

  @Column({ length: 2, default: 'US' })
  country: string;

  // Geolocation for routing (stored as lat/lng, can add PostGIS GEOGRAPHY later)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Geocoding status
  @Column({ name: 'geocoded', type: 'boolean', default: false })
  geocoded: boolean;

  @Column({ name: 'geocode_accuracy', length: 50, nullable: true })
  geocodeAccuracy?: string;

  // Property details (for service pricing)
  @Column({ name: 'property_sqft', type: 'int', nullable: true })
  propertySqft?: number;

  @Column({ name: 'linear_footage', type: 'int', nullable: true })
  linearFootage?: number;

  @Column({ type: 'int', default: 1 })
  stories: number;

  @Column({ name: 'has_pool', type: 'boolean', default: false })
  hasPool: boolean;

  @Column({ name: 'has_deck', type: 'boolean', default: false })
  hasDeck: boolean;

  @Column({ name: 'has_fence', type: 'boolean', default: false })
  hasFence: boolean;

  @Column({ name: 'roof_type', length: 50, nullable: true })
  roofType?: string;

  @Column({ name: 'siding_type', length: 50, nullable: true })
  sidingType?: string;

  // Access information
  @Column({ name: 'gate_code', length: 50, nullable: true })
  gateCode?: string;

  @Column({ name: 'access_notes', type: 'text', nullable: true })
  accessNotes?: string;

  @Column({ name: 'parking_instructions', type: 'text', nullable: true })
  parkingInstructions?: string;

  @Column({ name: 'has_dog', type: 'boolean', default: false })
  hasDog: boolean;

  @Column({ name: 'dog_notes', length: 255, nullable: true })
  dogNotes?: string;

  // Service territory
  @Column({ name: 'service_territory', length: 100, nullable: true })
  serviceTerritory?: string;

  // Primary flag
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  // Additional metadata
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Formatted address helper
  get formattedAddress(): string {
    const parts = [this.streetAddress1];
    if (this.streetAddress2) parts.push(this.streetAddress2);
    parts.push(`${this.city}, ${this.state} ${this.postalCode}`);
    return parts.join(', ');
  }
}
