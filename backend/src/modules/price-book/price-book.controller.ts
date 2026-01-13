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
import { PriceBookService } from './price-book.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  CreatePricingRuleDto,
  UpdatePricingRuleDto,
  CreateDiscountDto,
  UpdateDiscountDto,
  ServiceQueryDto,
} from './dto/price-book.dto';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateServiceDto,
  ) {
    return this.priceBookService.createService(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ServiceQueryDto,
  ) {
    return this.priceBookService.findAllServices(tenantId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all service categories' })
  getCategories(@Headers('x-tenant-id') tenantId: string) {
    return this.priceBookService.getServiceCategories(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.findOneService(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateServiceDto,
  ) {
    return this.priceBookService.updateService(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a service' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.removeService(tenantId, id);
  }

  @Post(':id/calculate-price')
  @ApiOperation({ summary: 'Calculate price for a service' })
  calculatePrice(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() variables: Record<string, unknown>,
  ) {
    return this.priceBookService.calculatePrice(tenantId, id, variables);
  }
}

@ApiTags('pricing-rules')
@ApiBearerAuth()
@Controller('pricing-rules')
export class PricingRulesController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pricing rule' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreatePricingRuleDto,
  ) {
    return this.priceBookService.createPricingRule(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pricing rules' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.priceBookService.findAllPricingRules(tenantId, serviceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pricing rule by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.findOnePricingRule(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pricing rule' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePricingRuleDto,
  ) {
    return this.priceBookService.updatePricingRule(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pricing rule' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.removePricingRule(tenantId, id);
  }
}

@ApiTags('discounts')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discount' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateDiscountDto,
  ) {
    return this.priceBookService.createDiscount(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.priceBookService.findAllDiscounts(tenantId, isActive);
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Find discount by code' })
  findByCode(
    @Headers('x-tenant-id') tenantId: string,
    @Param('code') code: string,
  ) {
    return this.priceBookService.findDiscountByCode(tenantId, code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a discount by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.findOneDiscount(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDiscountDto,
  ) {
    return this.priceBookService.updateDiscount(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a discount' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.removeDiscount(tenantId, id);
  }
}

@ApiTags('packages')
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.priceBookService.findAllPackages(tenantId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.priceBookService.findOnePackage(tenantId, id);
  }
}
