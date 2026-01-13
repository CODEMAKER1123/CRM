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
import { MarketingService } from './marketing.service';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateAutomationSequenceDto,
  UpdateAutomationSequenceDto,
  CreateSequenceStepDto,
  CampaignQueryDto,
} from './dto/marketing.dto';

@ApiTags('email-templates')
@ApiBearerAuth()
@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new email template' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateEmailTemplateDto,
  ) {
    return this.marketingService.createEmailTemplate(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.marketingService.findAllEmailTemplates(tenantId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an email template by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.findOneEmailTemplate(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an email template' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmailTemplateDto,
  ) {
    return this.marketingService.updateEmailTemplate(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an email template' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.removeEmailTemplate(tenantId, id);
  }
}

@ApiTags('campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateCampaignDto,
  ) {
    return this.marketingService.createCampaign(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: CampaignQueryDto,
  ) {
    return this.marketingService.findAllCampaigns(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.findOneCampaign(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCampaignDto,
  ) {
    return this.marketingService.updateCampaign(tenantId, id, updateDto);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule a campaign' })
  schedule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('scheduledAt') scheduledAt: Date,
  ) {
    return this.marketingService.scheduleCampaign(tenantId, id, scheduledAt);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a campaign' })
  start(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.startCampaign(tenantId, id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a campaign' })
  pause(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.pauseCampaign(tenantId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a campaign' })
  complete(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.completeCampaign(tenantId, id);
  }
}

@ApiTags('automation-sequences')
@ApiBearerAuth()
@Controller('automation-sequences')
export class AutomationSequencesController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new automation sequence' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateAutomationSequenceDto,
  ) {
    return this.marketingService.createSequence(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all automation sequences' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.marketingService.findAllSequences(tenantId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an automation sequence by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketingService.findOneSequence(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an automation sequence' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAutomationSequenceDto,
  ) {
    return this.marketingService.updateSequence(tenantId, id, updateDto);
  }

  @Post(':id/steps')
  @ApiOperation({ summary: 'Add a step to a sequence' })
  addStep(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) sequenceId: string,
    @Body() createDto: Omit<CreateSequenceStepDto, 'sequenceId'>,
  ) {
    return this.marketingService.addStep(tenantId, { ...createDto, sequenceId });
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Enroll a contact in a sequence' })
  enroll(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) sequenceId: string,
    @Body() body: { contactId: string; accountId?: string; contextData?: Record<string, unknown> },
  ) {
    return this.marketingService.enrollContact(
      tenantId,
      sequenceId,
      body.contactId,
      body.accountId,
      body.contextData,
    );
  }
}

@ApiTags('review-requests')
@ApiBearerAuth()
@Controller('review-requests')
export class ReviewRequestsController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review request' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { jobId: string; accountId: string; contactId: string },
  ) {
    return this.marketingService.createReviewRequest(
      tenantId,
      body.jobId,
      body.accountId,
      body.contactId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all review requests' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.marketingService.findReviewRequests(tenantId, status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review request' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status?: string; rating?: number; reviewText?: string },
  ) {
    return this.marketingService.updateReviewRequest(tenantId, id, body);
  }
}
