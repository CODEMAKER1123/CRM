import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsDate,
  Length,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ConnectQuickBooksDto {
  @ApiProperty({ description: 'OAuth authorization code' })
  @IsString()
  authorizationCode: string;

  @ApiProperty({ description: 'QuickBooks realm ID' })
  @IsString()
  @Length(1, 100)
  realmId: string;

  @ApiProperty({ description: 'OAuth redirect URI' })
  @IsString()
  redirectUri: string;
}

export class UpdateQuickBooksSettingsDto {
  @ApiProperty({ description: 'Auto sync customers', required: false })
  @IsOptional()
  @IsBoolean()
  autoSyncCustomers?: boolean;

  @ApiProperty({ description: 'Auto sync invoices', required: false })
  @IsOptional()
  @IsBoolean()
  autoSyncInvoices?: boolean;

  @ApiProperty({ description: 'Auto sync payments', required: false })
  @IsOptional()
  @IsBoolean()
  autoSyncPayments?: boolean;

  @ApiProperty({ description: 'Sync interval in minutes', required: false })
  @IsOptional()
  @IsNumber()
  syncInterval?: number;

  @ApiProperty({ description: 'Default income account ID', required: false })
  @IsOptional()
  @IsString()
  defaultIncomeAccountId?: string;

  @ApiProperty({ description: 'Default asset account ID', required: false })
  @IsOptional()
  @IsString()
  defaultAssetAccountId?: string;

  @ApiProperty({ description: 'Default tax code ID', required: false })
  @IsOptional()
  @IsString()
  defaultTaxCodeId?: string;
}

export class SyncEntityDto {
  @ApiProperty({ description: 'Local entity type' })
  @IsString()
  localEntityType: string;

  @ApiProperty({ description: 'Local entity ID' })
  @IsUUID()
  localEntityId: string;
}

export class QuickBooksSyncQueryDto {
  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @ApiProperty({ description: 'Filter by entity type', required: false })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ description: 'Filter by status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

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
