import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Route, RouteStop, ServiceTerritory } from './entities/route.entity';
import {
  CreateRouteDto,
  UpdateRouteDto,
  UpdateRouteStopDto,
  RouteQueryDto,
  CreateServiceTerritoryDto,
  UpdateServiceTerritoryDto,
} from './dto/route.dto';
import { RouteStopStatus } from '@/common/enums';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(RouteStop)
    private readonly routeStopRepository: Repository<RouteStop>,
    @InjectRepository(ServiceTerritory)
    private readonly territoryRepository: Repository<ServiceTerritory>,
  ) {}

  async create(tenantId: string, createRouteDto: CreateRouteDto): Promise<Route> {
    const { stops, ...routeData } = createRouteDto;

    const route = this.routeRepository.create({
      ...routeData,
      tenantId,
      status: 'planned',
      stopCount: stops?.length || 0,
    });

    const savedRoute = await this.routeRepository.save(route);

    if (stops && stops.length > 0) {
      const stopEntities = stops.map(stop =>
        this.routeStopRepository.create({
          ...stop,
          tenantId,
          routeId: savedRoute.id,
          status: RouteStopStatus.PENDING,
        }),
      );
      await this.routeStopRepository.save(stopEntities);
    }

    return this.findOne(tenantId, savedRoute.id);
  }

  async findAll(tenantId: string, query: RouteQueryDto): Promise<{ data: Route[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      crewId,
      routeDate,
      startDate,
      endDate,
      status,
    } = query;

    const queryBuilder = this.routeRepository.createQueryBuilder('route');
    queryBuilder.where('route.tenant_id = :tenantId', { tenantId });

    if (crewId) {
      queryBuilder.andWhere('route.crew_id = :crewId', { crewId });
    }

    if (routeDate) {
      queryBuilder.andWhere('route.route_date = :routeDate', { routeDate });
    } else if (startDate && endDate) {
      queryBuilder.andWhere('route.route_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (status) {
      queryBuilder.andWhere('route.status = :status', { status });
    }

    queryBuilder.leftJoinAndSelect('route.crew', 'crew');
    queryBuilder.leftJoinAndSelect('route.stops', 'stops');
    queryBuilder.orderBy('route.route_date', 'DESC');
    queryBuilder.addOrderBy('route.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id, tenantId },
      relations: ['crew', 'stops', 'stops.job'],
    });
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return route;
  }

  async findByCrewAndDate(tenantId: string, crewId: string, routeDate: Date): Promise<Route | null> {
    return this.routeRepository.findOne({
      where: { tenantId, crewId, routeDate },
      relations: ['crew', 'stops', 'stops.job'],
    });
  }

  async update(tenantId: string, id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(tenantId, id);
    const { stops, ...routeData } = updateRouteDto;

    Object.assign(route, routeData);
    await this.routeRepository.save(route);

    if (stops !== undefined) {
      await this.routeStopRepository.delete({ routeId: id });
      if (stops.length > 0) {
        const stopEntities = stops.map(stop =>
          this.routeStopRepository.create({
            ...stop,
            tenantId,
            routeId: id,
            status: RouteStopStatus.PENDING,
          }),
        );
        await this.routeStopRepository.save(stopEntities);
      }
      route.stopCount = stops.length;
      await this.routeRepository.save(route);
    }

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const route = await this.findOne(tenantId, id);
    await this.routeRepository.remove(route);
  }

  async startRoute(tenantId: string, id: string): Promise<Route> {
    const route = await this.findOne(tenantId, id);
    route.status = 'in_progress';
    route.startedAt = new Date();
    return this.routeRepository.save(route);
  }

  async completeRoute(tenantId: string, id: string): Promise<Route> {
    const route = await this.findOne(tenantId, id);
    route.status = 'completed';
    route.completedAt = new Date();

    // Calculate actual duration
    if (route.startedAt) {
      route.actualDurationMinutes = Math.floor(
        (route.completedAt.getTime() - route.startedAt.getTime()) / 60000,
      );
    }

    return this.routeRepository.save(route);
  }

  // Route Stops
  async updateStop(tenantId: string, stopId: string, updateStopDto: UpdateRouteStopDto): Promise<RouteStop> {
    const stop = await this.routeStopRepository.findOne({
      where: { id: stopId, tenantId },
    });
    if (!stop) {
      throw new NotFoundException(`Route stop with ID ${stopId} not found`);
    }

    Object.assign(stop, updateStopDto);

    // Calculate actual duration if both arrival and departure are set
    if (stop.actualArrival && stop.actualDeparture) {
      stop.actualDurationMinutes = Math.floor(
        (stop.actualDeparture.getTime() - stop.actualArrival.getTime()) / 60000,
      );
    }

    return this.routeStopRepository.save(stop);
  }

  async arriveAtStop(tenantId: string, stopId: string): Promise<RouteStop> {
    const stop = await this.routeStopRepository.findOne({
      where: { id: stopId, tenantId },
    });
    if (!stop) {
      throw new NotFoundException(`Route stop with ID ${stopId} not found`);
    }

    stop.status = RouteStopStatus.ARRIVED;
    stop.actualArrival = new Date();
    return this.routeStopRepository.save(stop);
  }

  async startStop(tenantId: string, stopId: string): Promise<RouteStop> {
    const stop = await this.routeStopRepository.findOne({
      where: { id: stopId, tenantId },
    });
    if (!stop) {
      throw new NotFoundException(`Route stop with ID ${stopId} not found`);
    }

    stop.status = RouteStopStatus.IN_PROGRESS;
    return this.routeStopRepository.save(stop);
  }

  async completeStop(tenantId: string, stopId: string): Promise<RouteStop> {
    const stop = await this.routeStopRepository.findOne({
      where: { id: stopId, tenantId },
    });
    if (!stop) {
      throw new NotFoundException(`Route stop with ID ${stopId} not found`);
    }

    stop.status = RouteStopStatus.COMPLETED;
    stop.actualDeparture = new Date();

    if (stop.actualArrival) {
      stop.actualDurationMinutes = Math.floor(
        (stop.actualDeparture.getTime() - stop.actualArrival.getTime()) / 60000,
      );
    }

    return this.routeStopRepository.save(stop);
  }

  async skipStop(tenantId: string, stopId: string, reason: string): Promise<RouteStop> {
    const stop = await this.routeStopRepository.findOne({
      where: { id: stopId, tenantId },
    });
    if (!stop) {
      throw new NotFoundException(`Route stop with ID ${stopId} not found`);
    }

    stop.status = RouteStopStatus.SKIPPED;
    stop.skipReason = reason;
    return this.routeStopRepository.save(stop);
  }

  async reorderStops(tenantId: string, routeId: string, stopOrders: { stopId: string; order: number }[]): Promise<Route> {
    for (const { stopId, order } of stopOrders) {
      await this.routeStopRepository.update(
        { id: stopId, tenantId, routeId },
        { stopOrder: order },
      );
    }
    return this.findOne(tenantId, routeId);
  }

  // Service Territories
  async createTerritory(tenantId: string, createDto: CreateServiceTerritoryDto): Promise<ServiceTerritory> {
    const territory = this.territoryRepository.create({
      ...createDto,
      tenantId,
    });
    return this.territoryRepository.save(territory);
  }

  async findAllTerritories(tenantId: string, isActive?: boolean): Promise<ServiceTerritory[]> {
    const where: any = { tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.territoryRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOneTerritory(tenantId: string, id: string): Promise<ServiceTerritory> {
    const territory = await this.territoryRepository.findOne({
      where: { id, tenantId },
    });
    if (!territory) {
      throw new NotFoundException(`Territory with ID ${id} not found`);
    }
    return territory;
  }

  async updateTerritory(tenantId: string, id: string, updateDto: UpdateServiceTerritoryDto): Promise<ServiceTerritory> {
    const territory = await this.findOneTerritory(tenantId, id);
    Object.assign(territory, updateDto);
    return this.territoryRepository.save(territory);
  }

  async removeTerritory(tenantId: string, id: string): Promise<void> {
    const territory = await this.findOneTerritory(tenantId, id);
    territory.isActive = false;
    await this.territoryRepository.save(territory);
  }

  async findTerritoryByZipCode(tenantId: string, zipCode: string): Promise<ServiceTerritory | null> {
    const territories = await this.territoryRepository.find({
      where: { tenantId, isActive: true },
    });

    return territories.find(t => t.zipCodes?.includes(zipCode)) || null;
  }
}
