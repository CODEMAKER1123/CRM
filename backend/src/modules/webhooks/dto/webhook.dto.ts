import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsArray,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Webhook URL' })
  @IsUrl()
  @Length(1, 500)
  url: string;

  @ApiProperty({ description: 'Secret for signature verification', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  secret?: string;

  @ApiProperty({ description: 'Events to subscribe to', type: [String] })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiProperty({ description: 'Maximum retries', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRetries?: number;

  @ApiProperty({ description: 'Retry delay in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  retryDelaySeconds?: number;

  @ApiProperty({ description: 'Custom headers', required: false })
  @IsOptional()
  headers?: Record<string, string>;
}

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WebhookQueryDto {
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

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Filter by event', required: false })
  @IsOptional()
  @IsString()
  event?: string;
}

export class DeliveryQueryDto {
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

  @ApiProperty({ description: 'Filter by webhook ID', required: false })
  @IsOptional()
  @IsUUID()
  webhookId?: string;

  @ApiProperty({ description: 'Filter by event', required: false })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiProperty({ description: 'Filter by status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class TriggerWebhookDto {
  @ApiProperty({ description: 'Event name' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Entity type', required: false })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ description: 'Entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Payload data' })
  payload: Record<string, unknown>;
}
