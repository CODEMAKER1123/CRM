import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ description: 'Account ID this contact belongs to' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ description: 'Mobile phone number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  mobilePhone?: string;

  @ApiProperty({ description: 'Job title', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string;

  @ApiProperty({ description: 'Department', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string;

  @ApiProperty({ description: 'Is primary contact', required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Is billing contact', required: false })
  @IsOptional()
  @IsBoolean()
  isBillingContact?: boolean;

  @ApiProperty({ description: 'Receives marketing emails', required: false })
  @IsOptional()
  @IsBoolean()
  receivesMarketing?: boolean;

  @ApiProperty({ description: 'Receives invoices', required: false })
  @IsOptional()
  @IsBoolean()
  receivesInvoices?: boolean;

  @ApiProperty({ description: 'Receives reminders', required: false })
  @IsOptional()
  @IsBoolean()
  receivesReminders?: boolean;

  @ApiProperty({ description: 'Preferred contact method', required: false })
  @IsOptional()
  @IsString()
  preferredContactMethod?: string;

  @ApiProperty({ description: 'SMS opt-in', required: false })
  @IsOptional()
  @IsBoolean()
  smsOptIn?: boolean;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiProperty({ description: 'Email unsubscribed', required: false })
  @IsOptional()
  @IsBoolean()
  emailUnsubscribed?: boolean;
}

export class ContactQueryDto {
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

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by primary contacts only', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
