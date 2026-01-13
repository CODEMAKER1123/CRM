import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Service, PricingRule, Package, PackageItem, SeasonalPricing, Discount } from './entities/price-book.entity';
import {
  CreateServiceDto,
  UpdateServiceDto,
  CreatePricingRuleDto,
  UpdatePricingRuleDto,
  CreateDiscountDto,
  UpdateDiscountDto,
  ServiceQueryDto,
} from './dto/price-book.dto';

@Injectable()
export class PriceBookService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(PricingRule)
    private readonly pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(PackageItem)
    private readonly packageItemRepository: Repository<PackageItem>,
    @InjectRepository(SeasonalPricing)
    private readonly seasonalPricingRepository: Repository<SeasonalPricing>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  // Services
  async createService(tenantId: string, createDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create({
      ...createDto,
      tenantId,
    });
    return this.serviceRepository.save(service);
  }

  async findAllServices(tenantId: string, query: ServiceQueryDto): Promise<{ data: Service[]; total: number }> {
    const { page = 1, limit = 20, category, jobType, isActive, search } = query;

    const queryBuilder = this.serviceRepository.createQueryBuilder('service');
    queryBuilder.where('service.tenant_id = :tenantId', { tenantId });

    if (category) {
      queryBuilder.andWhere('service.category = :category', { category });
    }

    if (jobType) {
      queryBuilder.andWhere('service.job_type = :jobType', { jobType });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('service.is_active = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(service.name ILIKE :search OR service.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.leftJoinAndSelect('service.pricingRules', 'pricingRules');
    queryBuilder.orderBy('service.sort_order', 'ASC');
    queryBuilder.addOrderBy('service.name', 'ASC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOneService(tenantId: string, id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id, tenantId },
      relations: ['pricingRules'],
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async updateService(tenantId: string, id: string, updateDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOneService(tenantId, id);
    Object.assign(service, updateDto);
    return this.serviceRepository.save(service);
  }

  async removeService(tenantId: string, id: string): Promise<void> {
    const service = await this.findOneService(tenantId, id);
    service.isActive = false;
    await this.serviceRepository.save(service);
  }

  async getServiceCategories(tenantId: string): Promise<string[]> {
    const result = await this.serviceRepository
      .createQueryBuilder('service')
      .select('DISTINCT service.category', 'category')
      .where('service.tenant_id = :tenantId', { tenantId })
      .andWhere('service.category IS NOT NULL')
      .getRawMany();

    return result.map(r => r.category);
  }

  // Pricing Rules
  async createPricingRule(tenantId: string, createDto: CreatePricingRuleDto): Promise<PricingRule> {
    const rule = this.pricingRuleRepository.create({
      ...createDto,
      tenantId,
    });
    return this.pricingRuleRepository.save(rule);
  }

  async findAllPricingRules(tenantId: string, serviceId?: string): Promise<PricingRule[]> {
    const where: any = { tenantId };
    if (serviceId) {
      where.serviceId = serviceId;
    }
    return this.pricingRuleRepository.find({
      where,
      order: { priority: 'ASC' },
    });
  }

  async findOnePricingRule(tenantId: string, id: string): Promise<PricingRule> {
    const rule = await this.pricingRuleRepository.findOne({
      where: { id, tenantId },
    });
    if (!rule) {
      throw new NotFoundException(`Pricing rule with ID ${id} not found`);
    }
    return rule;
  }

  async updatePricingRule(tenantId: string, id: string, updateDto: UpdatePricingRuleDto): Promise<PricingRule> {
    const rule = await this.findOnePricingRule(tenantId, id);
    Object.assign(rule, updateDto);
    return this.pricingRuleRepository.save(rule);
  }

  async removePricingRule(tenantId: string, id: string): Promise<void> {
    const rule = await this.findOnePricingRule(tenantId, id);
    await this.pricingRuleRepository.remove(rule);
  }

  // Discounts
  async createDiscount(tenantId: string, createDto: CreateDiscountDto): Promise<Discount> {
    const discount = this.discountRepository.create({
      ...createDto,
      tenantId,
    });
    return this.discountRepository.save(discount);
  }

  async findAllDiscounts(tenantId: string, isActive?: boolean): Promise<Discount[]> {
    const where: any = { tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.discountRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOneDiscount(tenantId: string, id: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id, tenantId },
    });
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    return discount;
  }

  async findDiscountByCode(tenantId: string, code: string): Promise<Discount | null> {
    return this.discountRepository.findOne({
      where: { tenantId, code, isActive: true },
    });
  }

  async updateDiscount(tenantId: string, id: string, updateDto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.findOneDiscount(tenantId, id);
    Object.assign(discount, updateDto);
    return this.discountRepository.save(discount);
  }

  async removeDiscount(tenantId: string, id: string): Promise<void> {
    const discount = await this.findOneDiscount(tenantId, id);
    discount.isActive = false;
    await this.discountRepository.save(discount);
  }

  async incrementDiscountUsage(tenantId: string, id: string): Promise<void> {
    await this.discountRepository.increment({ id, tenantId }, 'usageCount', 1);
  }

  // Packages
  async findAllPackages(tenantId: string, isActive?: boolean): Promise<Package[]> {
    const where: any = { tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.packageRepository.find({
      where,
      relations: ['items', 'items.service'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOnePackage(tenantId: string, id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.service'],
    });
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    return pkg;
  }

  // Seasonal Pricing
  async findSeasonalPricing(tenantId: string, date: Date = new Date()): Promise<SeasonalPricing[]> {
    return this.seasonalPricingRepository
      .createQueryBuilder('sp')
      .where('sp.tenant_id = :tenantId', { tenantId })
      .andWhere('sp.is_active = true')
      .andWhere(':date BETWEEN sp.start_date AND sp.end_date', { date })
      .getMany();
  }

  // Calculate price
  async calculatePrice(
    tenantId: string,
    serviceId: string,
    variables: Record<string, unknown>,
  ): Promise<{ basePrice: number; adjustedPrice: number; appliedRules: PricingRule[] }> {
    const service = await this.findOneService(tenantId, serviceId);
    let price = Number(service.basePrice);
    const appliedRules: PricingRule[] = [];

    // Apply pricing rules
    const rules = await this.findAllPricingRules(tenantId, serviceId);
    for (const rule of rules) {
      if (!rule.isActive) continue;

      const matches = this.evaluateConditions(rule.conditions, variables);
      if (matches) {
        price = this.applyAction(price, rule.actionType, Number(rule.actionValue));
        appliedRules.push(rule);
      }
    }

    // Apply minimum/maximum
    if (service.minimumCharge && price < service.minimumCharge) {
      price = Number(service.minimumCharge);
    }
    if (service.maximumCharge && price > service.maximumCharge) {
      price = Number(service.maximumCharge);
    }

    return {
      basePrice: Number(service.basePrice),
      adjustedPrice: price,
      appliedRules,
    };
  }

  private evaluateConditions(
    conditions: { field: string; operator: string; value: unknown }[],
    variables: Record<string, unknown>,
  ): boolean {
    return conditions.every(condition => {
      const value = variables[condition.field];
      switch (condition.operator) {
        case 'eq':
          return value === condition.value;
        case 'ne':
          return value !== condition.value;
        case 'gt':
          return Number(value) > Number(condition.value);
        case 'gte':
          return Number(value) >= Number(condition.value);
        case 'lt':
          return Number(value) < Number(condition.value);
        case 'lte':
          return Number(value) <= Number(condition.value);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(value);
        case 'contains':
          return String(value).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  private applyAction(price: number, actionType: string, actionValue: number): number {
    switch (actionType) {
      case 'multiply':
        return price * actionValue;
      case 'add':
        return price + actionValue;
      case 'subtract':
        return price - actionValue;
      case 'set':
        return actionValue;
      case 'discount_percent':
        return price * (1 - actionValue / 100);
      case 'discount_fixed':
        return price - actionValue;
      default:
        return price;
    }
  }
}
