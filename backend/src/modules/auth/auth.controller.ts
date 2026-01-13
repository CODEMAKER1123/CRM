import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, UpdateUserDto, CreateApiKeyDto, UserQueryDto, AuditLogQueryDto } from './dto/auth.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateUserDto,
  ) {
    return this.authService.createUser(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: UserQueryDto,
  ) {
    return this.authService.findAllUsers(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.authService.findOneUser(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a user' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.authService.deactivateUser(tenantId, id);
  }

  @Post(':id/invalidate-sessions')
  @ApiOperation({ summary: 'Invalidate all user sessions' })
  invalidateSessions(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.authService.invalidateAllUserSessions(tenantId, id);
  }
}

@ApiTags('api-keys')
@ApiBearerAuth()
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateApiKeyDto,
  ) {
    return this.authService.createApiKey(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all API keys' })
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.authService.findAllApiKeys(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an API key by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.authService.findOneApiKey(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.authService.revokeApiKey(tenantId, id);
  }
}

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.authService.findAuditLogs(tenantId, query);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get entity history' })
  getEntityHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.authService.getEntityHistory(tenantId, entityType, entityId);
  }
}
