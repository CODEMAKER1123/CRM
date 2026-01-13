import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service, PricingRule, Package, PackageItem, SeasonalPricing, Discount } from './entities/price-book.entity';
import { PriceBookService } from './price-book.service';
import { ServicesController, PricingRulesController, DiscountsController, PackagesController } from './price-book.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service, PricingRule, Package, PackageItem, SeasonalPricing, Discount])],
  controllers: [ServicesController, PricingRulesController, DiscountsController, PackagesController],
  providers: [PriceBookService],
  exports: [PriceBookService],
})
export class PriceBookModule {}
