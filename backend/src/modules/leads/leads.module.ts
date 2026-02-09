import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead, Activity, LeadStageHistory } from './entities/lead.entity';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Account } from '@/modules/accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, Activity, LeadStageHistory, Account]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
