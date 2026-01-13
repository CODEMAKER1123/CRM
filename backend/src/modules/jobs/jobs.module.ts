import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, JobLineItem, JobAssignment, JobStatusHistory } from './entities/job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobStateMachine } from './job-state-machine';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobLineItem, JobAssignment, JobStatusHistory]),
  ],
  controllers: [JobsController],
  providers: [JobsService, JobStateMachine],
  exports: [JobsService, JobStateMachine],
})
export class JobsModule {}
