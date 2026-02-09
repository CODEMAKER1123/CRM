import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsArray,
  IsDateString,
  ValidateNested,
  Length,
  Min,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { AutomationTriggerType, AutomationActionType } from '@/common/enums';

// --- Trigger condition sub-DTO ---
class TriggerConditionDto {
  @ApiProperty({ description: 'Field to evaluate' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Comparison operator (eq, neq, gt, lt, contains, etc.)' })
  @IsString()
  op: string;

  @ApiProperty({ description: 'Value to compare against' })
  value: unknown;
}

// --- Trigger configuration sub-DTO ---
class TriggerDto {
  @ApiProperty({ description: 'Event name that fires this rule' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Conditions that must all pass', type: [TriggerConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TriggerConditionDto)
  conditions: TriggerConditionDto[];
}

// --- Action configuration sub-DTO ---
class ActionDto {
  @ApiProperty({ description: 'Action type (send_email, send_sms, update_field, create_task, notify, etc.)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Action-specific configuration' })
  config: Record<string, unknown>;

  @ApiProperty({ description: 'Delay in minutes before executing this action', required: false })
  @IsOptional()
  @IsNumber()
  delay_minutes?: number;
}

// --- Constraints sub-DTO ---
class ConstraintsDto {
  @ApiProperty({ description: 'Cooldown in minutes between firings for the same entity', required: false })
  @IsOptional()
  @IsNumber()
  cooldown_minutes?: number;

  @ApiProperty({ description: 'Quiet hours start (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  quiet_hours_start?: string;

  @ApiProperty({ description: 'Quiet hours end (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  quiet_hours_end?: string;

  @ApiProperty({ description: 'Maximum number of times this rule can fire per entity', required: false })
  @IsOptional()
  @IsNumber()
  max_fires_per_entity?: number;

  @ApiProperty({ description: 'Only fire on business days', required: false })
  @IsOptional()
  @IsBoolean()
  business_days_only?: boolean;
}

// --- Follow-up step sub-DTO ---
class FollowUpStepDto {
  @ApiProperty({ description: 'Delay in hours before executing this step' })
  @IsNumber()
  @Min(0)
  delay_hours: number;

  @ApiProperty({ description: 'Communication channel', enum: ['email', 'text', 'call_task'] })
  @IsString()
  channel: 'email' | 'text' | 'call_task';

  @ApiProperty({ description: 'Template ID for the message', required: false })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiProperty({ description: 'Message content (if no template)', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

// =====================
// Main DTOs
// =====================

export class CreateAutomationRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Trigger configuration', type: TriggerDto })
  @ValidateNested()
  @Type(() => TriggerDto)
  trigger: TriggerDto;

  @ApiProperty({ description: 'Actions to execute', type: [ActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];

  @ApiProperty({ description: 'Execution constraints', required: false, type: ConstraintsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConstraintsDto)
  constraints?: ConstraintsDto;

  @ApiProperty({ description: 'Rule description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Enable test mode (logs but does not execute actions)', required: false })
  @IsOptional()
  @IsBoolean()
  testMode?: boolean;
}

export class UpdateAutomationRuleDto extends PartialType(CreateAutomationRuleDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AutomationQueryDto {
  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Filter by test mode', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  testMode?: boolean;

  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class ExecutionQueryDto {
  @ApiProperty({ description: 'Filter by rule ID', required: false })
  @IsOptional()
  @IsUUID()
  ruleId?: string;

  @ApiProperty({ description: 'Filter by entity type', required: false })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ description: 'Filter by entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Start date (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class CreateFollowUpSequenceDto {
  @ApiProperty({ description: 'Lead ID to start the sequence for' })
  @IsUUID()
  leadId: string;

  @ApiProperty({ description: 'Sequence steps', type: [FollowUpStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowUpStepDto)
  steps: FollowUpStepDto[];
}
