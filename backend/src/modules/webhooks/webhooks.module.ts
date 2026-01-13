import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook, WebhookDelivery, InboundWebhook } from './entities/webhook.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController, WebhookDeliveriesController, InboundWebhooksController } from './webhooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookDelivery, InboundWebhook])],
  controllers: [WebhooksController, WebhookDeliveriesController, InboundWebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
