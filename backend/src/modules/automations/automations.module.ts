import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AutomationRule,
  AutomationExecution,
  FollowUpSequence,
} from './entities/automation.entity';
import { AutomationsService } from './automations.service';
import { AutomationsController } from './automations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutomationRule,
      AutomationExecution,
      FollowUpSequence,
    ]),
  ],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
