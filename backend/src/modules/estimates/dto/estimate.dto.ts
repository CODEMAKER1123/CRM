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
import { EstimateStatus } from '@/common/enums';

export class CreateEstimateLineItemDto {
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

  @ApiProperty({ description: 'Unit of measure', required: false })
  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
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

  @ApiProperty({ description: 'Is optional', required: false })
  @IsOptional()
  @IsBoolean()
  optional?: boolean;

  @ApiProperty({ description: 'Pricing option', required: false })
  @IsOptional()
  @IsString()
  pricingOption?: string;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateEstimateDto {
  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Contact ID', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ description: 'Service address ID' })
  @IsUUID()
  serviceAddressId: string;

  @ApiProperty({ description: 'Estimate title', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tax rate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ description: 'Discount type', required: false })
  @IsOptional()
  @IsString()
  discountType?: 'percent' | 'fixed';

  @ApiProperty({ description: 'Discount value', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiProperty({ description: 'Deposit required', required: false })
  @IsOptional()
  @IsBoolean()
  depositRequired?: boolean;

  @ApiProperty({ description: 'Deposit type', required: false })
  @IsOptional()
  @IsString()
  depositType?: 'percent' | 'fixed';

  @ApiProperty({ description: 'Deposit value', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositValue?: number;

  @ApiProperty({ description: 'Issue date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  issueDate?: Date;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @ApiProperty({ description: 'Sales rep ID', required: false })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @ApiProperty({ description: 'Sales rep name', required: false })
  @IsOptional()
  @IsString()
  salesRepName?: string;

  @ApiProperty({ description: 'Internal notes', required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Customer notes', required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiProperty({ description: 'Terms and conditions', required: false })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({ description: 'Line items', type: [CreateEstimateLineItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstimateLineItemDto)
  lineItems?: CreateEstimateLineItemDto[];

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateEstimateDto extends PartialType(CreateEstimateDto) {
  @ApiProperty({ enum: EstimateStatus, description: 'Estimate status', required: false })
  @IsOptional()
  @IsEnum(EstimateStatus)
  status?: EstimateStatus;
}

export class EstimateQueryDto {
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

  @ApiProperty({ description: 'Filter by account ID', required: false })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({ enum: EstimateStatus, description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(EstimateStatus)
  status?: EstimateStatus;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ApproveEstimateDto {
  @ApiProperty({ description: 'Approver name' })
  @IsString()
  approvedByName: string;

  @ApiProperty({ description: 'Approver email' })
  @IsString()
  approvedByEmail: string;

  @ApiProperty({ description: 'Selected pricing option', required: false })
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiProperty({ description: 'Signature data (base64)', required: false })
  @IsOptional()
  @IsString()
  signatureData?: string;
}
