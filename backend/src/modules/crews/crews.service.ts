import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Crew, CrewMember, CrewAssignment, CrewMemberSkill, TimeEntry } from './entities/crew.entity';
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

@Injectable()
export class CrewsService {
  constructor(
    @InjectRepository(Crew)
    private readonly crewRepository: Repository<Crew>,
    @InjectRepository(CrewMember)
    private readonly crewMemberRepository: Repository<CrewMember>,
    @InjectRepository(CrewAssignment)
    private readonly assignmentRepository: Repository<CrewAssignment>,
    @InjectRepository(CrewMemberSkill)
    private readonly skillRepository: Repository<CrewMemberSkill>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
  ) {}

  // Crew methods
  async createCrew(tenantId: string, createCrewDto: CreateCrewDto): Promise<Crew> {
    const crew = this.crewRepository.create({
      ...createCrewDto,
      tenantId,
    });
    return this.crewRepository.save(crew);
  }

  async findAllCrews(tenantId: string, query: CrewQueryDto): Promise<{ data: Crew[]; total: number }> {
    const { page = 1, limit = 20, specialty, isActive, search } = query;

    const queryBuilder = this.crewRepository.createQueryBuilder('crew');
    queryBuilder.where('crew.tenant_id = :tenantId', { tenantId });

    if (specialty) {
      queryBuilder.andWhere('crew.specialty = :specialty', { specialty });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('crew.is_active = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere('crew.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder.leftJoinAndSelect('crew.lead', 'lead');
    queryBuilder.leftJoinAndSelect('crew.members', 'members');
    queryBuilder.orderBy('crew.name', 'ASC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOneCrew(tenantId: string, id: string): Promise<Crew> {
    const crew = await this.crewRepository.findOne({
      where: { id, tenantId },
      relations: ['lead', 'members', 'members.crewMember'],
    });
    if (!crew) {
      throw new NotFoundException(`Crew with ID ${id} not found`);
    }
    return crew;
  }

  async updateCrew(tenantId: string, id: string, updateCrewDto: UpdateCrewDto): Promise<Crew> {
    const crew = await this.findOneCrew(tenantId, id);
    Object.assign(crew, updateCrewDto);
    return this.crewRepository.save(crew);
  }

  async removeCrew(tenantId: string, id: string): Promise<void> {
    const crew = await this.findOneCrew(tenantId, id);
    crew.isActive = false;
    await this.crewRepository.save(crew);
  }

  // Crew Member methods
  async createCrewMember(tenantId: string, createDto: CreateCrewMemberDto): Promise<CrewMember> {
    const member = this.crewMemberRepository.create({
      ...createDto,
      tenantId,
    });
    return this.crewMemberRepository.save(member);
  }

  async findAllCrewMembers(tenantId: string, isActive?: boolean): Promise<CrewMember[]> {
    const where: any = { tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.crewMemberRepository.find({
      where,
      relations: ['skills', 'crewAssignments', 'crewAssignments.crew'],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  async findOneCrewMember(tenantId: string, id: string): Promise<CrewMember> {
    const member = await this.crewMemberRepository.findOne({
      where: { id, tenantId },
      relations: ['skills', 'crewAssignments', 'crewAssignments.crew'],
    });
    if (!member) {
      throw new NotFoundException(`Crew member with ID ${id} not found`);
    }
    return member;
  }

  async updateCrewMember(tenantId: string, id: string, updateDto: UpdateCrewMemberDto): Promise<CrewMember> {
    const member = await this.findOneCrewMember(tenantId, id);
    Object.assign(member, updateDto);
    return this.crewMemberRepository.save(member);
  }

  async removeCrewMember(tenantId: string, id: string): Promise<void> {
    const member = await this.findOneCrewMember(tenantId, id);
    member.isActive = false;
    await this.crewMemberRepository.save(member);
  }

  // Crew Assignments
  async assignMemberToCrew(tenantId: string, crewId: string, assignmentDto: CrewAssignmentDto): Promise<CrewAssignment> {
    const assignment = this.assignmentRepository.create({
      tenantId,
      crewId,
      crewMemberId: assignmentDto.crewMemberId,
      role: assignmentDto.role || 'member',
      startDate: assignmentDto.startDate || new Date(),
    });
    return this.assignmentRepository.save(assignment);
  }

  async removeMemberFromCrew(tenantId: string, crewId: string, crewMemberId: string): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { tenantId, crewId, crewMemberId, isActive: true },
    });
    if (assignment) {
      assignment.isActive = false;
      assignment.endDate = new Date();
      await this.assignmentRepository.save(assignment);
    }
  }

  async getCrewMembers(tenantId: string, crewId: string): Promise<CrewMember[]> {
    const assignments = await this.assignmentRepository.find({
      where: { tenantId, crewId, isActive: true },
      relations: ['crewMember'],
    });
    return assignments.map(a => a.crewMember);
  }

  // Skills
  async addSkill(tenantId: string, crewMemberId: string, skillDto: CreateCrewMemberSkillDto): Promise<CrewMemberSkill> {
    const skill = this.skillRepository.create({
      tenantId,
      crewMemberId,
      ...skillDto,
    });
    return this.skillRepository.save(skill);
  }

  async updateSkill(tenantId: string, skillId: string, skillDto: Partial<CreateCrewMemberSkillDto>): Promise<CrewMemberSkill> {
    const skill = await this.skillRepository.findOne({ where: { id: skillId, tenantId } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }
    Object.assign(skill, skillDto);
    return this.skillRepository.save(skill);
  }

  async removeSkill(tenantId: string, skillId: string): Promise<void> {
    const skill = await this.skillRepository.findOne({ where: { id: skillId, tenantId } });
    if (skill) {
      await this.skillRepository.remove(skill);
    }
  }

  // Time Entries
  async createTimeEntry(tenantId: string, timeEntryDto: TimeEntryDto): Promise<TimeEntry> {
    const entry = this.timeEntryRepository.create({
      tenantId,
      ...timeEntryDto,
    });
    return this.timeEntryRepository.save(entry);
  }

  async clockIn(tenantId: string, crewMemberId: string, jobId?: string, latitude?: number, longitude?: number): Promise<TimeEntry> {
    const entry = this.timeEntryRepository.create({
      tenantId,
      crewMemberId,
      jobId,
      date: new Date(),
      clockIn: new Date(),
      clockInLatitude: latitude,
      clockInLongitude: longitude,
    });
    return this.timeEntryRepository.save(entry);
  }

  async clockOut(tenantId: string, entryId: string, latitude?: number, longitude?: number): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({ where: { id: entryId, tenantId } });
    if (!entry) {
      throw new NotFoundException(`Time entry with ID ${entryId} not found`);
    }
    entry.clockOut = new Date();
    entry.clockOutLatitude = latitude;
    entry.clockOutLongitude = longitude;
    entry.totalMinutes = Math.floor((entry.clockOut.getTime() - entry.clockIn.getTime()) / 60000) - entry.breakMinutes;
    return this.timeEntryRepository.save(entry);
  }

  async getTimeEntries(tenantId: string, crewMemberId: string, startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return this.timeEntryRepository
      .createQueryBuilder('entry')
      .where('entry.tenant_id = :tenantId', { tenantId })
      .andWhere('entry.crew_member_id = :crewMemberId', { crewMemberId })
      .andWhere('entry.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('entry.date', 'ASC')
      .addOrderBy('entry.clock_in', 'ASC')
      .getMany();
  }

  async approveTimeEntry(tenantId: string, entryId: string, approvedBy: string): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({ where: { id: entryId, tenantId } });
    if (!entry) {
      throw new NotFoundException(`Time entry with ID ${entryId} not found`);
    }
    entry.isApproved = true;
    entry.approvedBy = approvedBy;
    entry.approvedAt = new Date();
    return this.timeEntryRepository.save(entry);
  }

  async searchCrewMembers(tenantId: string, searchTerm: string, limit = 10): Promise<CrewMember[]> {
    return this.crewMemberRepository.find({
      where: [
        { tenantId, firstName: ILike(`%${searchTerm}%`), isActive: true },
        { tenantId, lastName: ILike(`%${searchTerm}%`), isActive: true },
        { tenantId, email: ILike(`%${searchTerm}%`), isActive: true },
      ],
      take: limit,
      order: { firstName: 'ASC' },
    });
  }
}
