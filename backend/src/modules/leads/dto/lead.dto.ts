import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  IsDateString,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  LeadType,
  LeadTemperature,
  LeadSource,
  ResidentialPipelineStage,
  CommercialPipelineStage,
} from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ enum: LeadType })
  @IsEnum(LeadType)
  leadType: LeadType;

  @ApiPropertyOptional({ description: 'Pipeline stage - defaults to NEW' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pipelineStage?: string;

  @ApiPropertyOptional({ enum: LeadTemperature })
  @IsOptional()
  @IsEnum(LeadTemperature)
  temperature?: LeadTemperature;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  streetAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sourceDetail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referralSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmMedium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmCampaign?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicesInterested?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  leadScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  scoreFactors?: Record<string, number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  optedOutMarketing?: boolean;
}

export class MoveLeadStageDto {
  @ApiProperty({ description: 'New pipeline stage' })
  @IsString()
  @MaxLength(50)
  newStage: string;

  @ApiPropertyOptional({ description: 'Reason for moving (especially for lost)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @ApiPropertyOptional({ description: 'Competitor name if lost to competitor' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lostToCompetitor?: string;
}

export class ConvertLeadDto {
  @ApiPropertyOptional({ description: 'Create a new account for this lead' })
  @IsOptional()
  @IsBoolean()
  createAccount?: boolean;

  @ApiPropertyOptional({ description: 'Existing account ID to link to' })
  @IsOptional()
  @IsUUID()
  existingAccountId?: string;

  @ApiPropertyOptional({ description: 'Create a job for this lead' })
  @IsOptional()
  @IsBoolean()
  createJob?: boolean;

  @ApiPropertyOptional({ description: 'Service IDs for the job' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  serviceIds?: string[];

  @ApiPropertyOptional({ description: 'Notes for the new job' })
  @IsOptional()
  @IsString()
  jobNotes?: string;
}

export class AssignLeadDto {
  @ApiProperty()
  @IsUUID()
  assignedToId: string;
}

export class BulkAssignLeadsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  leadIds: string[];

  @ApiProperty()
  @IsUUID()
  assignedToId: string;
}

export class LeadQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: LeadType })
  @IsOptional()
  @IsEnum(LeadType)
  leadType?: LeadType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pipelineStage?: string;

  @ApiPropertyOptional({ enum: LeadTemperature })
  @IsOptional()
  @IsEnum(LeadTemperature)
  temperature?: LeadTemperature;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Show only unassigned leads' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unassigned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Show only leads with follow-up due' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  followUpDue?: boolean;

  @ApiPropertyOptional({ description: 'Include converted leads' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeConverted?: boolean;

  @ApiPropertyOptional({ description: 'Include lost leads' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeLost?: boolean;

  @ApiPropertyOptional({ description: 'Created after date' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Created before date' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class CreateLeadActivityDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  activityType: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  communicationDirection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class LeadActivityQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  activityType?: string;
}

export class CreatePipelineConfigDto {
  @ApiProperty({ enum: LeadType })
  @IsEnum(LeadType)
  leadType: LeadType;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  stage: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stageOrder: number;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  autoDripSequenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  autoFollowUpDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  slaDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWonStage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLostStage?: boolean;
}

export class UpdatePipelineConfigDto extends PartialType(CreatePipelineConfigDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Response DTOs
export class LeadStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  byType: Record<LeadType, number>;

  @ApiProperty()
  byStage: Record<string, number>;

  @ApiProperty()
  byTemperature: Record<LeadTemperature, number>;

  @ApiProperty()
  bySource: Record<LeadSource, number>;

  @ApiProperty()
  convertedThisMonth: number;

  @ApiProperty()
  lostThisMonth: number;

  @ApiProperty()
  avgTimeToConversion: number;

  @ApiProperty()
  followUpsDue: number;
}

export class PipelineViewDto {
  @ApiProperty()
  stage: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  leads: Lead[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  totalValue: number;
}

class Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  leadType: LeadType;
  pipelineStage: string;
  temperature: LeadTemperature;
  source: LeadSource;
  estimatedValue?: number;
  leadScore: number;
  nextFollowUpAt?: Date;
  assignedToId?: string;
  createdAt: Date;
}
