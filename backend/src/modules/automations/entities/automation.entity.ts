import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('automation_rules')
@Index(['tenantId', 'isActive'])
export class AutomationRule extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Trigger configuration
  @Column({ type: 'jsonb' })
  trigger: {
    event: string;
    conditions: Array<{
      field: string;
      op: string;
      value: unknown;
    }>;
  };

  // Actions to execute
  @Column({ type: 'jsonb' })
  actions: Array<{
    type: string;
    config: Record<string, unknown>;
    delay_minutes?: number;
  }>;

  // Constraints
  @Column({ type: 'jsonb', nullable: true })
  constraints?: {
    cooldown_minutes?: number;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    max_fires_per_entity?: number;
    business_days_only?: boolean;
  };

  @Column({ name: 'execution_log', type: 'boolean', default: true })
  executionLog: boolean;

  @Column({ name: 'test_mode', type: 'boolean', default: false })
  testMode: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;
}

@Entity('automation_executions')
@Index(['tenantId', 'ruleId'])
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['tenantId', 'executedAt'])
export class AutomationExecution extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'rule_id', type: 'uuid' })
  ruleId: string;

  @ManyToOne(() => AutomationRule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  rule: AutomationRule;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'trigger_event', length: 100 })
  triggerEvent: string;

  @Column({ name: 'conditions_passed', type: 'boolean', default: true })
  conditionsPassed: boolean;

  @Column({ name: 'actions_taken', type: 'jsonb', nullable: true })
  actionsTaken?: Array<{
    type: string;
    status: 'executed' | 'skipped' | 'failed';
    details?: string;
  }>;

  @Column({ name: 'suppression_reason', type: 'text', nullable: true })
  suppressionReason?: string;

  @Column({ name: 'is_test_mode', type: 'boolean', default: false })
  isTestMode: boolean;

  @Column({ name: 'executed_at', type: 'timestamp', default: () => 'NOW()' })
  executedAt: Date;
}

@Entity('follow_up_sequences')
@Index(['tenantId', 'leadId'])
@Index(['tenantId', 'status'])
export class FollowUpSequence extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'lead_id', type: 'uuid' })
  leadId: string;

  @Column({ length: 100 })
  status: string; // active, paused, completed, cancelled

  @Column({ name: 'current_step', type: 'int', default: 0 })
  currentStep: number;

  @Column({ type: 'jsonb' })
  steps: Array<{
    delay_hours: number;
    channel: 'email' | 'text' | 'call_task';
    template_id?: string;
    message?: string;
    executed_at?: string;
  }>;

  @Column({ name: 'next_step_at', type: 'timestamp', nullable: true })
  nextStepAt?: Date;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'paused_at', type: 'timestamp', nullable: true })
  pausedAt?: Date;
}
