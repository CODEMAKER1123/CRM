import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as crypto from 'crypto';
import { Webhook, WebhookDelivery, InboundWebhook } from './entities/webhook.entity';
import {
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookQueryDto,
  DeliveryQueryDto,
  TriggerWebhookDto,
} from './dto/webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepository: Repository<WebhookDelivery>,
    @InjectRepository(InboundWebhook)
    private readonly inboundRepository: Repository<InboundWebhook>,
  ) {}

  // Outbound Webhooks
  async create(tenantId: string, createDto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create({
      ...createDto,
      tenantId,
    });
    return this.webhookRepository.save(webhook);
  }

  async findAll(tenantId: string, query: WebhookQueryDto): Promise<{ data: Webhook[]; total: number }> {
    const { page = 1, limit = 20, isActive, event } = query;

    const queryBuilder = this.webhookRepository.createQueryBuilder('webhook');
    queryBuilder.where('webhook.tenant_id = :tenantId', { tenantId });

    if (isActive !== undefined) {
      queryBuilder.andWhere('webhook.is_active = :isActive', { isActive });
    }

    if (event) {
      queryBuilder.andWhere(':event = ANY(webhook.events)', { event });
    }

    queryBuilder.orderBy('webhook.name', 'ASC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({
      where: { id, tenantId },
    });
    if (!webhook) {
      throw new NotFoundException(`Webhook with ID ${id} not found`);
    }
    return webhook;
  }

  async update(tenantId: string, id: string, updateDto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.findOne(tenantId, id);
    Object.assign(webhook, updateDto);
    return this.webhookRepository.save(webhook);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const webhook = await this.findOne(tenantId, id);
    await this.webhookRepository.remove(webhook);
  }

  async activate(tenantId: string, id: string): Promise<Webhook> {
    const webhook = await this.findOne(tenantId, id);
    webhook.isActive = true;
    return this.webhookRepository.save(webhook);
  }

  async deactivate(tenantId: string, id: string): Promise<Webhook> {
    const webhook = await this.findOne(tenantId, id);
    webhook.isActive = false;
    return this.webhookRepository.save(webhook);
  }

  // Webhook Triggering
  async trigger(tenantId: string, triggerDto: TriggerWebhookDto): Promise<WebhookDelivery[]> {
    const webhooks = await this.webhookRepository.find({
      where: { tenantId, isActive: true },
    });

    const matchingWebhooks = webhooks.filter(w => w.events.includes(triggerDto.event));
    const deliveries: WebhookDelivery[] = [];

    for (const webhook of matchingWebhooks) {
      const delivery = await this.createDelivery(
        tenantId,
        webhook,
        triggerDto.event,
        triggerDto.payload,
        triggerDto.entityType,
        triggerDto.entityId,
      );
      deliveries.push(delivery);

      // Attempt delivery (in a real implementation, this would be async/queued)
      await this.attemptDelivery(delivery, webhook);
    }

    return deliveries;
  }

  private async createDelivery(
    tenantId: string,
    webhook: Webhook,
    event: string,
    payload: Record<string, unknown>,
    entityType?: string,
    entityId?: string,
  ): Promise<WebhookDelivery> {
    const delivery = this.deliveryRepository.create({
      tenantId,
      webhookId: webhook.id,
      event,
      entityType,
      entityId,
      payload,
      status: 'pending',
    });
    return this.deliveryRepository.save(delivery);
  }

  private async attemptDelivery(delivery: WebhookDelivery, webhook: Webhook): Promise<void> {
    const startTime = Date.now();
    delivery.attemptCount++;

    try {
      const signature = this.generateSignature(delivery.payload, webhook.secret);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event,
        'X-Webhook-Delivery-Id': delivery.id,
        ...webhook.headers,
      };

      // In a real implementation, you would use HttpService to make the request
      // const response = await this.httpService.post(webhook.url, delivery.payload, { headers }).toPromise();

      // Simulated success for now
      delivery.status = 'success';
      delivery.httpStatus = 200;
      delivery.deliveredAt = new Date();
      delivery.durationMs = Date.now() - startTime;

      // Update webhook stats
      await this.webhookRepository.update(webhook.id, {
        successCount: () => 'success_count + 1',
        lastTriggeredAt: new Date(),
        lastSuccessAt: new Date(),
      });
    } catch (error) {
      delivery.status = delivery.attemptCount >= webhook.maxRetries ? 'failed' : 'retrying';
      delivery.errorMessage = error.message;
      delivery.durationMs = Date.now() - startTime;

      if (delivery.status === 'retrying') {
        delivery.nextRetryAt = new Date(Date.now() + webhook.retryDelaySeconds * 1000);
      }

      // Update webhook stats
      await this.webhookRepository.update(webhook.id, {
        failureCount: () => 'failure_count + 1',
        lastTriggeredAt: new Date(),
        lastFailureAt: new Date(),
        lastError: error.message,
      });
    }

    await this.deliveryRepository.save(delivery);
  }

  private generateSignature(payload: Record<string, unknown>, secret?: string): string {
    if (!secret) return '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  // Deliveries
  async findDeliveries(tenantId: string, query: DeliveryQueryDto): Promise<{ data: WebhookDelivery[]; total: number }> {
    const { page = 1, limit = 50, webhookId, event, status } = query;

    const queryBuilder = this.deliveryRepository.createQueryBuilder('delivery');
    queryBuilder.where('delivery.tenant_id = :tenantId', { tenantId });

    if (webhookId) {
      queryBuilder.andWhere('delivery.webhook_id = :webhookId', { webhookId });
    }

    if (event) {
      queryBuilder.andWhere('delivery.event = :event', { event });
    }

    if (status) {
      queryBuilder.andWhere('delivery.status = :status', { status });
    }

    queryBuilder.leftJoinAndSelect('delivery.webhook', 'webhook');
    queryBuilder.orderBy('delivery.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOneDelivery(tenantId: string, id: string): Promise<WebhookDelivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id, tenantId },
      relations: ['webhook'],
    });
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }
    return delivery;
  }

  async retryDelivery(tenantId: string, id: string): Promise<WebhookDelivery> {
    const delivery = await this.findOneDelivery(tenantId, id);
    const webhook = delivery.webhook;

    delivery.status = 'pending';
    delivery.nextRetryAt = undefined;
    await this.deliveryRepository.save(delivery);

    await this.attemptDelivery(delivery, webhook);
    return this.findOneDelivery(tenantId, id);
  }

  // Inbound Webhooks
  async saveInboundWebhook(
    tenantId: string | undefined,
    source: string,
    event: string | undefined,
    payload: Record<string, unknown>,
    headers?: Record<string, string>,
    signature?: string,
    ipAddress?: string,
  ): Promise<InboundWebhook> {
    const inboundData: Partial<InboundWebhook> = {
      source,
      event,
      payload,
      headers,
      signature,
      ipAddress,
    };
    if (tenantId) {
      inboundData.tenantId = tenantId;
    }
    const inbound = this.inboundRepository.create(inboundData);
    return this.inboundRepository.save(inbound);
  }

  async markInboundProcessed(
    id: string,
    result?: Record<string, unknown>,
    error?: string,
  ): Promise<InboundWebhook> {
    const inbound = await this.inboundRepository.findOne({ where: { id } });
    if (!inbound) {
      throw new NotFoundException(`Inbound webhook with ID ${id} not found`);
    }

    inbound.processed = true;
    inbound.processedAt = new Date();
    inbound.processingResult = result;
    inbound.processingError = error;

    return this.inboundRepository.save(inbound);
  }

  async findInboundWebhooks(tenantId: string | null, source?: string, processed?: boolean, limit = 100): Promise<InboundWebhook[]> {
    const queryBuilder = this.inboundRepository.createQueryBuilder('inbound');

    if (tenantId) {
      queryBuilder.where('inbound.tenant_id = :tenantId', { tenantId });
    }

    if (source) {
      queryBuilder.andWhere('inbound.source = :source', { source });
    }

    if (processed !== undefined) {
      queryBuilder.andWhere('inbound.processed = :processed', { processed });
    }

    queryBuilder.orderBy('inbound.created_at', 'DESC');
    queryBuilder.take(limit);

    return queryBuilder.getMany();
  }

  async getPendingRetries(tenantId: string): Promise<WebhookDelivery[]> {
    return this.deliveryRepository.find({
      where: {
        tenantId,
        status: 'retrying',
      },
      relations: ['webhook'],
      order: { nextRetryAt: 'ASC' },
    });
  }

  // Available events list
  getAvailableEvents(): string[] {
    return [
      'job.created',
      'job.updated',
      'job.completed',
      'job.cancelled',
      'estimate.created',
      'estimate.sent',
      'estimate.approved',
      'estimate.rejected',
      'invoice.created',
      'invoice.sent',
      'invoice.paid',
      'invoice.overdue',
      'payment.received',
      'payment.refunded',
      'customer.created',
      'customer.updated',
      'contact.created',
      'contact.updated',
      'route.started',
      'route.completed',
      'crew.clock_in',
      'crew.clock_out',
    ];
  }
}
