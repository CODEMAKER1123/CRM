import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, IsHexColor, Length, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Tenant name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @IsString()
  @Length(1, 100)
  slug: string;

  @ApiProperty({ description: 'Legal business name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  businessName?: string;

  @ApiProperty({ description: 'Business description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Business phone number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ description: 'Business email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Business website', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ description: 'Primary brand color (hex)', required: false })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiProperty({ description: 'Secondary brand color (hex)', required: false })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiProperty({ description: 'Street address', required: false })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Country code', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Default tax rate (decimal)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number;

  @ApiProperty({ description: 'Default payment terms (days)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPaymentTerms?: number;

  @ApiProperty({ description: 'Estimate expiry days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimateExpiryDays?: number;
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiProperty({ description: 'Is tenant active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
