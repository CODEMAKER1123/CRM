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
import { CommissionsService } from './commissions.service';
import {
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
  CreateBonusRuleDto,
  CommissionQueryDto,
  RuleQueryDto,
  CreateJobExpenseDto,
  TestRuleDto,
  EvaluateBonusesDto,
} from './dto/commission.dto';

@ApiTags('commissions')
@ApiBearerAuth()
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  // ---------------------------------------------------------------------------
  // Commission Rules
  // ---------------------------------------------------------------------------

  @Post('rules')
  @ApiOperation({ summary: 'Create a new commission rule' })
  createRule(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateCommissionRuleDto,
  ) {
    return this.commissionsService.createRule(tenantId, dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List commission rules with filtering' })
  findAllRules(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: RuleQueryDto,
  ) {
    return this.commissionsService.findAllRules(tenantId, query);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get a commission rule by ID' })
  findOneRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commissionsService.findOneRule(tenantId, id);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update a commission rule (creates new version, deactivates old)' })
  updateRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommissionRuleDto,
  ) {
    return this.commissionsService.updateRule(tenantId, id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Deactivate a commission rule' })
  deactivateRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commissionsService.deactivateRule(tenantId, id);
  }

  @Post('rules/:id/test')
  @ApiOperation({ summary: 'Test a commission rule against a past job' })
  testRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestRuleDto,
  ) {
    return this.commissionsService.testRule(tenantId, id, dto.jobId);
  }

  // ---------------------------------------------------------------------------
  // Bonus Rules
  // ---------------------------------------------------------------------------

  @Post('bonus-rules')
  @ApiOperation({ summary: 'Create a new bonus rule' })
  createBonusRule(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateBonusRuleDto,
  ) {
    return this.commissionsService.createBonusRule(tenantId, dto);
  }

  @Get('bonus-rules')
  @ApiOperation({ summary: 'List bonus rules with filtering' })
  findAllBonusRules(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: RuleQueryDto,
  ) {
    return this.commissionsService.findAllBonusRules(tenantId, query);
  }

  // ---------------------------------------------------------------------------
  // Bonus Evaluation
  // ---------------------------------------------------------------------------

  @Post('evaluate-bonuses')
  @ApiOperation({ summary: 'Trigger monthly bonus evaluation' })
  evaluateMonthlyBonuses(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: EvaluateBonusesDto,
  ) {
    return this.commissionsService.evaluateMonthlyBonuses(tenantId, dto.month, dto.year);
  }

  // ---------------------------------------------------------------------------
  // Commission Records
  // ---------------------------------------------------------------------------

  @Get('records')
  @ApiOperation({ summary: 'List commission records with filtering' })
  findAllRecords(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: CommissionQueryDto,
  ) {
    return this.commissionsService.findAllRecords(tenantId, query);
  }

  @Post('records/:id/approve')
  @ApiOperation({ summary: 'Approve a commission record' })
  approveRecord(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.commissionsService.approveRecord(tenantId, id, approvedBy);
  }

  // ---------------------------------------------------------------------------
  // Job Expenses
  // ---------------------------------------------------------------------------

  @Post('jobs/:jobId/expenses')
  @ApiOperation({ summary: 'Add an expense to a job' })
  addJobExpense(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateJobExpenseDto,
  ) {
    return this.commissionsService.addJobExpense(tenantId, jobId, dto);
  }

  @Get('jobs/:jobId/expenses')
  @ApiOperation({ summary: 'Get expenses for a job' })
  findJobExpenses(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.commissionsService.findJobExpenses(tenantId, jobId);
  }

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------

  @Get('report')
  @ApiOperation({ summary: 'Get commission report for a date range' })
  getCommissionReport(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.commissionsService.getCommissionReport(tenantId, startDate, endDate);
  }
}
