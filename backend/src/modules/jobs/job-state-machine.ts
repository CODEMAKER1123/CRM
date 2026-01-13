import { Injectable } from '@nestjs/common';
import { createMachine, createActor, assign } from 'xstate';
import { JobStatus } from '@/common/enums';

export interface JobContext {
  jobId: string;
  tenantId: string;
  status: JobStatus;
  scheduledDate?: Date;
  estimateId?: string;
  invoiceId?: string;
  hasContactInfo?: boolean;
  isFullyPaid?: boolean;
}

export type JobEvent =
  | { type: 'QUALIFY' }
  | { type: 'SEND_ESTIMATE' }
  | { type: 'APPROVE_ESTIMATE' }
  | { type: 'REJECT_ESTIMATE' }
  | { type: 'SCHEDULE'; scheduledDate: Date }
  | { type: 'DISPATCH' }
  | { type: 'START_WORK' }
  | { type: 'COMPLETE_WORK' }
  | { type: 'CREATE_INVOICE'; invoiceId: string }
  | { type: 'RECORD_PAYMENT'; amount: number }
  | { type: 'MARK_PAID' }
  | { type: 'CANCEL'; reason: string }
  | { type: 'MARK_LOST'; reason: string };

@Injectable()
export class JobStateMachine {
  private createJobMachine(initialContext: JobContext) {
    return createMachine({
      id: 'job',
      initial: initialContext.status || JobStatus.LEAD,
      context: initialContext,
      states: {
        [JobStatus.LEAD]: {
          on: {
            QUALIFY: {
              target: JobStatus.QUALIFIED,
              guard: ({ context }) => !!context.hasContactInfo,
            },
            MARK_LOST: {
              target: JobStatus.LOST,
              actions: assign({ status: JobStatus.LOST }),
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
              actions: assign({ status: JobStatus.CANCELLED }),
            },
          },
        },
        [JobStatus.QUALIFIED]: {
          on: {
            SEND_ESTIMATE: {
              target: JobStatus.ESTIMATE_SENT,
              actions: assign({ status: JobStatus.ESTIMATE_SENT }),
            },
            SCHEDULE: {
              target: JobStatus.SCHEDULED,
              actions: assign({
                status: JobStatus.SCHEDULED,
                scheduledDate: ({ event }) => event.scheduledDate,
              }),
            },
            MARK_LOST: {
              target: JobStatus.LOST,
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
            },
          },
        },
        [JobStatus.ESTIMATE_SENT]: {
          on: {
            APPROVE_ESTIMATE: {
              target: JobStatus.ESTIMATE_APPROVED,
              actions: assign({ status: JobStatus.ESTIMATE_APPROVED }),
            },
            REJECT_ESTIMATE: {
              target: JobStatus.LOST,
              actions: assign({ status: JobStatus.LOST }),
            },
            MARK_LOST: {
              target: JobStatus.LOST,
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
            },
          },
        },
        [JobStatus.ESTIMATE_APPROVED]: {
          on: {
            SCHEDULE: {
              target: JobStatus.SCHEDULED,
              guard: ({ event }) => !!event.scheduledDate,
              actions: assign({
                status: JobStatus.SCHEDULED,
                scheduledDate: ({ event }) => event.scheduledDate,
              }),
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
            },
          },
        },
        [JobStatus.SCHEDULED]: {
          on: {
            DISPATCH: {
              target: JobStatus.DISPATCHED,
              actions: assign({ status: JobStatus.DISPATCHED }),
            },
            START_WORK: {
              target: JobStatus.IN_PROGRESS,
              actions: assign({ status: JobStatus.IN_PROGRESS }),
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
            },
          },
        },
        [JobStatus.DISPATCHED]: {
          on: {
            START_WORK: {
              target: JobStatus.IN_PROGRESS,
              actions: assign({ status: JobStatus.IN_PROGRESS }),
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
            },
          },
        },
        [JobStatus.IN_PROGRESS]: {
          on: {
            COMPLETE_WORK: {
              target: JobStatus.COMPLETED,
              actions: assign({ status: JobStatus.COMPLETED }),
            },
            CANCEL: {
              target: JobStatus.CANCELLED,
            },
          },
        },
        [JobStatus.COMPLETED]: {
          on: {
            CREATE_INVOICE: {
              target: JobStatus.INVOICED,
              actions: assign({
                status: JobStatus.INVOICED,
                invoiceId: ({ event }) => event.invoiceId,
              }),
            },
          },
        },
        [JobStatus.INVOICED]: {
          on: {
            MARK_PAID: {
              target: JobStatus.PAID,
              guard: ({ context }) => !!context.isFullyPaid,
              actions: assign({ status: JobStatus.PAID }),
            },
          },
        },
        [JobStatus.PAID]: {
          type: 'final',
        },
        [JobStatus.CANCELLED]: {
          type: 'final',
        },
        [JobStatus.LOST]: {
          type: 'final',
        },
      },
    });
  }

  canTransition(context: JobContext, event: JobEvent): boolean {
    const machine = this.createJobMachine(context);
    const actor = createActor(machine);
    actor.start();
    const snapshot = actor.getSnapshot();
    return snapshot.can(event);
  }

  getNextState(context: JobContext, event: JobEvent): JobStatus | null {
    const machine = this.createJobMachine(context);
    const actor = createActor(machine);
    actor.start();

    if (!actor.getSnapshot().can(event)) {
      return null;
    }

    actor.send(event);
    const newSnapshot = actor.getSnapshot();
    return newSnapshot.value as JobStatus;
  }

  getAvailableTransitions(context: JobContext): string[] {
    const machine = this.createJobMachine(context);
    const actor = createActor(machine);
    actor.start();
    const snapshot = actor.getSnapshot();

    const events: JobEvent[] = [
      { type: 'QUALIFY' },
      { type: 'SEND_ESTIMATE' },
      { type: 'APPROVE_ESTIMATE' },
      { type: 'REJECT_ESTIMATE' },
      { type: 'SCHEDULE', scheduledDate: new Date() },
      { type: 'DISPATCH' },
      { type: 'START_WORK' },
      { type: 'COMPLETE_WORK' },
      { type: 'CREATE_INVOICE', invoiceId: 'test' },
      { type: 'MARK_PAID' },
      { type: 'CANCEL', reason: '' },
      { type: 'MARK_LOST', reason: '' },
    ];

    return events
      .filter((event) => snapshot.can(event))
      .map((event) => event.type);
  }

  getStatusTransitionMap(): Record<JobStatus, JobStatus[]> {
    return {
      [JobStatus.LEAD]: [JobStatus.QUALIFIED, JobStatus.LOST, JobStatus.CANCELLED],
      [JobStatus.QUALIFIED]: [JobStatus.ESTIMATE_SENT, JobStatus.SCHEDULED, JobStatus.LOST, JobStatus.CANCELLED],
      [JobStatus.ESTIMATE_SENT]: [JobStatus.ESTIMATE_APPROVED, JobStatus.LOST, JobStatus.CANCELLED],
      [JobStatus.ESTIMATE_APPROVED]: [JobStatus.SCHEDULED, JobStatus.CANCELLED],
      [JobStatus.SCHEDULED]: [JobStatus.DISPATCHED, JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
      [JobStatus.DISPATCHED]: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
      [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED, JobStatus.CANCELLED],
      [JobStatus.COMPLETED]: [JobStatus.INVOICED],
      [JobStatus.INVOICED]: [JobStatus.PAID],
      [JobStatus.PAID]: [],
      [JobStatus.CANCELLED]: [],
      [JobStatus.LOST]: [],
    };
  }
}
