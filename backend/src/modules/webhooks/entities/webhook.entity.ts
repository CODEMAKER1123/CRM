import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('webhooks')
@Index(['tenantId', 'isActive'])
export class Webhook extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 255, nullable: true })
  secret?: string;

  // Events to subscribe to
  @Column({ type: 'text', array: true })
  events: string[]; // ['job.created', 'job.completed', 'invoice.paid']

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Retry configuration
  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  @Column({ name: 'retry_delay_seconds', type: 'int', default: 60 })
  retryDelaySeconds: number;

  // Headers to include
  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  // Stats
  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount: number;

  @Column({ name: 'failure_count', type: 'int', default: 0 })
  failureCount: number;

  @Column({ name: 'last_triggered_at', type: 'timestamp', nullable: true })
  lastTriggeredAt?: Date;

  @Column({ name: 'last_success_at', type: 'timestamp', nullable: true })
  lastSuccessAt?: Date;

  @Column({ name: 'last_failure_at', type: 'timestamp', nullable: true })
  lastFailureAt?: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('webhook_deliveries')
@Index(['webhookId', 'createdAt'])
@Index(['tenantId', 'status', 'createdAt'])
export class WebhookDelivery extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'webhook_id', type: 'uuid' })
  webhookId: string;

  @ManyToOne(() => Webhook, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhook_id' })
  webhook: Webhook;

  @Column({ length: 100 })
  event: string;

  @Column({ name: 'entity_type', length: 100, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ length: 50 })
  status: string; // 'pending', 'success', 'failed', 'retrying'

  @Column({ name: 'http_status', type: 'int', nullable: true })
  httpStatus?: number;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody?: string;

  @Column({ name: 'response_headers', type: 'jsonb', nullable: true })
  responseHeaders?: Record<string, string>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'attempt_count', type: 'int', default: 0 })
  attemptCount: number;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs?: number;
}

@Entity('inbound_webhooks')
@Index(['tenantId', 'source', 'createdAt'])
@Index(['tenantId', 'processed'])
export class InboundWebhook extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  @Column({ length: 100 })
  source: string; // 'quickbooks', 'companycam', 'stripe', 'sendgrid', 'telnyx'

  @Column({ length: 100, nullable: true })
  event?: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @Column({ name: 'signature', length: 500, nullable: true })
  signature?: string;

  @Column({ name: 'signature_valid', type: 'boolean', nullable: true })
  signatureValid?: boolean;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ name: 'processing_error', type: 'text', nullable: true })
  processingError?: string;

  @Column({ name: 'processing_result', type: 'jsonb', nullable: true })
  processingResult?: Record<string, unknown>;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;
}
