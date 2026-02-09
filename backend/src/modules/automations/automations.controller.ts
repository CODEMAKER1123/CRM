import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationsService } from './automations.service';
import {
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
  AutomationQueryDto,
  ExecutionQueryDto,
  CreateFollowUpSequenceDto,
} from './dto/automation.dto';

@ApiTags('automations')
@ApiBearerAuth()
@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  // =====================
  // Rules
  // =====================

  @Post('rules')
  @ApiOperation({ summary: 'Create a new automation rule' })
  createRule(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateAutomationRuleDto,
  ) {
    return this.automationsService.createRule(tenantId, createDto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List automation rules with filtering' })
  findAllRules(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: AutomationQueryDto,
  ) {
    return this.automationsService.findAllRules(tenantId, query);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get an automation rule by ID' })
  findOneRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.automationsService.findOneRule(tenantId, id);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update an automation rule' })
  updateRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAutomationRuleDto,
  ) {
    return this.automationsService.updateRule(tenantId, id, updateDto);
  }

  @Post('rules/:id/toggle-active')
  @ApiOperation({ summary: 'Enable or disable an automation rule' })
  toggleActive(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.automationsService.toggleActive(tenantId, id, isActive);
  }

  @Post('rules/:id/toggle-test-mode')
  @ApiOperation({ summary: 'Enable or disable test mode for a rule' })
  toggleTestMode(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('testMode') testMode: boolean,
  ) {
    return this.automationsService.toggleTestMode(tenantId, id, testMode);
  }

  // =====================
  // Executions
  // =====================

  @Get('executions')
  @ApiOperation({ summary: 'List automation execution logs' })
  findExecutions(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.automationsService.findExecutions(tenantId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get execution statistics for a date range' })
  getExecutionStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.automationsService.getExecutionStats(tenantId, startDate, endDate);
  }

  // =====================
  // Follow-Up Sequences
  // =====================

  @Post('sequences')
  @ApiOperation({ summary: 'Start a follow-up sequence for a lead' })
  startFollowUpSequence(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateFollowUpSequenceDto,
  ) {
    return this.automationsService.startFollowUpSequence(
      tenantId,
      createDto.leadId,
      createDto.steps,
    );
  }

  @Post('sequences/:id/pause')
  @ApiOperation({ summary: 'Pause an active follow-up sequence' })
  pauseFollowUpSequence(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.automationsService.pauseFollowUpSequence(tenantId, id);
  }

  @Post('sequences/:id/cancel')
  @ApiOperation({ summary: 'Cancel a follow-up sequence' })
  cancelFollowUpSequence(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.automationsService.cancelFollowUpSequence(tenantId, id);
  }
}
