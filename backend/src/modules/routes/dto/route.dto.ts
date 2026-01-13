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
import { RouteStopStatus } from '@/common/enums';

export class CreateRouteStopDto {
  @ApiProperty({ description: 'Job ID' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ description: 'Stop order' })
  @IsNumber()
  @Min(0)
  stopOrder: number;

  @ApiProperty({ description: 'Scheduled arrival', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledArrival?: Date;

  @ApiProperty({ description: 'Scheduled departure', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDeparture?: Date;

  @ApiProperty({ description: 'Estimated duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationMinutes?: number;

  @ApiProperty({ description: 'Time window start', required: false })
  @IsOptional()
  @IsString()
  windowStart?: string;

  @ApiProperty({ description: 'Time window end', required: false })
  @IsOptional()
  @IsString()
  windowEnd?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRouteDto {
  @ApiProperty({ description: 'Route date' })
  @Type(() => Date)
  @IsDate()
  routeDate: Date;

  @ApiProperty({ description: 'Crew ID' })
  @IsUUID()
  crewId: string;

  @ApiProperty({ description: 'Route name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiProperty({ description: 'Start address', required: false })
  @IsOptional()
  @IsString()
  startAddress?: string;

  @ApiProperty({ description: 'Start latitude', required: false })
  @IsOptional()
  @IsNumber()
  startLatitude?: number;

  @ApiProperty({ description: 'Start longitude', required: false })
  @IsOptional()
  @IsNumber()
  startLongitude?: number;

  @ApiProperty({ description: 'End address', required: false })
  @IsOptional()
  @IsString()
  endAddress?: string;

  @ApiProperty({ description: 'End latitude', required: false })
  @IsOptional()
  @IsNumber()
  endLatitude?: number;

  @ApiProperty({ description: 'End longitude', required: false })
  @IsOptional()
  @IsNumber()
  endLongitude?: number;

  @ApiProperty({ description: 'Route stops', type: [CreateRouteStopDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStopDto)
  stops?: CreateRouteStopDto[];

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
  @ApiProperty({ description: 'Route status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateRouteStopDto {
  @ApiProperty({ enum: RouteStopStatus, description: 'Stop status', required: false })
  @IsOptional()
  @IsEnum(RouteStopStatus)
  status?: RouteStopStatus;

  @ApiProperty({ description: 'Actual arrival', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  actualArrival?: Date;

  @ApiProperty({ description: 'Actual departure', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  actualDeparture?: Date;

  @ApiProperty({ description: 'Skip reason', required: false })
  @IsOptional()
  @IsString()
  skipReason?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RouteQueryDto {
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

  @ApiProperty({ description: 'Filter by crew ID', required: false })
  @IsOptional()
  @IsUUID()
  crewId?: string;

  @ApiProperty({ description: 'Route date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  routeDate?: Date;

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

  @ApiProperty({ description: 'Filter by status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateServiceTerritoryDto {
  @ApiProperty({ description: 'Territory name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Color for display', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string;

  @ApiProperty({ description: 'ZIP codes', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zipCodes?: string[];

  @ApiProperty({ description: 'Geographic bounds', required: false })
  @IsOptional()
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  @ApiProperty({ description: 'Default crew ID', required: false })
  @IsOptional()
  @IsUUID()
  defaultCrewId?: string;
}

export class UpdateServiceTerritoryDto extends PartialType(CreateServiceTerritoryDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
