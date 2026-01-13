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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto, RefundPaymentDto } from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new payment' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(tenantId, createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.paymentsService.findAll(tenantId, query);
  }

  @Get('by-account/:accountId')
  @ApiOperation({ summary: 'Get payments by account ID' })
  findByAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.paymentsService.findByAccount(tenantId, accountId);
  }

  @Get('by-invoice/:invoiceId')
  @ApiOperation({ summary: 'Get payments by invoice ID' })
  findByInvoice(
    @Headers('x-tenant-id') tenantId: string,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
  ) {
    return this.paymentsService.findByInvoice(tenantId, invoiceId);
  }

  @Get('total')
  @ApiOperation({ summary: 'Get total payments for a period' })
  getTotalPayments(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.paymentsService.getTotalPayments(tenantId, startDate, endDate);
  }

  @Get('credits/:accountId')
  @ApiOperation({ summary: 'Get available credits for an account' })
  getAccountCredits(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.paymentsService.getAccountCredits(tenantId, accountId);
  }

  @Get('credits/:accountId/available')
  @ApiOperation({ summary: 'Get total available credit for an account' })
  getAvailableCredit(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.paymentsService.getAvailableCredit(tenantId, accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(tenantId, id, updatePaymentDto);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment' })
  refund(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() refundDto: RefundPaymentDto,
  ) {
    return this.paymentsService.refund(tenantId, id, refundDto);
  }

  @Post(':id/allocate')
  @ApiOperation({ summary: 'Allocate payment to an invoice' })
  allocateToInvoice(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { invoiceId: string; amount: number },
  ) {
    return this.paymentsService.allocateToInvoice(tenantId, id, body.invoiceId, body.amount);
  }

  @Post('credits')
  @ApiOperation({ summary: 'Create a credit for an account' })
  createCredit(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { accountId: string; amount: number; reason: string; sourceType?: string; sourceId?: string },
  ) {
    return this.paymentsService.createCredit(
      tenantId,
      body.accountId,
      body.amount,
      body.reason,
      body.sourceType,
      body.sourceId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pending payment' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.remove(tenantId, id);
  }
}
