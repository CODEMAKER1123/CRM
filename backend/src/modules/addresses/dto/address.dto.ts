import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { AddressType } from '@/common/enums';

export class CreateAddressDto {
  @ApiProperty({ description: 'Account ID this address belongs to' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Label for the address', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  label?: string;

  @ApiProperty({ enum: AddressType, description: 'Address type' })
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiProperty({ description: 'Street address line 1' })
  @IsString()
  @Length(1, 255)
  streetAddress1: string;

  @ApiProperty({ description: 'Street address line 2', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  streetAddress2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @Length(1, 100)
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  @Length(1, 50)
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @Length(1, 20)
  postalCode: string;

  @ApiProperty({ description: 'Country code', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Property square footage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  propertySqft?: number;

  @ApiProperty({ description: 'Linear footage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  linearFootage?: number;

  @ApiProperty({ description: 'Number of stories', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  stories?: number;

  @ApiProperty({ description: 'Has pool', required: false })
  @IsOptional()
  @IsBoolean()
  hasPool?: boolean;

  @ApiProperty({ description: 'Has deck', required: false })
  @IsOptional()
  @IsBoolean()
  hasDeck?: boolean;

  @ApiProperty({ description: 'Has fence', required: false })
  @IsOptional()
  @IsBoolean()
  hasFence?: boolean;

  @ApiProperty({ description: 'Roof type', required: false })
  @IsOptional()
  @IsString()
  roofType?: string;

  @ApiProperty({ description: 'Siding type', required: false })
  @IsOptional()
  @IsString()
  sidingType?: string;

  @ApiProperty({ description: 'Gate code', required: false })
  @IsOptional()
  @IsString()
  gateCode?: string;

  @ApiProperty({ description: 'Access notes', required: false })
  @IsOptional()
  @IsString()
  accessNotes?: string;

  @ApiProperty({ description: 'Parking instructions', required: false })
  @IsOptional()
  @IsString()
  parkingInstructions?: string;

  @ApiProperty({ description: 'Has dog', required: false })
  @IsOptional()
  @IsBoolean()
  hasDog?: boolean;

  @ApiProperty({ description: 'Dog notes', required: false })
  @IsOptional()
  @IsString()
  dogNotes?: string;

  @ApiProperty({ description: 'Service territory', required: false })
  @IsOptional()
  @IsString()
  serviceTerritory?: string;

  @ApiProperty({ description: 'Is primary address', required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

export class AddressQueryDto {
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

  @ApiProperty({ enum: AddressType, description: 'Filter by address type', required: false })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @ApiProperty({ description: 'Filter by service territory', required: false })
  @IsOptional()
  @IsString()
  serviceTerritory?: string;

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
