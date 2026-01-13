import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyCamService } from './companycam.service';
import {
  ConnectCompanyCamDto,
  UpdateCompanyCamSettingsDto,
  CreateProjectDto,
  UpdatePhotoDto,
  PhotoQueryDto,
} from './dto/companycam.dto';

@ApiTags('companycam')
@ApiBearerAuth()
@Controller('integrations/companycam')
export class CompanyCamController {
  constructor(private readonly companyCamService: CompanyCamService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect to CompanyCam' })
  connect(
    @Headers('x-tenant-id') tenantId: string,
    @Body() connectDto: ConnectCompanyCamDto,
  ) {
    return this.companyCamService.connect(tenantId, connectDto);
  }

  @Delete('disconnect')
  @ApiOperation({ summary: 'Disconnect from CompanyCam' })
  disconnect(@Headers('x-tenant-id') tenantId: string) {
    return this.companyCamService.disconnect(tenantId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get CompanyCam connection status' })
  getStatus(@Headers('x-tenant-id') tenantId: string) {
    return this.companyCamService.getConnectionStatus(tenantId);
  }

  @Get('connection')
  @ApiOperation({ summary: 'Get CompanyCam connection details' })
  getConnection(@Headers('x-tenant-id') tenantId: string) {
    return this.companyCamService.getConnection(tenantId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update CompanyCam settings' })
  updateSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() settings: UpdateCompanyCamSettingsDto,
  ) {
    return this.companyCamService.updateSettings(tenantId, settings);
  }

  // Projects
  @Post('projects')
  @ApiOperation({ summary: 'Create a CompanyCam project' })
  createProject(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateProjectDto,
  ) {
    return this.companyCamService.createProject(tenantId, createDto);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get all CompanyCam projects' })
  findAllProjects(@Headers('x-tenant-id') tenantId: string) {
    return this.companyCamService.findAllProjects(tenantId);
  }

  @Get('projects/by-job/:jobId')
  @ApiOperation({ summary: 'Get CompanyCam project by job ID' })
  findProjectByJob(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.companyCamService.findProjectByJob(tenantId, jobId);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get a CompanyCam project by ID' })
  findOneProject(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companyCamService.findOneProject(tenantId, id);
  }

  @Post('projects/:id/sync')
  @ApiOperation({ summary: 'Sync photos for a project' })
  syncProject(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companyCamService.syncPhotosForProject(tenantId, id);
  }

  // Photos
  @Get('photos')
  @ApiOperation({ summary: 'Get all photos' })
  findAllPhotos(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: PhotoQueryDto,
  ) {
    return this.companyCamService.findAllPhotos(tenantId, query);
  }

  @Get('photos/by-job/:jobId')
  @ApiOperation({ summary: 'Get photos by job ID' })
  findPhotosByJob(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.companyCamService.findPhotosByJob(tenantId, jobId);
  }

  @Get('photos/by-job/:jobId/featured')
  @ApiOperation({ summary: 'Get featured photos for a job' })
  getFeaturedPhotos(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.companyCamService.getFeaturedPhotosForJob(tenantId, jobId);
  }

  @Get('photos/by-job/:jobId/portal')
  @ApiOperation({ summary: 'Get portal-visible photos for a job' })
  getPortalPhotos(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.companyCamService.getPortalPhotosForJob(tenantId, jobId);
  }

  @Get('photos/:id')
  @ApiOperation({ summary: 'Get a photo by ID' })
  findOnePhoto(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companyCamService.findOnePhoto(tenantId, id);
  }

  @Patch('photos/:id')
  @ApiOperation({ summary: 'Update a photo' })
  updatePhoto(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePhotoDto,
  ) {
    return this.companyCamService.updatePhoto(tenantId, id, updateDto);
  }

  @Patch('photos/:id/featured')
  @ApiOperation({ summary: 'Set photo featured status' })
  setFeatured(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isFeatured') isFeatured: boolean,
  ) {
    return this.companyCamService.setFeaturedPhoto(tenantId, id, isFeatured);
  }

  @Post('sync/job/:jobId')
  @ApiOperation({ summary: 'Sync photos for a job' })
  syncPhotosForJob(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.companyCamService.syncPhotosForJob(tenantId, jobId);
  }
}
