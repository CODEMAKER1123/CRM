import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickBooksConnection, QuickBooksEntityMapping, QuickBooksSyncLog } from './entities/quickbooks.entity';
import { QuickBooksService } from './quickbooks.service';
import { QuickBooksController } from './quickbooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuickBooksConnection, QuickBooksEntityMapping, QuickBooksSyncLog])],
  controllers: [QuickBooksController],
  providers: [QuickBooksService],
  exports: [QuickBooksService],
})
export class QuickBooksModule {}
