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
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto, JobTransitionDto, CreateJobLineItemDto, AssignCrewDto } from './dto/job.dto';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job/work order' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(tenantId, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: JobQueryDto,
  ) {
    return this.jobsService.findAll(tenantId, query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get jobs for calendar view' })
  getCalendarJobs(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('crewId') crewId?: string,
  ) {
    return this.jobsService.getJobsByDateRange(
      tenantId,
      new Date(startDate),
      new Date(endDate),
      crewId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(tenantId, id, updateJobDto);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transition job to a new status' })
  transition(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transitionDto: JobTransitionDto,
  ) {
    return this.jobsService.transition(tenantId, id, transitionDto);
  }

  @Get(':id/available-transitions')
  @ApiOperation({ summary: 'Get available status transitions for a job' })
  getAvailableTransitions(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.getAvailableTransitions(tenantId, id);
  }

  @Post(':id/line-items')
  @ApiOperation({ summary: 'Add a line item to a job' })
  addLineItem(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() lineItemDto: CreateJobLineItemDto,
  ) {
    return this.jobsService.addLineItem(tenantId, id, lineItemDto);
  }

  @Post(':id/assignments')
  @ApiOperation({ summary: 'Assign a crew member to a job' })
  assignCrew(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignCrewDto,
  ) {
    return this.jobsService.assignCrew(
      tenantId,
      id,
      assignDto.crewMemberId,
      assignDto.role,
      assignDto.crewId,
    );
  }
}
