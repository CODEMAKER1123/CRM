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
import { WebhooksService } from './webhooks.service';
import {
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookQueryDto,
  DeliveryQueryDto,
  TriggerWebhookDto,
} from './dto/webhook.dto';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all webhooks' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: WebhookQueryDto,
  ) {
    return this.webhooksService.findAll(tenantId, query);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get available webhook events' })
  getAvailableEvents() {
    return this.webhooksService.getAvailableEvents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWebhookDto,
  ) {
    return this.webhooksService.update(tenantId, id, updateDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a webhook' })
  activate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.activate(tenantId, id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a webhook' })
  deactivate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.deactivate(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.remove(tenantId, id);
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger a webhook event' })
  trigger(
    @Headers('x-tenant-id') tenantId: string,
    @Body() triggerDto: TriggerWebhookDto,
  ) {
    return this.webhooksService.trigger(tenantId, triggerDto);
  }
}

@ApiTags('webhook-deliveries')
@ApiBearerAuth()
@Controller('webhook-deliveries')
export class WebhookDeliveriesController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'Get webhook deliveries' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: DeliveryQueryDto,
  ) {
    return this.webhooksService.findDeliveries(tenantId, query);
  }

  @Get('pending-retries')
  @ApiOperation({ summary: 'Get deliveries pending retry' })
  getPendingRetries(@Headers('x-tenant-id') tenantId: string) {
    return this.webhooksService.getPendingRetries(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.findOneDelivery(tenantId, id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a failed delivery' })
  retry(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhooksService.retryDelivery(tenantId, id);
  }
}

@ApiTags('inbound-webhooks')
@Controller('inbound-webhooks')
export class InboundWebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'Get inbound webhooks' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('source') source?: string,
    @Query('processed') processed?: boolean,
    @Query('limit') limit?: number,
  ) {
    return this.webhooksService.findInboundWebhooks(tenantId, source, processed, limit);
  }
}
