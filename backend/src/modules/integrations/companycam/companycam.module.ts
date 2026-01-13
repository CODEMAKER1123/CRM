import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyCamConnection, CompanyCamProject, CompanyCamPhoto } from './entities/companycam.entity';
import { CompanyCamService } from './companycam.service';
import { CompanyCamController } from './companycam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyCamConnection, CompanyCamProject, CompanyCamPhoto])],
  controllers: [CompanyCamController],
  providers: [CompanyCamService],
  exports: [CompanyCamService],
})
export class CompanyCamModule {}
