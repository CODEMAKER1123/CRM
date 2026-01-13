import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDate,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '@/common/enums';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Invoice ID', required: false })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment date' })
  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  @ApiProperty({ description: 'Check number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  checkNumber?: string;

  @ApiProperty({ description: 'Check date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkDate?: Date;

  @ApiProperty({ description: 'Card last four digits', required: false })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  cardLastFour?: string;

  @ApiProperty({ description: 'Card brand', required: false })
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @ApiProperty({ description: 'Is deposit payment', required: false })
  @IsOptional()
  @IsBoolean()
  isDeposit?: boolean;

  @ApiProperty({ description: 'Deposit for estimate ID', required: false })
  @IsOptional()
  @IsUUID()
  depositForEstimateId?: string;

  @ApiProperty({ description: 'Processing fee', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  processingFee?: number;

  @ApiProperty({ description: 'Reference number', required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Internal notes', required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({ enum: PaymentStatus, description: 'Payment status', required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

export class PaymentQueryDto {
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

  @ApiProperty({ description: 'Filter by invoice ID', required: false })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod, description: 'Filter by method', required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

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

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'paymentDate';

  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Refund amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Refund reason' })
  @IsString()
  reason: string;
}
