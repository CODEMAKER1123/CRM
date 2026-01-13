import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estimate, EstimateLineItem, EstimateApprovalSignature } from './entities/estimate.entity';
import { EstimatesService } from './estimates.service';
import { EstimatesController } from './estimates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Estimate, EstimateLineItem, EstimateApprovalSignature])],
  controllers: [EstimatesController],
  providers: [EstimatesService],
  exports: [EstimatesService],
})
export class EstimatesModule {}
