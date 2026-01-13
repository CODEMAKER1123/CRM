import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(tenantId: string, createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      tenantId,
    });
    return this.contactRepository.save(contact);
  }

  async findAll(tenantId: string, query: ContactQueryDto): Promise<{ data: Contact[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      accountId,
      isPrimary,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.contactRepository.createQueryBuilder('contact');
    queryBuilder.where('contact.tenant_id = :tenantId', { tenantId });

    if (accountId) {
      queryBuilder.andWhere('contact.account_id = :accountId', { accountId });
    }

    if (isPrimary !== undefined) {
      queryBuilder.andWhere('contact.is_primary = :isPrimary', { isPrimary });
    }

    if (search) {
      queryBuilder.andWhere(
        '(contact.first_name ILIKE :search OR contact.last_name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`contact.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, tenantId },
      relations: ['account'],
    });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async findByAccount(tenantId: string, accountId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { tenantId, accountId },
      order: { isPrimary: 'DESC', firstName: 'ASC' },
    });
  }

  async findByEmail(tenantId: string, email: string): Promise<Contact | null> {
    return this.contactRepository.findOne({
      where: { tenantId, email },
    });
  }

  async update(tenantId: string, id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(tenantId, id);
    Object.assign(contact, updateContactDto);
    return this.contactRepository.save(contact);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const contact = await this.findOne(tenantId, id);
    await this.contactRepository.remove(contact);
  }

  async setPrimary(tenantId: string, accountId: string, contactId: string): Promise<Contact> {
    // Remove primary flag from other contacts
    await this.contactRepository.update(
      { tenantId, accountId, isPrimary: true },
      { isPrimary: false },
    );
    // Set this contact as primary
    const contact = await this.findOne(tenantId, contactId);
    contact.isPrimary = true;
    return this.contactRepository.save(contact);
  }

  async search(tenantId: string, searchTerm: string, limit = 10): Promise<Contact[]> {
    return this.contactRepository.find({
      where: [
        { tenantId, firstName: ILike(`%${searchTerm}%`) },
        { tenantId, lastName: ILike(`%${searchTerm}%`) },
        { tenantId, email: ILike(`%${searchTerm}%`) },
      ],
      take: limit,
      order: { firstName: 'ASC' },
    });
  }
}
