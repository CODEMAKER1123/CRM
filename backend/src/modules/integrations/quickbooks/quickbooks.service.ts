import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuickBooksConnection, QuickBooksEntityMapping, QuickBooksSyncLog } from './entities/quickbooks.entity';
import { ConnectQuickBooksDto, UpdateQuickBooksSettingsDto, QuickBooksSyncQueryDto } from './dto/quickbooks.dto';
import { SyncStatus } from '@/common/enums';

@Injectable()
export class QuickBooksService {
  constructor(
    @InjectRepository(QuickBooksConnection)
    private readonly connectionRepository: Repository<QuickBooksConnection>,
    @InjectRepository(QuickBooksEntityMapping)
    private readonly mappingRepository: Repository<QuickBooksEntityMapping>,
    @InjectRepository(QuickBooksSyncLog)
    private readonly syncLogRepository: Repository<QuickBooksSyncLog>,
  ) {}

  // Connection management
  async connect(tenantId: string, connectDto: ConnectQuickBooksDto): Promise<QuickBooksConnection> {
    // In a real implementation, you would exchange the authorization code for tokens
    // This is a placeholder that stores the connection info
    const existing = await this.connectionRepository.findOne({
      where: { tenantId },
    });

    if (existing) {
      throw new BadRequestException('QuickBooks is already connected. Disconnect first.');
    }

    const connection = this.connectionRepository.create({
      tenantId,
      realmId: connectDto.realmId,
      accessToken: 'placeholder_access_token', // Would be from OAuth exchange
      refreshToken: 'placeholder_refresh_token', // Would be from OAuth exchange
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    return this.connectionRepository.save(connection);
  }

  async disconnect(tenantId: string): Promise<void> {
    const connection = await this.getConnection(tenantId);
    await this.connectionRepository.remove(connection);
  }

  async getConnection(tenantId: string): Promise<QuickBooksConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { tenantId },
    });
    if (!connection) {
      throw new NotFoundException('QuickBooks is not connected');
    }
    return connection;
  }

  async getConnectionStatus(tenantId: string): Promise<{ connected: boolean; connection?: QuickBooksConnection }> {
    const connection = await this.connectionRepository.findOne({
      where: { tenantId },
    });
    return {
      connected: !!connection?.isActive,
      connection: connection ?? undefined,
    };
  }

  async updateSettings(tenantId: string, settings: UpdateQuickBooksSettingsDto): Promise<QuickBooksConnection> {
    const connection = await this.getConnection(tenantId);
    connection.settings = {
      ...connection.settings,
      ...settings,
    };
    return this.connectionRepository.save(connection);
  }

  async refreshTokens(tenantId: string): Promise<QuickBooksConnection> {
    const connection = await this.getConnection(tenantId);
    // In a real implementation, you would call QuickBooks OAuth to refresh tokens
    connection.tokenExpiresAt = new Date(Date.now() + 3600000);
    return this.connectionRepository.save(connection);
  }

  // Entity mapping
  async createMapping(
    tenantId: string,
    localEntityType: string,
    localEntityId: string,
    qboEntityType: string,
    qboEntityId: string,
    syncToken?: string,
  ): Promise<QuickBooksEntityMapping> {
    const mapping = this.mappingRepository.create({
      tenantId,
      localEntityType,
      localEntityId,
      qboEntityType,
      qboEntityId,
      syncToken,
      syncStatus: SyncStatus.SYNCED,
      lastSyncedAt: new Date(),
    });
    return this.mappingRepository.save(mapping);
  }

  async findMapping(tenantId: string, localEntityType: string, localEntityId: string): Promise<QuickBooksEntityMapping | null> {
    return this.mappingRepository.findOne({
      where: { tenantId, localEntityType, localEntityId },
    });
  }

  async findMappingByQboId(tenantId: string, qboEntityType: string, qboEntityId: string): Promise<QuickBooksEntityMapping | null> {
    return this.mappingRepository.findOne({
      where: { tenantId, qboEntityType, qboEntityId },
    });
  }

  async updateMappingStatus(
    tenantId: string,
    localEntityType: string,
    localEntityId: string,
    status: SyncStatus,
    error?: string,
  ): Promise<QuickBooksEntityMapping | null> {
    const mapping = await this.findMapping(tenantId, localEntityType, localEntityId);
    if (!mapping) return null;

    mapping.syncStatus = status;
    mapping.syncError = error;
    if (status === SyncStatus.SYNCED) {
      mapping.lastSyncedAt = new Date();
      mapping.syncError = undefined;
    }
    return this.mappingRepository.save(mapping);
  }

  async getPendingMappings(tenantId: string, entityType?: string): Promise<QuickBooksEntityMapping[]> {
    const where: any = { tenantId, syncStatus: SyncStatus.PENDING };
    if (entityType) {
      where.localEntityType = entityType;
    }
    return this.mappingRepository.find({ where });
  }

  async getErrorMappings(tenantId: string): Promise<QuickBooksEntityMapping[]> {
    return this.mappingRepository.find({
      where: { tenantId, syncStatus: SyncStatus.ERROR },
    });
  }

  // Sync logs
  async createSyncLog(
    tenantId: string,
    syncType: string,
    entityType: string,
    entityId?: string,
    qboEntityId?: string,
    status: string = 'success',
    errorMessage?: string,
    errorCode?: string,
    requestData?: Record<string, unknown>,
    responseData?: Record<string, unknown>,
    durationMs?: number,
  ): Promise<QuickBooksSyncLog> {
    const log = this.syncLogRepository.create({
      tenantId,
      syncType,
      entityType,
      entityId,
      qboEntityId,
      status,
      errorMessage,
      errorCode,
      requestData,
      responseData,
      durationMs,
    });
    return this.syncLogRepository.save(log);
  }

  async findSyncLogs(tenantId: string, query: QuickBooksSyncQueryDto): Promise<{ data: QuickBooksSyncLog[]; total: number }> {
    const { page = 1, limit = 50, entityType, status, startDate, endDate } = query;

    const queryBuilder = this.syncLogRepository.createQueryBuilder('log');
    queryBuilder.where('log.tenant_id = :tenantId', { tenantId });

    if (entityType) {
      queryBuilder.andWhere('log.entity_type = :entityType', { entityType });
    }

    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder.orderBy('log.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  // Sync operations (placeholders - would integrate with actual QuickBooks API)
  async syncCustomer(tenantId: string, accountId: string): Promise<QuickBooksSyncLog> {
    const startTime = Date.now();
    try {
      // In real implementation: call QuickBooks API to create/update customer
      const log = await this.createSyncLog(
        tenantId,
        'push',
        'account',
        accountId,
        undefined,
        'success',
        undefined,
        undefined,
        { accountId },
        { message: 'Customer synced successfully' },
        Date.now() - startTime,
      );
      return log;
    } catch (error) {
      const log = await this.createSyncLog(
        tenantId,
        'push',
        'account',
        accountId,
        undefined,
        'error',
        error.message,
        error.code,
        { accountId },
        undefined,
        Date.now() - startTime,
      );
      return log;
    }
  }

  async syncInvoice(tenantId: string, invoiceId: string): Promise<QuickBooksSyncLog> {
    const startTime = Date.now();
    try {
      // In real implementation: call QuickBooks API to create/update invoice
      const log = await this.createSyncLog(
        tenantId,
        'push',
        'invoice',
        invoiceId,
        undefined,
        'success',
        undefined,
        undefined,
        { invoiceId },
        { message: 'Invoice synced successfully' },
        Date.now() - startTime,
      );
      return log;
    } catch (error) {
      const log = await this.createSyncLog(
        tenantId,
        'push',
        'invoice',
        invoiceId,
        undefined,
        'error',
        error.message,
        error.code,
        { invoiceId },
        undefined,
        Date.now() - startTime,
      );
      return log;
    }
  }

  async syncPayment(tenantId: string, paymentId: string): Promise<QuickBooksSyncLog> {
    const startTime = Date.now();
    try {
      // In real implementation: call QuickBooks API to create/update payment
      const log = await this.createSyncLog(
        tenantId,
        'push',
        'payment',
        paymentId,
        undefined,
        'success',
        undefined,
        undefined,
        { paymentId },
        { message: 'Payment synced successfully' },
        Date.now() - startTime,
      );
      return log;
    } catch (error) {
      const log = await this.createSyncLog(
        tenantId,
        'push',
        'payment',
        paymentId,
        undefined,
        'error',
        error.message,
        error.code,
        { paymentId },
        undefined,
        Date.now() - startTime,
      );
      return log;
    }
  }

  async runFullSync(tenantId: string): Promise<{ customers: number; invoices: number; payments: number; errors: number }> {
    // Placeholder for full sync logic
    return {
      customers: 0,
      invoices: 0,
      payments: 0,
      errors: 0,
    };
  }
}
