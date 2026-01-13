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
import { EstimatesService } from './estimates.service';
import { CreateEstimateDto, UpdateEstimateDto, EstimateQueryDto, ApproveEstimateDto } from './dto/estimate.dto';

@ApiTags('estimates')
@ApiBearerAuth()
@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new estimate' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createEstimateDto: CreateEstimateDto,
  ) {
    return this.estimatesService.create(tenantId, createEstimateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all estimates with filtering and pagination' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: EstimateQueryDto,
  ) {
    return this.estimatesService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an estimate by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.estimatesService.findOne(tenantId, id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history for an estimate' })
  getVersionHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.estimatesService.getVersionHistory(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an estimate' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEstimateDto: UpdateEstimateDto,
  ) {
    return this.estimatesService.update(tenantId, id, updateEstimateDto);
  }

  @Post(':id/version')
  @ApiOperation({ summary: 'Create a new version of an estimate' })
  createVersion(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.estimatesService.createVersion(tenantId, id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send an estimate to the customer' })
  send(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.estimatesService.send(tenantId, id);
  }

  @Post(':id/viewed')
  @ApiOperation({ summary: 'Mark an estimate as viewed' })
  markViewed(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.estimatesService.markViewed(tenantId, id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an estimate' })
  approve(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveEstimateDto,
  ) {
    return this.estimatesService.approve(tenantId, id, approveDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an estimate' })
  reject(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.estimatesService.reject(tenantId, id, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an estimate' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.estimatesService.remove(tenantId, id);
  }
}
