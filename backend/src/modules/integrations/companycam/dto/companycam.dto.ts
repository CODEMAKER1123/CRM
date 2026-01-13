import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsArray,
  Length,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ConnectCompanyCamDto {
  @ApiProperty({ description: 'OAuth access token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'OAuth refresh token', required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class UpdateCompanyCamSettingsDto {
  @ApiProperty({ description: 'Auto create projects for new jobs', required: false })
  @IsOptional()
  @IsBoolean()
  autoCreateProjects?: boolean;

  @ApiProperty({ description: 'Auto sync photos from CompanyCam', required: false })
  @IsOptional()
  @IsBoolean()
  autoSyncPhotos?: boolean;

  @ApiProperty({ description: 'Default tags for photos', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultTags?: string[];
}

export class CreateProjectDto {
  @ApiProperty({ description: 'Job ID' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ description: 'Project name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiProperty({ description: 'Project address', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  address?: string;
}

export class UpdatePhotoDto {
  @ApiProperty({ description: 'Photo stage', required: false })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiProperty({ description: 'Is featured', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Show in customer portal', required: false })
  @IsOptional()
  @IsBoolean()
  showInPortal?: boolean;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PhotoQueryDto {
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

  @ApiProperty({ description: 'Filter by job ID', required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ description: 'Filter by project ID', required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Filter by stage', required: false })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiProperty({ description: 'Filter by featured', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
