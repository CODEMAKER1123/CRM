import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  AutomationRule,
  AutomationExecution,
  FollowUpSequence,
} from './entities/automation.entity';
import {
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
  AutomationQueryDto,
  ExecutionQueryDto,
  CreateFollowUpSequenceDto,
} from './dto/automation.dto';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    @InjectRepository(AutomationRule)
    private readonly ruleRepository: Repository<AutomationRule>,
    @InjectRepository(AutomationExecution)
    private readonly executionRepository: Repository<AutomationExecution>,
    @InjectRepository(FollowUpSequence)
    private readonly sequenceRepository: Repository<FollowUpSequence>,
  ) {}

  // =====================
  // Automation Rules
  // =====================

  async createRule(tenantId: string, dto: CreateAutomationRuleDto): Promise<AutomationRule> {
    const rule = this.ruleRepository.create({
      ...dto,
      tenantId,
    });
    return this.ruleRepository.save(rule);
  }

  async findAllRules(
    tenantId: string,
    query: AutomationQueryDto,
  ): Promise<{ data: AutomationRule[]; total: number }> {
    const { page = 1, limit = 20, isActive, testMode } = query;

    const queryBuilder = this.ruleRepository.createQueryBuilder('rule');
    queryBuilder.where('rule.tenant_id = :tenantId', { tenantId });

    if (isActive !== undefined) {
      queryBuilder.andWhere('rule.is_active = :isActive', { isActive });
    }

    if (testMode !== undefined) {
      queryBuilder.andWhere('rule.test_mode = :testMode', { testMode });
    }

    queryBuilder.orderBy('rule.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOneRule(tenantId: string, id: string): Promise<AutomationRule> {
    const rule = await this.ruleRepository.findOne({
      where: { id, tenantId },
    });
    if (!rule) {
      throw new NotFoundException(`Automation rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateRule(
    tenantId: string,
    id: string,
    dto: UpdateAutomationRuleDto,
  ): Promise<AutomationRule> {
    const rule = await this.findOneRule(tenantId, id);
    Object.assign(rule, dto);
    return this.ruleRepository.save(rule);
  }

  async toggleActive(tenantId: string, id: string, isActive: boolean): Promise<AutomationRule> {
    const rule = await this.findOneRule(tenantId, id);
    rule.isActive = isActive;
    return this.ruleRepository.save(rule);
  }

  async toggleTestMode(tenantId: string, id: string, testMode: boolean): Promise<AutomationRule> {
    const rule = await this.findOneRule(tenantId, id);
    rule.testMode = testMode;
    return this.ruleRepository.save(rule);
  }

  // =====================
  // Rule Evaluation
  // =====================

  async evaluateEvent(
    tenantId: string,
    event: string,
    entityType: string,
    entityId: string,
    entityData: Record<string, unknown>,
  ): Promise<AutomationExecution[]> {
    // Find all active rules whose trigger event matches
    const rules = await this.ruleRepository.find({
      where: { tenantId, isActive: true },
    });

    const matchingRules = rules.filter((rule) => rule.trigger.event === event);

    const executions: AutomationExecution[] = [];

    for (const rule of matchingRules) {
      // Check constraints (cooldown, quiet hours, max fires)
      const suppressionReason = await this.checkConstraints(rule, tenantId, entityId);
      if (suppressionReason) {
        const execution = await this.logExecution(
          tenantId,
          rule,
          entityType,
          entityId,
          event,
          false,
          null,
          suppressionReason,
        );
        executions.push(execution);
        continue;
      }

      // Evaluate trigger conditions against entity data
      const conditionsPassed = this.evaluateConditions(rule.trigger.conditions, entityData);

      let actionsTaken: Array<{ type: string; status: 'executed' | 'skipped' | 'failed'; details?: string }> | null = null;

      if (conditionsPassed && !rule.testMode) {
        // Execute actions
        actionsTaken = await this.executeActions(rule.actions);
      } else if (conditionsPassed && rule.testMode) {
        // In test mode, log what would have happened
        actionsTaken = rule.actions.map((action) => ({
          type: action.type,
          status: 'skipped' as const,
          details: 'Test mode - action not executed',
        }));
      }

      const execution = await this.logExecution(
        tenantId,
        rule,
        entityType,
        entityId,
        event,
        conditionsPassed,
        actionsTaken,
        null,
      );
      executions.push(execution);
    }

    return executions;
  }

  private evaluateConditions(
    conditions: Array<{ field: string; op: string; value: unknown }>,
    entityData: Record<string, unknown>,
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => {
      const fieldValue = entityData[condition.field];

      switch (condition.op) {
        case 'eq':
          return fieldValue === condition.value;
        case 'neq':
          return fieldValue !== condition.value;
        case 'gt':
          return (fieldValue as number) > (condition.value as number);
        case 'gte':
          return (fieldValue as number) >= (condition.value as number);
        case 'lt':
          return (fieldValue as number) < (condition.value as number);
        case 'lte':
          return (fieldValue as number) <= (condition.value as number);
        case 'contains':
          return typeof fieldValue === 'string' && fieldValue.includes(condition.value as string);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        default:
          this.logger.warn(`Unknown condition operator: ${condition.op}`);
          return false;
      }
    });
  }

  private async checkConstraints(
    rule: AutomationRule,
    tenantId: string,
    entityId: string,
  ): Promise<string | null> {
    if (!rule.constraints) {
      return null;
    }

    // Check cooldown
    if (rule.constraints.cooldown_minutes) {
      const cooldownThreshold = new Date(
        Date.now() - rule.constraints.cooldown_minutes * 60 * 1000,
      );
      const recentExecution = await this.executionRepository.findOne({
        where: {
          tenantId,
          ruleId: rule.id,
          entityId,
          conditionsPassed: true,
        },
        order: { executedAt: 'DESC' },
      });

      if (recentExecution && recentExecution.executedAt > cooldownThreshold) {
        return `Cooldown: last fired ${recentExecution.executedAt.toISOString()}, cooldown ${rule.constraints.cooldown_minutes}m`;
      }
    }

    // Check max fires per entity
    if (rule.constraints.max_fires_per_entity) {
      const fireCount = await this.executionRepository.count({
        where: {
          tenantId,
          ruleId: rule.id,
          entityId,
          conditionsPassed: true,
        },
      });

      if (fireCount >= rule.constraints.max_fires_per_entity) {
        return `Max fires reached: ${fireCount}/${rule.constraints.max_fires_per_entity}`;
      }
    }

    // Check quiet hours
    if (rule.constraints.quiet_hours_start && rule.constraints.quiet_hours_end) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const start = rule.constraints.quiet_hours_start;
      const end = rule.constraints.quiet_hours_end;

      const inQuietHours =
        start <= end
          ? currentTime >= start && currentTime <= end
          : currentTime >= start || currentTime <= end;

      if (inQuietHours) {
        return `Quiet hours: ${start} - ${end}`;
      }
    }

    // Check business days only
    if (rule.constraints.business_days_only) {
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'Business days only: current day is a weekend';
      }
    }

    return null;
  }

  private async executeActions(
    actions: Array<{ type: string; config: Record<string, unknown>; delay_minutes?: number }>,
  ): Promise<Array<{ type: string; status: 'executed' | 'skipped' | 'failed'; details?: string }>> {
    const results: Array<{ type: string; status: 'executed' | 'skipped' | 'failed'; details?: string }> = [];

    for (const action of actions) {
      try {
        // In a full implementation, this would dispatch to action handlers
        // (e.g., email service, SMS service, task creation service).
        // For now, log and mark as executed.
        this.logger.log(`Executing action: ${action.type} with config: ${JSON.stringify(action.config)}`);
        results.push({
          type: action.type,
          status: 'executed',
          details: `Action executed successfully`,
        });
      } catch (error) {
        this.logger.error(`Failed to execute action: ${action.type}`, error);
        results.push({
          type: action.type,
          status: 'failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async logExecution(
    tenantId: string,
    rule: AutomationRule,
    entityType: string,
    entityId: string,
    triggerEvent: string,
    conditionsPassed: boolean,
    actionsTaken: Array<{ type: string; status: string; details?: string }> | null,
    suppressionReason: string | null,
  ): Promise<AutomationExecution> {
    const execution = this.executionRepository.create({
      tenantId,
      ruleId: rule.id,
      entityType,
      entityId,
      triggerEvent,
      conditionsPassed,
      actionsTaken: (actionsTaken ?? undefined) as AutomationExecution['actionsTaken'],
      suppressionReason: suppressionReason ?? undefined,
      isTestMode: rule.testMode,
    });
    return this.executionRepository.save(execution);
  }

  // =====================
  // Execution Logs
  // =====================

  async findExecutions(
    tenantId: string,
    query: ExecutionQueryDto,
  ): Promise<{ data: AutomationExecution[]; total: number }> {
    const { page = 1, limit = 20, ruleId, entityType, entityId, startDate, endDate } = query;

    const queryBuilder = this.executionRepository.createQueryBuilder('execution');
    queryBuilder.where('execution.tenant_id = :tenantId', { tenantId });

    if (ruleId) {
      queryBuilder.andWhere('execution.rule_id = :ruleId', { ruleId });
    }

    if (entityType) {
      queryBuilder.andWhere('execution.entity_type = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('execution.entity_id = :entityId', { entityId });
    }

    if (startDate) {
      queryBuilder.andWhere('execution.executed_at >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('execution.executed_at <= :endDate', { endDate });
    }

    queryBuilder.leftJoinAndSelect('execution.rule', 'rule');
    queryBuilder.orderBy('execution.executed_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async getExecutionStats(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    totalExecutions: number;
    conditionsPassed: number;
    conditionsFailed: number;
    suppressed: number;
    testMode: number;
    byRule: Array<{ ruleId: string; ruleName: string; count: number }>;
  }> {
    const queryBuilder = this.executionRepository.createQueryBuilder('execution');
    queryBuilder.where('execution.tenant_id = :tenantId', { tenantId });

    if (startDate) {
      queryBuilder.andWhere('execution.executed_at >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('execution.executed_at <= :endDate', { endDate });
    }

    const executions = await queryBuilder
      .leftJoinAndSelect('execution.rule', 'rule')
      .getMany();

    const totalExecutions = executions.length;
    const conditionsPassed = executions.filter((e) => e.conditionsPassed).length;
    const conditionsFailed = executions.filter((e) => !e.conditionsPassed).length;
    const suppressed = executions.filter((e) => e.suppressionReason).length;
    const testMode = executions.filter((e) => e.isTestMode).length;

    // Aggregate by rule
    const ruleMap = new Map<string, { ruleId: string; ruleName: string; count: number }>();
    for (const execution of executions) {
      const existing = ruleMap.get(execution.ruleId);
      if (existing) {
        existing.count++;
      } else {
        ruleMap.set(execution.ruleId, {
          ruleId: execution.ruleId,
          ruleName: execution.rule?.name ?? 'Unknown',
          count: 1,
        });
      }
    }

    return {
      totalExecutions,
      conditionsPassed,
      conditionsFailed,
      suppressed,
      testMode,
      byRule: Array.from(ruleMap.values()).sort((a, b) => b.count - a.count),
    };
  }

  // =====================
  // Follow-Up Sequences
  // =====================

  async startFollowUpSequence(
    tenantId: string,
    leadId: string,
    steps: CreateFollowUpSequenceDto['steps'],
  ): Promise<FollowUpSequence> {
    const now = new Date();
    const firstStepDelay = steps.length > 0 ? steps[0].delay_hours : 0;
    const nextStepAt = new Date(now.getTime() + firstStepDelay * 60 * 60 * 1000);

    const sequence = this.sequenceRepository.create({
      tenantId,
      leadId,
      status: 'active',
      currentStep: 0,
      steps,
      nextStepAt,
      startedAt: now,
    });

    return this.sequenceRepository.save(sequence);
  }

  async pauseFollowUpSequence(tenantId: string, sequenceId: string): Promise<FollowUpSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id: sequenceId, tenantId },
    });
    if (!sequence) {
      throw new NotFoundException(`Follow-up sequence with ID ${sequenceId} not found`);
    }
    if (sequence.status !== 'active') {
      throw new NotFoundException(`Sequence is not active (current status: ${sequence.status})`);
    }

    sequence.status = 'paused';
    sequence.pausedAt = new Date();
    sequence.nextStepAt = undefined;

    return this.sequenceRepository.save(sequence);
  }

  async cancelFollowUpSequence(tenantId: string, sequenceId: string): Promise<FollowUpSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id: sequenceId, tenantId },
    });
    if (!sequence) {
      throw new NotFoundException(`Follow-up sequence with ID ${sequenceId} not found`);
    }
    if (sequence.status === 'completed' || sequence.status === 'cancelled') {
      throw new NotFoundException(
        `Sequence is already ${sequence.status}`,
      );
    }

    sequence.status = 'cancelled';
    sequence.nextStepAt = undefined;

    return this.sequenceRepository.save(sequence);
  }

  async processNextSteps(): Promise<void> {
    const now = new Date();

    // Find all active sequences whose next step is due
    const dueSequences = await this.sequenceRepository.find({
      where: {
        status: 'active',
        nextStepAt: LessThanOrEqual(now),
      },
    });

    this.logger.log(`Processing ${dueSequences.length} due follow-up sequences`);

    for (const sequence of dueSequences) {
      try {
        const currentStepIndex = sequence.currentStep;
        const step = sequence.steps[currentStepIndex];

        if (!step) {
          // No more steps, mark as completed
          sequence.status = 'completed';
          sequence.completedAt = new Date();
          sequence.nextStepAt = undefined;
          await this.sequenceRepository.save(sequence);
          continue;
        }

        // Execute the step
        this.logger.log(
          `Executing step ${currentStepIndex} (${step.channel}) for sequence ${sequence.id}, lead ${sequence.leadId}`,
        );

        // Mark step as executed
        sequence.steps[currentStepIndex] = {
          ...step,
          executed_at: new Date().toISOString(),
        };

        // Move to next step
        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex < sequence.steps.length) {
          const nextStep = sequence.steps[nextStepIndex];
          sequence.currentStep = nextStepIndex;
          sequence.nextStepAt = new Date(
            Date.now() + nextStep.delay_hours * 60 * 60 * 1000,
          );
        } else {
          // All steps completed
          sequence.status = 'completed';
          sequence.completedAt = new Date();
          sequence.nextStepAt = undefined;
        }

        await this.sequenceRepository.save(sequence);
      } catch (error) {
        this.logger.error(
          `Error processing sequence ${sequence.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }
}
