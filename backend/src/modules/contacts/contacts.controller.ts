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
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from './dto/contact.dto';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.contactsService.create(tenantId, createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ContactQueryDto,
  ) {
    return this.contactsService.findAll(tenantId, query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search contacts' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  search(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    return this.contactsService.search(tenantId, searchTerm, limit);
  }

  @Get('by-account/:accountId')
  @ApiOperation({ summary: 'Get contacts by account ID' })
  findByAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.contactsService.findByAccount(tenantId, accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(tenantId, id, updateContactDto);
  }

  @Patch(':id/set-primary')
  @ApiOperation({ summary: 'Set contact as primary for its account' })
  setPrimary(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.contactsService.setPrimary(tenantId, accountId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactsService.remove(tenantId, id);
  }
}
