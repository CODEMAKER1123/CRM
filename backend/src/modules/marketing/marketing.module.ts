import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EmailTemplate,
  SmsTemplate,
  Campaign,
  AutomationSequence,
  SequenceStep,
  SequenceEnrollment,
  MarketingEvent,
  ReviewRequest,
} from './entities/marketing.entity';
import { MarketingService } from './marketing.service';
import {
  EmailTemplatesController,
  CampaignsController,
  AutomationSequencesController,
  ReviewRequestsController,
} from './marketing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailTemplate,
      SmsTemplate,
      Campaign,
      AutomationSequence,
      SequenceStep,
      SequenceEnrollment,
      MarketingEvent,
      ReviewRequest,
    ]),
  ],
  controllers: [
    EmailTemplatesController,
    CampaignsController,
    AutomationSequencesController,
    ReviewRequestsController,
  ],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
