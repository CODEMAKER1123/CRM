import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { LeadType } from './entities/lead.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadQueryDto,
  MoveLeadStageDto,
  ConvertLeadDto,
  AssignLeadDto,
  BulkAssignLeadsDto,
  CreateLeadActivityDto,
  LeadActivityQueryDto,
  CreatePipelineConfigDto,
  UpdatePipelineConfigDto,
} from './dto/lead.dto';
import { TenantId, UserId } from '@/common/decorators';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Lead CRUD
  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createDto: CreateLeadDto,
  ) {
    return this.leadsService.create(tenantId, createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated leads' })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: LeadQueryDto,
  ) {
    return this.leadsService.findAll(tenantId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: 200, description: 'Returns lead statistics' })
  getStats(@TenantId() tenantId: string) {
    return this.leadsService.getStats(tenantId);
  }

  @Get('overdue-followups')
  @ApiOperation({ summary: 'Get leads with overdue follow-ups' })
  @ApiResponse({ status: 200, description: 'Returns leads with overdue follow-ups' })
  getOverdueFollowUps(@TenantId() tenantId: string) {
    return this.leadsService.getOverdueFollowUps(tenantId);
  }

  @Get('pipeline/:leadType')
  @ApiOperation({ summary: 'Get pipeline view (Kanban) for a lead type' })
  @ApiResponse({ status: 200, description: 'Returns pipeline stages with leads' })
  getPipelineView(
    @TenantId() tenantId: string,
    @Param('leadType') leadType: LeadType,
  ) {
    return this.leadsService.getPipelineView(tenantId, leadType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  @ApiResponse({ status: 200, description: 'Returns the lead' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(tenantId, id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.remove(tenantId, id);
  }

  // Pipeline Stage Management
  @Patch(':id/stage')
  @ApiOperation({ summary: 'Move lead to a different pipeline stage' })
  @ApiResponse({ status: 200, description: 'Lead stage updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid stage for lead type' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  moveStage(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moveDto: MoveLeadStageDto,
  ) {
    return this.leadsService.moveStage(tenantId, id, moveDto, userId);
  }

  // Lead Conversion
  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to account/job' })
  @ApiResponse({ status: 200, description: 'Lead converted successfully' })
  @ApiResponse({ status: 400, description: 'Lead already converted' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  convertLead(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() convertDto: ConvertLeadDto,
  ) {
    return this.leadsService.convertLead(tenantId, id, convertDto, userId);
  }

  // Lead Assignment
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign lead to a user' })
  @ApiResponse({ status: 200, description: 'Lead assigned successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  assign(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignLeadDto,
  ) {
    return this.leadsService.assign(tenantId, id, assignDto, userId);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign leads to a user' })
  @ApiResponse({ status: 200, description: 'Leads assigned successfully' })
  bulkAssign(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() bulkDto: BulkAssignLeadsDto,
  ) {
    return this.leadsService.bulkAssign(tenantId, bulkDto, userId);
  }

  @Patch(':id/unassign')
  @ApiOperation({ summary: 'Unassign lead from current user' })
  @ApiResponse({ status: 200, description: 'Lead unassigned successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  unassign(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.unassign(tenantId, id, userId);
  }

  // Follow-up Management
  @Patch(':id/follow-up')
  @ApiOperation({ summary: 'Set next follow-up date for a lead' })
  @ApiResponse({ status: 200, description: 'Follow-up scheduled successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  setFollowUp(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('followUpAt') followUpAt: string,
  ) {
    return this.leadsService.setFollowUp(tenantId, id, new Date(followUpAt), userId);
  }

  @Post(':id/complete-follow-up')
  @ApiOperation({ summary: 'Mark follow-up as completed' })
  @ApiResponse({ status: 200, description: 'Follow-up completed successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  completeFollowUp(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes?: string,
  ) {
    return this.leadsService.completeFollowUp(tenantId, id, notes, userId);
  }

  // Lead Scoring
  @Patch(':id/score')
  @ApiOperation({ summary: 'Update lead score' })
  @ApiResponse({ status: 200, description: 'Lead score updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  updateScore(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('scoreChange') scoreChange: number,
    @Body('factor') factor: string,
  ) {
    return this.leadsService.updateScore(tenantId, id, scoreChange, factor, userId);
  }

  // Activity Management
  @Get(':id/activities')
  @ApiOperation({ summary: 'Get lead activities/timeline' })
  @ApiResponse({ status: 200, description: 'Returns lead activities' })
  getActivities(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: LeadActivityQueryDto,
  ) {
    return this.leadsService.getActivities(tenantId, id, query);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add activity to lead' })
  @ApiResponse({ status: 201, description: 'Activity added successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  createActivity(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() activityDto: CreateLeadActivityDto,
  ) {
    return this.leadsService.createActivity(tenantId, id, activityDto, userId);
  }

  @Post(':id/log-contact')
  @ApiOperation({ summary: 'Log a contact attempt (call, email, SMS)' })
  @ApiResponse({ status: 201, description: 'Contact logged successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  logContact(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('method') method: string,
    @Body('direction') direction: string,
    @Body('content') content?: string,
  ) {
    return this.leadsService.logContact(tenantId, id, method, direction, content, userId);
  }

  // Pipeline Configuration
  @Get('config/pipeline')
  @ApiOperation({ summary: 'Get pipeline configurations' })
  @ApiResponse({ status: 200, description: 'Returns pipeline configurations' })
  getPipelineConfigs(
    @TenantId() tenantId: string,
    @Query('leadType') leadType?: LeadType,
  ) {
    return this.leadsService.getPipelineConfigs(tenantId, leadType);
  }

  @Post('config/pipeline')
  @ApiOperation({ summary: 'Create a custom pipeline stage' })
  @ApiResponse({ status: 201, description: 'Pipeline stage created successfully' })
  createPipelineConfig(
    @TenantId() tenantId: string,
    @Body() configDto: CreatePipelineConfigDto,
  ) {
    return this.leadsService.createPipelineConfig(tenantId, configDto);
  }

  @Put('config/pipeline/:id')
  @ApiOperation({ summary: 'Update a pipeline stage configuration' })
  @ApiResponse({ status: 200, description: 'Pipeline stage updated successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline config not found' })
  updatePipelineConfig(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePipelineConfigDto,
  ) {
    return this.leadsService.updatePipelineConfig(tenantId, id, updateDto);
  }

  @Delete('config/pipeline/:id')
  @ApiOperation({ summary: 'Delete a pipeline stage configuration' })
  @ApiResponse({ status: 200, description: 'Pipeline stage deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline config not found' })
  deletePipelineConfig(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.deletePipelineConfig(tenantId, id);
  }
}
