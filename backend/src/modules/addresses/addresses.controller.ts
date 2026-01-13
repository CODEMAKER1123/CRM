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
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto, AddressQueryDto } from './dto/address.dto';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(tenantId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: AddressQueryDto,
  ) {
    return this.addressesService.findAll(tenantId, query);
  }

  @Get('by-account/:accountId')
  @ApiOperation({ summary: 'Get addresses by account ID' })
  findByAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.addressesService.findByAccount(tenantId, accountId);
  }

  @Get('by-territory/:territory')
  @ApiOperation({ summary: 'Get addresses by service territory' })
  findByTerritory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('territory') territory: string,
  ) {
    return this.addressesService.findByTerritory(tenantId, territory);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an address by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(tenantId, id, updateAddressDto);
  }

  @Patch(':id/set-primary')
  @ApiOperation({ summary: 'Set address as primary for its account' })
  setPrimary(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.addressesService.setPrimary(tenantId, accountId, id);
  }

  @Patch(':id/geolocation')
  @ApiOperation({ summary: 'Update address geolocation' })
  updateGeolocation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.addressesService.updateGeolocation(tenantId, id, body.latitude, body.longitude);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressesService.remove(tenantId, id);
  }
}
