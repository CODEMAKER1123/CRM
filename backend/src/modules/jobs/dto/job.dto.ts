import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsArray,
  IsDate,
  IsDateString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { JobType, JobStatus, JobPriority, Season } from '@/common/enums';

export class CreateJobDto {
  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Service address ID' })
  @IsUUID()
  serviceAddressId: string;

  @ApiProperty({ description: 'Estimate ID', required: false })
  @IsOptional()
  @IsUUID()
  estimateId?: string;

  @ApiProperty({ enum: JobType, description: 'Job type' })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ enum: JobPriority, description: 'Priority', required: false })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority;

  @ApiProperty({ description: 'Job title', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @ApiProperty({ description: 'Job description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Scheduled date', required: false })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiProperty({ description: 'Scheduled start time (HH:MM)', required: false })
  @IsOptional()
  @IsString()
  scheduledStartTime?: string;

  @ApiProperty({ description: 'Estimated duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationMinutes?: number;

  @ApiProperty({ description: 'Is recurring job', required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ description: 'Recurrence pattern', required: false })
  @IsOptional()
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: string;
    occurrences?: number;
  };

  @ApiProperty({ enum: Season, description: 'Season', required: false })
  @IsOptional()
  @IsEnum(Season)
  season?: Season;

  @ApiProperty({ description: 'Customer PO number', required: false })
  @IsOptional()
  @IsString()
  customerPoNumber?: string;

  @ApiProperty({ description: 'Internal notes', required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Customer notes', required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiProperty({ description: 'Crew notes', required: false })
  @IsOptional()
  @IsString()
  crewNotes?: string;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class JobQueryDto {
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

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: JobStatus, description: 'Filter by status', required: false, isArray: true })
  @IsOptional()
  status?: JobStatus | JobStatus[];

  @ApiProperty({ enum: JobType, description: 'Filter by job type', required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ description: 'Filter by account ID', required: false })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({ description: 'Filter by crew ID', required: false })
  @IsOptional()
  @IsUUID()
  crewId?: string;

  @ApiProperty({ description: 'Date from', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'Date to', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class JobTransitionDto {
  @ApiProperty({
    description: 'Transition action',
    enum: [
      'QUALIFY',
      'SEND_ESTIMATE',
      'APPROVE_ESTIMATE',
      'REJECT_ESTIMATE',
      'SCHEDULE',
      'DISPATCH',
      'START_WORK',
      'COMPLETE_WORK',
      'CREATE_INVOICE',
      'MARK_PAID',
      'CANCEL',
      'MARK_LOST',
    ],
  })
  @IsString()
  action: string;

  @ApiProperty({ description: 'Scheduled date (for SCHEDULE action)', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @ApiProperty({ description: 'Invoice ID (for CREATE_INVOICE action)', required: false })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ description: 'Reason (for CANCEL or MARK_LOST actions)', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateJobLineItemDto {
  @ApiProperty({ description: 'Service ID', required: false })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({ description: 'Line item name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Discount percent', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiProperty({ description: 'Is taxable', required: false })
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class AssignCrewDto {
  @ApiProperty({ description: 'Crew member ID' })
  @IsUUID()
  crewMemberId: string;

  @ApiProperty({ description: 'Crew ID', required: false })
  @IsOptional()
  @IsUUID()
  crewId?: string;

  @ApiProperty({ description: 'Role in job', enum: ['lead', 'assistant', 'trainee'] })
  @IsString()
  role: string;
}
