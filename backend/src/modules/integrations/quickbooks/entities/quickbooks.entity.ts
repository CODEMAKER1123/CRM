import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { SyncStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('quickbooks_connections')
@Index(['tenantId'])
export class QuickBooksConnection extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'realm_id', length: 100 })
  realmId: string;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName?: string;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string;

  @Column({ name: 'token_expires_at', type: 'timestamp' })
  tokenExpiresAt: Date;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamp', nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column({ name: 'sync_status', length: 50, default: 'idle' })
  syncStatus: string;

  @Column({ name: 'sync_error', type: 'text', nullable: true })
  syncError?: string;

  // Settings
  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    autoSyncCustomers?: boolean;
    autoSyncInvoices?: boolean;
    autoSyncPayments?: boolean;
    syncInterval?: number;
    defaultIncomeAccountId?: string;
    defaultAssetAccountId?: string;
    defaultTaxCodeId?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('quickbooks_entity_mappings')
@Index(['tenantId', 'localEntityType', 'localEntityId'])
@Index(['tenantId', 'qboEntityType', 'qboEntityId'])
export class QuickBooksEntityMapping extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'local_entity_type', length: 100 })
  localEntityType: string; // 'account', 'invoice', 'payment', 'service'

  @Column({ name: 'local_entity_id', type: 'uuid' })
  localEntityId: string;

  @Column({ name: 'qbo_entity_type', length: 100 })
  qboEntityType: string; // 'Customer', 'Invoice', 'Payment', 'Item'

  @Column({ name: 'qbo_entity_id', length: 100 })
  qboEntityId: string;

  @Column({ name: 'sync_token', length: 50, nullable: true })
  syncToken?: string;

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.SYNCED,
  })
  syncStatus: SyncStatus;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @Column({ name: 'last_local_update', type: 'timestamp', nullable: true })
  lastLocalUpdate?: Date;

  @Column({ name: 'last_qbo_update', type: 'timestamp', nullable: true })
  lastQboUpdate?: Date;

  @Column({ name: 'sync_error', type: 'text', nullable: true })
  syncError?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('quickbooks_sync_logs')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'entityType', 'status'])
export class QuickBooksSyncLog extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'sync_type', length: 50 })
  syncType: string; // 'push', 'pull', 'webhook'

  @Column({ name: 'entity_type', length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ name: 'qbo_entity_id', length: 100, nullable: true })
  qboEntityId?: string;

  @Column({ length: 50 })
  status: string; // 'success', 'error', 'skipped'

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'error_code', length: 50, nullable: true })
  errorCode?: string;

  @Column({ name: 'request_data', type: 'jsonb', nullable: true })
  requestData?: Record<string, unknown>;

  @Column({ name: 'response_data', type: 'jsonb', nullable: true })
  responseData?: Record<string, unknown>;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs?: number;
}
