import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route, RouteStop, ServiceTerritory } from './entities/route.entity';
import { RoutesService } from './routes.service';
import { RoutesController, RouteStopsController, ServiceTerritoriesController } from './routes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RouteStop, ServiceTerritory])],
  controllers: [RoutesController, RouteStopsController, ServiceTerritoriesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
