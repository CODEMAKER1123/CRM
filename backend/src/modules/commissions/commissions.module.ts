import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommissionRule,
  BonusRule,
  CommissionRecord,
  BonusRecord,
  JobExpense,
} from './entities/commission.entity';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommissionRule,
      BonusRule,
      CommissionRecord,
      BonusRecord,
      JobExpense,
    ]),
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
