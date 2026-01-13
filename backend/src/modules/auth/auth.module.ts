import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserSession, AuditLog, ApiKey } from './entities/user.entity';
import { AuthService } from './auth.service';
import { UsersController, ApiKeysController, AuditLogsController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, AuditLog, ApiKey])],
  controllers: [UsersController, ApiKeysController, AuditLogsController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
