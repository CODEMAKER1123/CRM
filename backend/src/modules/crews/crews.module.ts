import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crew, CrewMember, CrewAssignment, CrewMemberSkill, TimeEntry } from './entities/crew.entity';
import { CrewsService } from './crews.service';
import { CrewsController, CrewMembersController } from './crews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Crew, CrewMember, CrewAssignment, CrewMemberSkill, TimeEntry])],
  controllers: [CrewsController, CrewMembersController],
  providers: [CrewsService],
  exports: [CrewsService],
})
export class CrewsModule {}
