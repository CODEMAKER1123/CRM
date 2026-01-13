import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDate,
  IsEmail,
  IsArray,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '@/common/enums';

export class CreateUserDto {
  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ description: 'Phone', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Clerk user ID', required: false })
  @IsOptional()
  @IsString()
  clerkUserId?: string;

  @ApiProperty({ description: 'Permissions', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ description: 'Territory restrictions', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  territoryRestrictions?: string[];

  @ApiProperty({ description: 'Can access all territories', required: false })
  @IsOptional()
  @IsBoolean()
  canAccessAllTerritories?: boolean;

  @ApiProperty({ description: 'Crew member ID', required: false })
  @IsOptional()
  @IsUUID()
  crewMemberId?: string;

  @ApiProperty({ description: 'Contact ID (for portal users)', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'MFA enabled', required: false })
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @ApiProperty({ description: 'User preferences', required: false })
  @IsOptional()
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    dateFormat?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
}

export class CreateApiKeyDto {
  @ApiProperty({ description: 'API key name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Scopes', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiProperty({ description: 'Rate limit (requests per minute)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;

  @ApiProperty({ description: 'Expiration date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}

export class UserQueryDto {
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

  @ApiProperty({ enum: UserRole, description: 'Filter by role', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

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

export class AuditLogQueryDto {
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
  limit?: number = 50;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Filter by entity type', required: false })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ description: 'Filter by entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Filter by action', required: false })
  @IsOptional()
  @IsString()
  action?: string;

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
