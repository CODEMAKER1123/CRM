import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsArray,
  IsDateString,
  IsObject,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  CommissionRoleType,
  BusinessLine,
  CommissionBase,
  CommissionTrigger,
  CommissionStatus,
  BonusMetric,
  BonusPeriod,
} from '@/common/enums';

export class CreateCommissionRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ enum: CommissionRoleType, description: 'Role type this rule applies to' })
  @IsEnum(CommissionRoleType)
  roleType: CommissionRoleType;

  @ApiProperty({ enum: BusinessLine, description: 'Business line', required: false })
  @IsOptional()
  @IsEnum(BusinessLine)
  businessLine?: BusinessLine;

  @ApiProperty({ description: 'Rule conditions (JSON structure for flexible matching)', required: false })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiProperty({ description: 'Commission rate (decimal, e.g. 0.10 for 10%)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  rate: number;

  @ApiProperty({ enum: CommissionBase, description: 'Commission base calculation', required: false })
  @IsOptional()
  @IsEnum(CommissionBase)
  base?: CommissionBase;

  @ApiProperty({ enum: CommissionTrigger, description: 'When commission is triggered', required: false })
  @IsOptional()
  @IsEnum(CommissionTrigger)
  trigger?: CommissionTrigger;

  @ApiProperty({ description: 'Expense categories to deduct before commission', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deductibleExpenseCategories?: string[];

  @ApiProperty({ description: 'Effective date of the rule', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}

export class UpdateCommissionRuleDto extends PartialType(CreateCommissionRuleDto) {}

export class CreateBonusRuleDto {
  @ApiProperty({ description: 'Bonus rule name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ enum: CommissionRoleType, description: 'Role type this bonus applies to' })
  @IsEnum(CommissionRoleType)
  roleType: CommissionRoleType;

  @ApiProperty({ enum: BusinessLine, description: 'Business line', required: false })
  @IsOptional()
  @IsEnum(BusinessLine)
  businessLine?: BusinessLine;

  @ApiProperty({ enum: BonusMetric, description: 'Metric to evaluate for bonus' })
  @IsEnum(BonusMetric)
  metric: BonusMetric;

  @ApiProperty({ description: 'Threshold in cents to qualify for bonus', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  thresholdCents?: number;

  @ApiProperty({ description: 'Bonus amount in cents' })
  @IsNumber()
  @Min(0)
  bonusAmountCents: number;

  @ApiProperty({ enum: BonusPeriod, description: 'Bonus evaluation period', required: false })
  @IsOptional()
  @IsEnum(BonusPeriod)
  period?: BonusPeriod;

  @ApiProperty({ description: 'Additional conditions for bonus qualification', required: false })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiProperty({ description: 'Effective date of the bonus rule', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}

export class CommissionQueryDto {
  @ApiProperty({ enum: CommissionRoleType, description: 'Filter by role type', required: false })
  @IsOptional()
  @IsEnum(CommissionRoleType)
  roleType?: CommissionRoleType;

  @ApiProperty({ enum: CommissionStatus, description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

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

  @ApiProperty({ description: 'Start date filter', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date filter', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class RuleQueryDto {
  @ApiProperty({ enum: CommissionRoleType, description: 'Filter by role type', required: false })
  @IsOptional()
  @IsEnum(CommissionRoleType)
  roleType?: CommissionRoleType;

  @ApiProperty({ enum: BusinessLine, description: 'Filter by business line', required: false })
  @IsOptional()
  @IsEnum(BusinessLine)
  businessLine?: BusinessLine;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

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

export class CreateJobExpenseDto {
  @ApiProperty({ description: 'Expense category' })
  @IsString()
  @Length(1, 100)
  category: string;

  @ApiProperty({ description: 'Expense description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Amount in cents' })
  @IsNumber()
  @Min(0)
  amountCents: number;

  @ApiProperty({ description: 'Vendor name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  vendor?: string;

  @ApiProperty({ description: 'Receipt URL', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  receiptUrl?: string;
}

export class TestRuleDto {
  @ApiProperty({ description: 'Job ID to test the rule against' })
  @IsUUID()
  jobId: string;
}

export class EvaluateBonusesDto {
  @ApiProperty({ description: 'Month (1-12)' })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Year' })
  @IsNumber()
  @Min(2000)
  year: number;
}
