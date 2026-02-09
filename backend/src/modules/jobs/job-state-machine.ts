import { Injectable } from '@nestjs/common';
import { JobStatus } from '@/common/enums';

export interface JobContext {
  jobId: string;
  tenantId: string;
  status: JobStatus;
  scheduledDate?: Date;
  estimateId?: string;
  invoiceId?: string;
  crewId?: string;
  isCallback?: boolean;
}

export type JobEvent =
  | { type: 'SCHEDULE'; scheduledDate: Date; crewId?: string }
  | { type: 'DISPATCH' }
  | { type: 'ARRIVE' }
  | { type: 'START_WORK' }
  | { type: 'COMPLETE_WORK' }
  | { type: 'MARK_CALLBACK'; reason: string }
  | { type: 'CANCEL'; reason: string };

// Spec state machine: UNSCHEDULED → SCHEDULED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETE | CALLBACK | CANCELLED
const TRANSITIONS: Record<string, Record<string, JobStatus>> = {
  [JobStatus.UNSCHEDULED]: {
    SCHEDULE: JobStatus.SCHEDULED,
    CANCEL: JobStatus.CANCELLED,
  },
  [JobStatus.SCHEDULED]: {
    DISPATCH: JobStatus.EN_ROUTE,
    START_WORK: JobStatus.IN_PROGRESS,
    CANCEL: JobStatus.CANCELLED,
  },
  [JobStatus.EN_ROUTE]: {
    ARRIVE: JobStatus.ON_SITE,
    CANCEL: JobStatus.CANCELLED,
  },
  [JobStatus.ON_SITE]: {
    START_WORK: JobStatus.IN_PROGRESS,
    CANCEL: JobStatus.CANCELLED,
  },
  [JobStatus.IN_PROGRESS]: {
    COMPLETE_WORK: JobStatus.COMPLETE,
    MARK_CALLBACK: JobStatus.CALLBACK,
    CANCEL: JobStatus.CANCELLED,
  },
  [JobStatus.COMPLETE]: {},
  [JobStatus.CALLBACK]: {
    SCHEDULE: JobStatus.SCHEDULED,
  },
  [JobStatus.CANCELLED]: {},
};

@Injectable()
export class JobStateMachine {
  canTransition(context: JobContext, event: JobEvent): boolean {
    const allowed = TRANSITIONS[context.status];
    if (!allowed) return false;
    return event.type in allowed;
  }

  getNextState(context: JobContext, event: JobEvent): JobStatus | null {
    const allowed = TRANSITIONS[context.status];
    if (!allowed) return null;
    return allowed[event.type] ?? null;
  }

  getAvailableTransitions(context: JobContext): string[] {
    const allowed = TRANSITIONS[context.status];
    if (!allowed) return [];
    return Object.keys(allowed);
  }

  getStatusTransitionMap(): Record<JobStatus, JobStatus[]> {
    const map: Record<string, JobStatus[]> = {};
    for (const [status, transitions] of Object.entries(TRANSITIONS)) {
      map[status] = Object.values(transitions);
    }
    return map as Record<JobStatus, JobStatus[]>;
  }
}
