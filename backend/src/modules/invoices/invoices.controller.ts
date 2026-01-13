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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from './dto/invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(tenantId, createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: InvoiceQueryDto,
  ) {
    return this.invoicesService.findAll(tenantId, query);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue invoices' })
  getOverdue(@Headers('x-tenant-id') tenantId: string) {
    return this.invoicesService.getOverdueInvoices(tenantId);
  }

  @Get('by-account/:accountId')
  @ApiOperation({ summary: 'Get invoices by account ID' })
  findByAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.invoicesService.findByAccount(tenantId, accountId);
  }

  @Get('outstanding-balance/:accountId')
  @ApiOperation({ summary: 'Get outstanding balance for an account' })
  getOutstandingBalance(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.invoicesService.getOutstandingBalance(tenantId, accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoicesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(tenantId, id, updateInvoiceDto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send an invoice to the customer' })
  send(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoicesService.send(tenantId, id);
  }

  @Post(':id/viewed')
  @ApiOperation({ summary: 'Mark an invoice as viewed' })
  markViewed(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoicesService.markViewed(tenantId, id);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void an invoice' })
  voidInvoice(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.invoicesService.voidInvoice(tenantId, id, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft invoice' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoicesService.remove(tenantId, id);
  }
}
