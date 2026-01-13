import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { UserRole } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('users')
@Index(['tenantId', 'email'])
@Index(['tenantId', 'isActive'])
@Index(['clerkUserId'])
export class User extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'clerk_user_id', length: 255, unique: true, nullable: true })
  clerkUserId?: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FIELD_CREW,
  })
  role: UserRole;

  // Granular permissions (overrides role defaults)
  @Column({ type: 'text', array: true, nullable: true })
  permissions?: string[];

  // Territory/Scope restrictions
  @Column({ name: 'territory_restrictions', type: 'text', array: true, nullable: true })
  territoryRestrictions?: string[];

  @Column({ name: 'can_access_all_territories', type: 'boolean', default: false })
  canAccessAllTerritories: boolean;

  // Linked entities
  @Column({ name: 'crew_member_id', type: 'uuid', nullable: true })
  crewMemberId?: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string; // For customer portal users

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled: boolean;

  // Login tracking
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'last_login_ip', length: 50, nullable: true })
  lastLoginIp?: string;

  @Column({ name: 'login_count', type: 'int', default: 0 })
  loginCount: number;

  // Preferences
  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    dateFormat?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}

@Entity('user_sessions')
@Index(['userId'])
@Index(['expiresAt'])
export class UserSession extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_token', length: 255, unique: true })
  sessionToken: string;

  @Column({ name: 'refresh_token', length: 255, nullable: true })
  refreshToken?: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
  };

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp', default: () => 'NOW()' })
  lastActivityAt: Date;

  @Column({ name: 'is_valid', type: 'boolean', default: true })
  isValid: boolean;
}

@Entity('audit_logs')
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['tenantId', 'userId', 'createdAt'])
@Index(['tenantId', 'action', 'createdAt'])
export class AuditLog extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'user_email', length: 255, nullable: true })
  userEmail?: string;

  @Column({ name: 'user_name', length: 255, nullable: true })
  userName?: string;

  @Column({ length: 100 })
  action: string; // 'create', 'update', 'delete', 'login', 'logout', 'view', 'export'

  @Column({ name: 'entity_type', length: 100 })
  entityType: string; // 'job', 'account', 'invoice', etc.

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ name: 'entity_name', length: 255, nullable: true })
  entityName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Change tracking
  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: Record<string, unknown>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: Record<string, unknown>;

  @Column({ name: 'changed_fields', type: 'text', array: true, nullable: true })
  changedFields?: string[];

  // Request context
  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'request_id', length: 100, nullable: true })
  requestId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('api_keys')
@Index(['tenantId', 'isActive'])
@Index(['keyHash'])
export class ApiKey extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'key_prefix', length: 10 })
  keyPrefix: string; // First 8 chars for identification

  @Column({ name: 'key_hash', length: 255 })
  keyHash: string; // SHA-256 hash of the full key

  @Column({ type: 'text', array: true, nullable: true })
  scopes?: string[]; // ['read:jobs', 'write:invoices']

  @Column({ name: 'rate_limit', type: 'int', default: 1000 })
  rateLimit: number; // Requests per minute

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
