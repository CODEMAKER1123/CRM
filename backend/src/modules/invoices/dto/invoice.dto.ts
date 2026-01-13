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
import { InvoiceStatus } from '@/common/enums';

export class CreateInvoiceLineItemDto {
  @ApiProperty({ description: 'Service ID', required: false })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({ description: 'Job line item ID', required: false })
  @IsOptional()
  @IsUUID()
  jobLineItemId?: string;

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

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Contact ID', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ description: 'Billing address ID', required: false })
  @IsOptional()
  @IsUUID()
  billingAddressId?: string;

  @ApiProperty({ description: 'Job ID', required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ description: 'Estimate ID', required: false })
  @IsOptional()
  @IsUUID()
  estimateId?: string;

  @ApiProperty({ description: 'Invoice title', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

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

  @ApiProperty({ description: 'Issue date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  issueDate?: Date;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiProperty({ description: 'Payment terms in days', required: false })
  @IsOptional()
  @IsNumber()
  paymentTerms?: number;

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

  @ApiProperty({ description: 'Payment instructions', required: false })
  @IsOptional()
  @IsString()
  paymentInstructions?: string;

  @ApiProperty({ description: 'Terms and conditions', required: false })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({ description: 'Line items', type: [CreateInvoiceLineItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems?: CreateInvoiceLineItemDto[];

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiProperty({ enum: InvoiceStatus, description: 'Invoice status', required: false })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

export class InvoiceQueryDto {
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

  @ApiProperty({ description: 'Filter by job ID', required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ enum: InvoiceStatus, description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ description: 'Filter overdue invoices', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdue?: boolean;

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
