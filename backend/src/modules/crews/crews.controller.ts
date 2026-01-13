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
import { CrewsService } from './crews.service';
import {
  CreateCrewDto,
  UpdateCrewDto,
  CreateCrewMemberDto,
  UpdateCrewMemberDto,
  CrewAssignmentDto,
  CreateCrewMemberSkillDto,
  TimeEntryDto,
  CrewQueryDto,
} from './dto/crew.dto';

@ApiTags('crews')
@ApiBearerAuth()
@Controller('crews')
export class CrewsController {
  constructor(private readonly crewsService: CrewsService) {}

  // Crew endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new crew' })
  createCrew(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createCrewDto: CreateCrewDto,
  ) {
    return this.crewsService.createCrew(tenantId, createCrewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all crews' })
  findAllCrews(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: CrewQueryDto,
  ) {
    return this.crewsService.findAllCrews(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a crew by ID' })
  findOneCrew(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crewsService.findOneCrew(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a crew' })
  updateCrew(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCrewDto: UpdateCrewDto,
  ) {
    return this.crewsService.updateCrew(tenantId, id, updateCrewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a crew' })
  removeCrew(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crewsService.removeCrew(tenantId, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Assign a member to a crew' })
  assignMember(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) crewId: string,
    @Body() assignmentDto: CrewAssignmentDto,
  ) {
    return this.crewsService.assignMemberToCrew(tenantId, crewId, assignmentDto);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from a crew' })
  removeMember(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) crewId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.crewsService.removeMemberFromCrew(tenantId, crewId, memberId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get crew members' })
  getCrewMembers(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) crewId: string,
  ) {
    return this.crewsService.getCrewMembers(tenantId, crewId);
  }
}

@ApiTags('crew-members')
@ApiBearerAuth()
@Controller('crew-members')
export class CrewMembersController {
  constructor(private readonly crewsService: CrewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new crew member' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateCrewMemberDto,
  ) {
    return this.crewsService.createCrewMember(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all crew members' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.crewsService.findAllCrewMembers(tenantId, isActive);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search crew members' })
  search(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    return this.crewsService.searchCrewMembers(tenantId, searchTerm, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a crew member by ID' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crewsService.findOneCrewMember(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a crew member' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCrewMemberDto,
  ) {
    return this.crewsService.updateCrewMember(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a crew member' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crewsService.removeCrewMember(tenantId, id);
  }

  @Post(':id/skills')
  @ApiOperation({ summary: 'Add a skill to a crew member' })
  addSkill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) crewMemberId: string,
    @Body() skillDto: CreateCrewMemberSkillDto,
  ) {
    return this.crewsService.addSkill(tenantId, crewMemberId, skillDto);
  }

  @Patch(':id/skills/:skillId')
  @ApiOperation({ summary: 'Update a crew member skill' })
  updateSkill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() skillDto: Partial<CreateCrewMemberSkillDto>,
  ) {
    return this.crewsService.updateSkill(tenantId, skillId, skillDto);
  }

  @Delete(':id/skills/:skillId')
  @ApiOperation({ summary: 'Remove a skill from a crew member' })
  removeSkill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.crewsService.removeSkill(tenantId, skillId);
  }

  @Post(':id/clock-in')
  @ApiOperation({ summary: 'Clock in a crew member' })
  clockIn(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) crewMemberId: string,
    @Body() body: { jobId?: string; latitude?: number; longitude?: number },
  ) {
    return this.crewsService.clockIn(tenantId, crewMemberId, body.jobId, body.latitude, body.longitude);
  }

  @Post(':id/clock-out/:entryId')
  @ApiOperation({ summary: 'Clock out a crew member' })
  clockOut(
    @Headers('x-tenant-id') tenantId: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
    @Body() body: { latitude?: number; longitude?: number },
  ) {
    return this.crewsService.clockOut(tenantId, entryId, body.latitude, body.longitude);
  }

  @Get(':id/time-entries')
  @ApiOperation({ summary: 'Get time entries for a crew member' })
  getTimeEntries(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) crewMemberId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.crewsService.getTimeEntries(tenantId, crewMemberId, startDate, endDate);
  }
}
