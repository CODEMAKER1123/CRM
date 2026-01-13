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
import { QuickBooksService } from './quickbooks.service';
import { ConnectQuickBooksDto, UpdateQuickBooksSettingsDto, QuickBooksSyncQueryDto } from './dto/quickbooks.dto';

@ApiTags('quickbooks')
@ApiBearerAuth()
@Controller('integrations/quickbooks')
export class QuickBooksController {
  constructor(private readonly quickBooksService: QuickBooksService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect to QuickBooks' })
  connect(
    @Headers('x-tenant-id') tenantId: string,
    @Body() connectDto: ConnectQuickBooksDto,
  ) {
    return this.quickBooksService.connect(tenantId, connectDto);
  }

  @Delete('disconnect')
  @ApiOperation({ summary: 'Disconnect from QuickBooks' })
  disconnect(@Headers('x-tenant-id') tenantId: string) {
    return this.quickBooksService.disconnect(tenantId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get QuickBooks connection status' })
  getStatus(@Headers('x-tenant-id') tenantId: string) {
    return this.quickBooksService.getConnectionStatus(tenantId);
  }

  @Get('connection')
  @ApiOperation({ summary: 'Get QuickBooks connection details' })
  getConnection(@Headers('x-tenant-id') tenantId: string) {
    return this.quickBooksService.getConnection(tenantId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update QuickBooks sync settings' })
  updateSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() settings: UpdateQuickBooksSettingsDto,
  ) {
    return this.quickBooksService.updateSettings(tenantId, settings);
  }

  @Post('refresh-tokens')
  @ApiOperation({ summary: 'Refresh QuickBooks OAuth tokens' })
  refreshTokens(@Headers('x-tenant-id') tenantId: string) {
    return this.quickBooksService.refreshTokens(tenantId);
  }

  @Post('sync/customer/:accountId')
  @ApiOperation({ summary: 'Sync a customer to QuickBooks' })
  syncCustomer(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.quickBooksService.syncCustomer(tenantId, accountId);
  }

  @Post('sync/invoice/:invoiceId')
  @ApiOperation({ summary: 'Sync an invoice to QuickBooks' })
  syncInvoice(
    @Headers('x-tenant-id') tenantId: string,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
  ) {
    return this.quickBooksService.syncInvoice(tenantId, invoiceId);
  }

  @Post('sync/payment/:paymentId')
  @ApiOperation({ summary: 'Sync a payment to QuickBooks' })
  syncPayment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.quickBooksService.syncPayment(tenantId, paymentId);
  }

  @Post('sync/full')
  @ApiOperation({ summary: 'Run a full sync with QuickBooks' })
  runFullSync(@Headers('x-tenant-id') tenantId: string) {
    return this.quickBooksService.runFullSync(tenantId);
  }

  @Get('mappings/pending')
  @ApiOperation({ summary: 'Get pending sync mappings' })
  getPendingMappings(
    @Headers('x-tenant-id') tenantId: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.quickBooksService.getPendingMappings(tenantId, entityType);
  }

  @Get('mappings/errors')
  @ApiOperation({ summary: 'Get mappings with sync errors' })
  getErrorMappings(@Headers('x-tenant-id') tenantId: string) {
    return this.quickBooksService.getErrorMappings(tenantId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get sync logs' })
  getSyncLogs(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: QuickBooksSyncQueryDto,
  ) {
    return this.quickBooksService.findSyncLogs(tenantId, query);
  }
}
