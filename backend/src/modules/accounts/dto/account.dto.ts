import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEmail,
  IsEnum,
  IsUUID,
  IsArray,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { AccountType, LeadSource } from '@/common/enums';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name (customer name or business name)' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Display name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  displayName?: string;

  @ApiProperty({ enum: AccountType, description: 'Account type' })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ description: 'Company name (for commercial accounts)', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'Industry (for commercial accounts)', required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ description: 'Primary email address', required: false })
  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @ApiProperty({ description: 'Primary phone number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  primaryPhone?: string;

  @ApiProperty({ enum: LeadSource, description: 'Lead source', required: false })
  @IsOptional()
  @IsEnum(LeadSource)
  leadSource?: LeadSource;

  @ApiProperty({ description: 'Lead source detail', required: false })
  @IsOptional()
  @IsString()
  leadSourceDetail?: string;

  @ApiProperty({ description: 'Referring account ID', required: false })
  @IsOptional()
  @IsUUID()
  referredByAccountId?: string;

  @ApiProperty({ description: 'Credit limit', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiProperty({ description: 'Payment terms in days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTerms?: number;

  @ApiProperty({ description: 'Is tax exempt', required: false })
  @IsOptional()
  @IsBoolean()
  taxExempt?: boolean;

  @ApiProperty({ description: 'Tax ID number', required: false })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiProperty({ description: 'Is account active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Do not contact flag', required: false })
  @IsOptional()
  @IsBoolean()
  doNotContact?: boolean;
}

export class AccountQueryDto {
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

  @ApiProperty({ enum: AccountType, description: 'Filter by account type', required: false })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiProperty({ enum: LeadSource, description: 'Filter by lead source', required: false })
  @IsOptional()
  @IsEnum(LeadSource)
  leadSource?: LeadSource;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
