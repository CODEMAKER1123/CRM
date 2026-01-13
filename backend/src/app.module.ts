import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EstimatesModule } from './modules/estimates/estimates.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CrewsModule } from './modules/crews/crews.module';
import { RoutesModule } from './modules/routes/routes.module';
import { PriceBookModule } from './modules/price-book/price-book.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { QuickBooksModule } from './modules/integrations/quickbooks/quickbooks.module';
import { CompanyCamModule } from './modules/integrations/companycam/companycam.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { LeadsModule } from './modules/leads/leads.module';

// Configuration
import configuration from './config/configuration';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),

    // Redis/BullMQ for background jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    TenantsModule,
    AccountsModule,
    ContactsModule,
    AddressesModule,
    JobsModule,
    EstimatesModule,
    InvoicesModule,
    PaymentsModule,
    CrewsModule,
    RoutesModule,
    PriceBookModule,
    MarketingModule,
    QuickBooksModule,
    CompanyCamModule,
    WebhooksModule,
    LeadsModule,
  ],
})
export class AppModule {}
