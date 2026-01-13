import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto, AddressQueryDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(tenantId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create({
      ...createAddressDto,
      tenantId,
    });
    return this.addressRepository.save(address);
  }

  async findAll(tenantId: string, query: AddressQueryDto): Promise<{ data: Address[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      accountId,
      addressType,
      serviceTerritory,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.addressRepository.createQueryBuilder('address');
    queryBuilder.where('address.tenant_id = :tenantId', { tenantId });

    if (accountId) {
      queryBuilder.andWhere('address.account_id = :accountId', { accountId });
    }

    if (addressType) {
      queryBuilder.andWhere('address.address_type = :addressType', { addressType });
    }

    if (serviceTerritory) {
      queryBuilder.andWhere('address.service_territory = :serviceTerritory', { serviceTerritory });
    }

    if (search) {
      queryBuilder.andWhere(
        '(address.street_address_1 ILIKE :search OR address.city ILIKE :search OR address.postal_code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`address.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, tenantId },
      relations: ['account'],
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async findByAccount(tenantId: string, accountId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { tenantId, accountId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async update(tenantId: string, id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(tenantId, id);
    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const address = await this.findOne(tenantId, id);
    await this.addressRepository.remove(address);
  }

  async setPrimary(tenantId: string, accountId: string, addressId: string): Promise<Address> {
    // Remove primary flag from other addresses
    await this.addressRepository.update(
      { tenantId, accountId, isPrimary: true },
      { isPrimary: false },
    );
    // Set this address as primary
    const address = await this.findOne(tenantId, addressId);
    address.isPrimary = true;
    return this.addressRepository.save(address);
  }

  async updateGeolocation(tenantId: string, id: string, latitude: number, longitude: number): Promise<Address> {
    const address = await this.findOne(tenantId, id);
    address.latitude = latitude;
    address.longitude = longitude;
    address.geocoded = true;
    return this.addressRepository.save(address);
  }

  async findByTerritory(tenantId: string, territory: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { tenantId, serviceTerritory: territory },
      relations: ['account'],
    });
  }
}
