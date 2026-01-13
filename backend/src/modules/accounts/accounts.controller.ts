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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto, AccountQueryDto } from './dto/account.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer account' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(tenantId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: AccountQueryDto,
  ) {
    return this.accountsService.findAll(tenantId, query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search accounts' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  search(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    return this.accountsService.search(tenantId, searchTerm, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.accountsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(tenantId, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an account' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.accountsService.remove(tenantId, id);
  }
}
