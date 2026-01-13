import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDate,
  IsArray,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CampaignType, CampaignStatus, AutomationTriggerType, AutomationActionType } from '@/common/enums';

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @Length(1, 255)
  subject: string;

  @ApiProperty({ description: 'Preview text', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  previewText?: string;

  @ApiProperty({ description: 'HTML content' })
  @IsString()
  htmlContent: string;

  @ApiProperty({ description: 'Text content', required: false })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Template type', required: false })
  @IsOptional()
  @IsString()
  templateType?: string;

  @ApiProperty({ description: 'Variables', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];
}

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CampaignType, description: 'Campaign type' })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiProperty({ description: 'Email template ID', required: false })
  @IsOptional()
  @IsUUID()
  emailTemplateId?: string;

  @ApiProperty({ description: 'SMS template ID', required: false })
  @IsOptional()
  @IsUUID()
  smsTemplateId?: string;

  @ApiProperty({ description: 'Subject line override', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Audience filter', required: false })
  @IsOptional()
  audienceFilter?: Record<string, unknown>;

  @ApiProperty({ description: 'Segment ID', required: false })
  @IsOptional()
  @IsUUID()
  segmentId?: string;

  @ApiProperty({ description: 'Scheduled at', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @ApiProperty({ description: 'From name', required: false })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiProperty({ description: 'From email', required: false })
  @IsOptional()
  @IsString()
  fromEmail?: string;

  @ApiProperty({ description: 'Reply to', required: false })
  @IsOptional()
  @IsString()
  replyTo?: string;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @ApiProperty({ enum: CampaignStatus, description: 'Campaign status', required: false })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class CreateAutomationSequenceDto {
  @ApiProperty({ description: 'Sequence name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AutomationTriggerType, description: 'Trigger type' })
  @IsEnum(AutomationTriggerType)
  triggerType: AutomationTriggerType;

  @ApiProperty({ description: 'Trigger event', required: false })
  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @ApiProperty({ description: 'Trigger conditions', required: false })
  @IsOptional()
  triggerConditions?: Record<string, unknown>;

  @ApiProperty({ description: 'Entry conditions', required: false })
  @IsOptional()
  entryConditions?: Record<string, unknown>;

  @ApiProperty({ description: 'Exit conditions', required: false })
  @IsOptional()
  exitConditions?: Record<string, unknown>;
}

export class UpdateAutomationSequenceDto extends PartialType(CreateAutomationSequenceDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSequenceStepDto {
  @ApiProperty({ description: 'Sequence ID' })
  @IsUUID()
  sequenceId: string;

  @ApiProperty({ description: 'Step order' })
  @IsNumber()
  @Min(0)
  stepOrder: number;

  @ApiProperty({ description: 'Step name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: AutomationActionType, description: 'Action type' })
  @IsEnum(AutomationActionType)
  actionType: AutomationActionType;

  @ApiProperty({ description: 'Action config' })
  actionConfig: {
    templateId?: string;
    delayMinutes?: number;
    delayDays?: number;
    field?: string;
    value?: unknown;
    condition?: Record<string, unknown>;
    notificationType?: string;
    notificationRecipients?: string[];
  };

  @ApiProperty({ description: 'Conditions', required: false })
  @IsOptional()
  conditions?: Record<string, unknown>;
}

export class CampaignQueryDto {
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

  @ApiProperty({ enum: CampaignType, description: 'Filter by type', required: false })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiProperty({ enum: CampaignStatus, description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
