import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDate,
  IsArray,
  ValidateNested,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PricingType, JobType, Season } from '@/common/enums';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service code', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  code?: string;

  @ApiProperty({ description: 'Service name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: JobType, description: 'Job type', required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ enum: PricingType, description: 'Pricing type' })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiProperty({ description: 'Base price' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Unit of measure', required: false })
  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @ApiProperty({ description: 'Minimum charge', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumCharge?: number;

  @ApiProperty({ description: 'Maximum charge', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumCharge?: number;

  @ApiProperty({ description: 'Pricing formula', required: false })
  @IsOptional()
  @IsString()
  formula?: string;

  @ApiProperty({ description: 'Formula variables', required: false })
  @IsOptional()
  formulaVariables?: Record<string, unknown>;

  @ApiProperty({ description: 'Estimated duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationMinutes?: number;

  @ApiProperty({ description: 'Duration per unit in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationPerUnitMinutes?: number;

  @ApiProperty({ description: 'Is taxable', required: false })
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @ApiProperty({ description: 'Tax code', required: false })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiProperty({ description: 'Is visible to customers', required: false })
  @IsOptional()
  @IsBoolean()
  isVisibleToCustomers?: boolean;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Color', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePricingRuleDto {
  @ApiProperty({ description: 'Service ID', required: false })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({ description: 'Rule name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Conditions' })
  @IsArray()
  conditions: {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
    value: unknown;
  }[];

  @ApiProperty({ description: 'Action type' })
  @IsString()
  actionType: string;

  @ApiProperty({ description: 'Action value' })
  @IsNumber()
  actionValue: number;

  @ApiProperty({ description: 'Reason', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Priority', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ description: 'Applies to account types', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToAccountTypes?: string[];

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

export class UpdatePricingRuleDto extends PartialType(CreatePricingRuleDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateDiscountDto {
  @ApiProperty({ description: 'Discount code', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  code?: string;

  @ApiProperty({ description: 'Discount name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Discount type' })
  @IsString()
  discountType: 'percent' | 'fixed';

  @ApiProperty({ description: 'Discount value' })
  @IsNumber()
  discountValue: number;

  @ApiProperty({ description: 'Minimum order amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiProperty({ description: 'Maximum discount amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiProperty({ description: 'Usage limit', required: false })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiProperty({ description: 'Usage limit per customer', required: false })
  @IsOptional()
  @IsNumber()
  usageLimitPerCustomer?: number;

  @ApiProperty({ description: 'Applies to services', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  appliesToServices?: string[];

  @ApiProperty({ description: 'Applies to account types', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToAccountTypes?: string[];

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ description: 'Is public', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ServiceQueryDto {
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

  @ApiProperty({ description: 'Filter by category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: JobType, description: 'Filter by job type', required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
