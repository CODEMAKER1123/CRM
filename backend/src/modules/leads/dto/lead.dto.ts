import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  IsEnum,
  IsUUID,
  IsArray,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  BusinessLine,
  PipelineType,
  LeadSourceType,
  ActivityType,
  ActivityDirection,
} from '@/common/enums';

export class CreateLeadDto {
  @ApiProperty({ description: 'Lead source (e.g. google_lsa, referral)' })
  @IsString()
  @Length(1, 100)
  source: string;

  @ApiProperty({ enum: LeadSourceType, description: 'Source type', required: false })
  @IsOptional()
  @IsEnum(LeadSourceType)
  sourceType?: LeadSourceType;

  @ApiProperty({ enum: BusinessLine, description: 'Business line', required: false })
  @IsOptional()
  @IsEnum(BusinessLine)
  businessLine?: BusinessLine;

  @ApiProperty({ enum: PipelineType, description: 'Pipeline type', required: false })
  @IsOptional()
  @IsEnum(PipelineType)
  pipeline?: PipelineType;

  @ApiProperty({ description: 'Contact name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  contactName?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ description: 'Contact phone', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  contactPhone?: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  companyName?: string;

  @ApiProperty({ description: 'Address line 1', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  addressLine1?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  state?: string;

  @ApiProperty({ description: 'ZIP code', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  zip?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty({ description: 'Assigned sales rep ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedRepId?: string;

  @ApiProperty({ description: 'Account ID', required: false })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({ description: 'Property address ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;
}

export class LeadQueryDto {
  @ApiProperty({ enum: PipelineType, description: 'Filter by pipeline', required: false })
  @IsOptional()
  @IsEnum(PipelineType)
  pipeline?: PipelineType;

  @ApiProperty({ description: 'Filter by stage', required: false })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiProperty({ description: 'Filter by assigned rep ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedRepId?: string;

  @ApiProperty({ enum: BusinessLine, description: 'Filter by business line', required: false })
  @IsOptional()
  @IsEnum(BusinessLine)
  businessLine?: BusinessLine;

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

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class TransitionLeadDto {
  @ApiProperty({ description: 'Target stage to transition to' })
  @IsString()
  @Length(1, 50)
  toStage: string;

  @ApiProperty({ description: 'Reason for transition', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, description: 'Activity type' })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ enum: ActivityDirection, description: 'Activity direction', required: false })
  @IsOptional()
  @IsEnum(ActivityDirection)
  direction?: ActivityDirection;

  @ApiProperty({ description: 'Subject', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  subject?: string;

  @ApiProperty({ description: 'Body / content', required: false })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ description: 'Outcome / result', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  outcome?: string;
}
