import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as crypto from 'crypto';
import { User, UserSession, AuditLog, ApiKey } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, CreateApiKeyDto, UserQueryDto, AuditLogQueryDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  // Users
  async createUser(tenantId: string, createDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { tenantId, email: createDto.email },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create({
      ...createDto,
      tenantId,
    });
    return this.userRepository.save(user);
  }

  async findAllUsers(tenantId: string, query: UserQueryDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 20, role, isActive, search } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.where('user.tenant_id = :tenantId', { tenantId });

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('user.first_name', 'ASC');
    queryBuilder.addOrderBy('user.last_name', 'ASC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOneUser(tenantId: string, id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByClerkId(clerkUserId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { clerkUserId },
    });
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { tenantId, email },
    });
  }

  async updateUser(tenantId: string, id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneUser(tenantId, id);
    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }

  async deactivateUser(tenantId: string, id: string): Promise<void> {
    const user = await this.findOneUser(tenantId, id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async recordLogin(tenantId: string, userId: string, ipAddress?: string): Promise<User> {
    await this.userRepository.update(
      { id: userId, tenantId },
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        loginCount: () => 'login_count + 1',
      },
    );
    return this.findOneUser(tenantId, userId);
  }

  // API Keys
  async createApiKey(tenantId: string, createDto: CreateApiKeyDto, createdBy?: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = this.generateApiKey();
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = this.hashApiKey(rawKey);

    const apiKey = this.apiKeyRepository.create({
      ...createDto,
      tenantId,
      keyPrefix,
      keyHash,
      createdBy,
    });

    const saved = await this.apiKeyRepository.save(apiKey);
    return { apiKey: saved, rawKey };
  }

  async findAllApiKeys(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneApiKey(tenantId: string, id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, tenantId },
    });
    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }
    return apiKey;
  }

  async validateApiKey(rawKey: string): Promise<ApiKey | null> {
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = this.hashApiKey(rawKey);

    const apiKey = await this.apiKeyRepository.findOne({
      where: { keyPrefix, keyHash, isActive: true },
    });

    if (!apiKey) return null;

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update usage
    await this.apiKeyRepository.update(apiKey.id, {
      lastUsedAt: new Date(),
      usageCount: () => 'usage_count + 1',
    });

    return apiKey;
  }

  async revokeApiKey(tenantId: string, id: string): Promise<void> {
    const apiKey = await this.findOneApiKey(tenantId, id);
    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);
  }

  private generateApiKey(): string {
    return `crm_${crypto.randomBytes(32).toString('hex')}`;
  }

  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  // Audit Logs
  async createAuditLog(
    tenantId: string,
    data: {
      userId?: string;
      userEmail?: string;
      userName?: string;
      action: string;
      entityType: string;
      entityId?: string;
      entityName?: string;
      description?: string;
      oldValues?: Record<string, unknown>;
      newValues?: Record<string, unknown>;
      changedFields?: string[];
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      ...data,
      tenantId,
    });
    return this.auditLogRepository.save(log);
  }

  async findAuditLogs(tenantId: string, query: AuditLogQueryDto): Promise<{ data: AuditLog[]; total: number }> {
    const { page = 1, limit = 50, userId, entityType, entityId, action, startDate, endDate } = query;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');
    queryBuilder.where('log.tenant_id = :tenantId', { tenantId });

    if (userId) {
      queryBuilder.andWhere('log.user_id = :userId', { userId });
    }

    if (entityType) {
      queryBuilder.andWhere('log.entity_type = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('log.entity_id = :entityId', { entityId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
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

  async getEntityHistory(tenantId: string, entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tenantId, entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  // Sessions
  async createSession(
    tenantId: string,
    userId: string,
    deviceInfo?: object,
    ipAddress?: string,
    expiresInHours = 24,
  ): Promise<UserSession> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const session = this.sessionRepository.create({
      tenantId,
      userId,
      sessionToken,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  async validateSession(sessionToken: string): Promise<UserSession | null> {
    const session = await this.sessionRepository.findOne({
      where: { sessionToken, isValid: true },
      relations: ['user'],
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    await this.sessionRepository.update(session.id, {
      lastActivityAt: new Date(),
    });

    return session;
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    await this.sessionRepository.update({ sessionToken }, { isValid: false });
  }

  async invalidateAllUserSessions(tenantId: string, userId: string): Promise<void> {
    await this.sessionRepository.update({ tenantId, userId }, { isValid: false });
  }
}
