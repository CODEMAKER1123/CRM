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
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadQueryDto,
  TransitionLeadDto,
  CreateActivityDto,
} from './dto/lead.dto';

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createLeadDto: CreateLeadDto,
  ) {
    return this.leadsService.create(tenantId, createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'List leads with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: LeadQueryDto,
  ) {
    return this.leadsService.findAll(tenantId, query);
  }

  @Get('pipeline-stats')
  @ApiOperation({ summary: 'Get stage counts for a pipeline' })
  getPipelineStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('pipeline') pipeline: string,
  ) {
    return this.leadsService.getPipelineStats(tenantId, pipeline);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead detail with activities and stage history' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(tenantId, id, updateLeadDto);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transition lead to a new stage' })
  transition(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transitionDto: TransitionLeadDto,
  ) {
    return this.leadsService.transition(
      tenantId,
      id,
      transitionDto.toStage,
      undefined,
      transitionDto.reason,
    );
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add an activity to a lead' })
  addActivity(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() activityDto: CreateActivityDto,
  ) {
    return this.leadsService.addActivity(tenantId, id, activityDto);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get all activities for a lead' })
  getActivities(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.getActivities(tenantId, id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to a job (mark as WON)' })
  convert(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.convertToJob(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a lead' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.remove(tenantId, id);
  }
}
