import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead, LeadActivity, LeadPipelineConfig } from './entities/lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadActivity, LeadPipelineConfig]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
