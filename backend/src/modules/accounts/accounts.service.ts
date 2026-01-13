import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto, AccountQueryDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(tenantId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create({
      ...createAccountDto,
      tenantId,
    });
    return this.accountRepository.save(account);
  }

  async findAll(tenantId: string, query: AccountQueryDto): Promise<{ data: Account[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      accountType,
      leadSource,
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: FindOptionsWhere<Account> = { tenantId, isActive };

    if (accountType) {
      where.accountType = accountType;
    }

    if (leadSource) {
      where.leadSource = leadSource;
    }

    const queryBuilder = this.accountRepository.createQueryBuilder('account');
    queryBuilder.where('account.tenant_id = :tenantId', { tenantId });
    queryBuilder.andWhere('account.is_active = :isActive', { isActive });

    if (search) {
      queryBuilder.andWhere(
        '(account.name ILIKE :search OR account.primary_email ILIKE :search OR account.primary_phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (accountType) {
      queryBuilder.andWhere('account.account_type = :accountType', { accountType });
    }

    if (leadSource) {
      queryBuilder.andWhere('account.lead_source = :leadSource', { leadSource });
    }

    queryBuilder.orderBy(`account.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, tenantId },
      relations: ['contacts', 'addresses'],
    });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async findByEmail(tenantId: string, email: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { tenantId, primaryEmail: email },
    });
  }

  async update(tenantId: string, id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(tenantId, id);
    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const account = await this.findOne(tenantId, id);
    account.isActive = false;
    await this.accountRepository.save(account);
  }

  async updateLifetimeValue(tenantId: string, id: string, amount: number): Promise<void> {
    await this.accountRepository.increment(
      { id, tenantId },
      'lifetimeValue',
      amount,
    );
  }

  async updateOutstandingBalance(tenantId: string, id: string, balance: number): Promise<void> {
    await this.accountRepository.update(
      { id, tenantId },
      { outstandingBalance: balance },
    );
  }

  async search(tenantId: string, searchTerm: string, limit = 10): Promise<Account[]> {
    return this.accountRepository.find({
      where: [
        { tenantId, name: ILike(`%${searchTerm}%`), isActive: true },
        { tenantId, primaryEmail: ILike(`%${searchTerm}%`), isActive: true },
        { tenantId, primaryPhone: ILike(`%${searchTerm}%`), isActive: true },
      ],
      take: limit,
      order: { name: 'ASC' },
    });
  }
}
