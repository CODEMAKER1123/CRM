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
import { RoutesService } from './routes.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  UpdateRouteStopDto,
  RouteQueryDto,
  CreateServiceTerritoryDto,
  UpdateServiceTerritoryDto,
} from './dto/route.dto';

@ApiTags('routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createRouteDto: CreateRouteDto,
  ) {
    return this.routesService.create(tenantId, createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routes with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: RouteQueryDto,
  ) {
    return this.routesService.findAll(tenantId, query);
  }

  @Get('by-crew/:crewId/date/:date')
  @ApiOperation({ summary: 'Get route by crew and date' })
  findByCrewAndDate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('crewId', ParseUUIDPipe) crewId: string,
    @Param('date') date: string,
  ) {
    return this.routesService.findByCrewAndDate(tenantId, crewId, new Date(date));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a route by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a route' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ) {
    return this.routesService.update(tenantId, id, updateRouteDto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a route' })
  startRoute(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.startRoute(tenantId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a route' })
  completeRoute(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.completeRoute(tenantId, id);
  }

  @Post(':id/reorder-stops')
  @ApiOperation({ summary: 'Reorder route stops' })
  reorderStops(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { stopOrders: { stopId: string; order: number }[] },
  ) {
    return this.routesService.reorderStops(tenantId, id, body.stopOrders);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a route' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.remove(tenantId, id);
  }
}

@ApiTags('route-stops')
@ApiBearerAuth()
@Controller('route-stops')
export class RouteStopsController {
  constructor(private readonly routesService: RoutesService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update a route stop' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStopDto: UpdateRouteStopDto,
  ) {
    return this.routesService.updateStop(tenantId, id, updateStopDto);
  }

  @Post(':id/arrive')
  @ApiOperation({ summary: 'Mark arrival at stop' })
  arrive(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.arriveAtStop(tenantId, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start work at stop' })
  start(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.startStop(tenantId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete stop' })
  complete(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.completeStop(tenantId, id);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip stop' })
  skip(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.routesService.skipStop(tenantId, id, reason);
  }
}

@ApiTags('service-territories')
@ApiBearerAuth()
@Controller('service-territories')
export class ServiceTerritoriesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service territory' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateServiceTerritoryDto,
  ) {
    return this.routesService.createTerritory(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service territories' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.routesService.findAllTerritories(tenantId, isActive);
  }

  @Get('by-zip/:zipCode')
  @ApiOperation({ summary: 'Find territory by ZIP code' })
  findByZipCode(
    @Headers('x-tenant-id') tenantId: string,
    @Param('zipCode') zipCode: string,
  ) {
    return this.routesService.findTerritoryByZipCode(tenantId, zipCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service territory by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.findOneTerritory(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service territory' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateServiceTerritoryDto,
  ) {
    return this.routesService.updateTerritory(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a service territory' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.removeTerritory(tenantId, id);
  }
}
