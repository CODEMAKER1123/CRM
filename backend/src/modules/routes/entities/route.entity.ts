import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { RouteStopStatus } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';
import { Crew } from '@/modules/crews/entities/crew.entity';
import { Job } from '@/modules/jobs/entities/job.entity';

@Entity('routes')
@Index(['tenantId', 'routeDate'])
@Index(['tenantId', 'crewId', 'routeDate'])
export class Route extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'route_date', type: 'date' })
  routeDate: Date;

  @Column({ name: 'crew_id', type: 'uuid' })
  crewId: string;

  @ManyToOne(() => Crew, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crew_id' })
  crew: Crew;

  @Column({ length: 255, nullable: true })
  name?: string;

  // Start location
  @Column({ name: 'start_address', length: 500, nullable: true })
  startAddress?: string;

  @Column({ name: 'start_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  startLatitude?: number;

  @Column({ name: 'start_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  startLongitude?: number;

  // End location
  @Column({ name: 'end_address', length: 500, nullable: true })
  endAddress?: string;

  @Column({ name: 'end_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  endLatitude?: number;

  @Column({ name: 'end_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  endLongitude?: number;

  // Route metrics
  @Column({ name: 'total_distance_miles', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalDistanceMiles?: number;

  @Column({ name: 'total_duration_minutes', type: 'int', nullable: true })
  totalDurationMinutes?: number;

  @Column({ name: 'total_drive_time_minutes', type: 'int', nullable: true })
  totalDriveTimeMinutes?: number;

  @Column({ name: 'total_work_time_minutes', type: 'int', nullable: true })
  totalWorkTimeMinutes?: number;

  @Column({ name: 'stop_count', type: 'int', default: 0 })
  stopCount: number;

  // Optimization
  @Column({ name: 'optimization_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  optimizationScore?: number;

  @Column({ name: 'optimized_at', type: 'timestamp', nullable: true })
  optimizedAt?: Date;

  @Column({ name: 'optimization_algorithm', length: 50, nullable: true })
  optimizationAlgorithm?: string;

  // Status
  @Column({ length: 50, default: 'planned' })
  status: string; // 'planned', 'in_progress', 'completed', 'cancelled'

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Actual metrics (after completion)
  @Column({ name: 'actual_distance_miles', type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDistanceMiles?: number;

  @Column({ name: 'actual_duration_minutes', type: 'int', nullable: true })
  actualDurationMinutes?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Relations
  @OneToMany(() => RouteStop, (stop) => stop.route)
  stops: RouteStop[];
}

@Entity('route_stops')
@Index(['routeId', 'stopOrder'])
@Index(['jobId'])
export class RouteStop extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'route_id', type: 'uuid' })
  routeId: string;

  @ManyToOne(() => Route, (route) => route.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'stop_order', type: 'int' })
  stopOrder: number;

  @Column({
    type: 'enum',
    enum: RouteStopStatus,
    default: RouteStopStatus.PENDING,
  })
  status: RouteStopStatus;

  // Scheduled times
  @Column({ name: 'scheduled_arrival', type: 'timestamp', nullable: true })
  scheduledArrival?: Date;

  @Column({ name: 'scheduled_departure', type: 'timestamp', nullable: true })
  scheduledDeparture?: Date;

  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes?: number;

  // Time windows
  @Column({ name: 'window_start', type: 'time', nullable: true })
  windowStart?: string;

  @Column({ name: 'window_end', type: 'time', nullable: true })
  windowEnd?: string;

  // Actual times
  @Column({ name: 'actual_arrival', type: 'timestamp', nullable: true })
  actualArrival?: Date;

  @Column({ name: 'actual_departure', type: 'timestamp', nullable: true })
  actualDeparture?: Date;

  @Column({ name: 'actual_duration_minutes', type: 'int', nullable: true })
  actualDurationMinutes?: number;

  // Travel from previous stop
  @Column({ name: 'travel_distance_miles', type: 'decimal', precision: 10, scale: 2, nullable: true })
  travelDistanceMiles?: number;

  @Column({ name: 'travel_duration_minutes', type: 'int', nullable: true })
  travelDurationMinutes?: number;

  // Location
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ length: 500, nullable: true })
  address?: string;

  // Customer notification
  @Column({ name: 'customer_notified', type: 'boolean', default: false })
  customerNotified: boolean;

  @Column({ name: 'customer_notified_at', type: 'timestamp', nullable: true })
  customerNotifiedAt?: Date;

  @Column({ name: 'eta_sent', type: 'boolean', default: false })
  etaSent: boolean;

  @Column({ name: 'eta_sent_at', type: 'timestamp', nullable: true })
  etaSentAt?: Date;

  // Skip reason
  @Column({ name: 'skip_reason', type: 'text', nullable: true })
  skipReason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;
}

@Entity('service_territories')
@Index(['tenantId'])
export class ServiceTerritory extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  // Geographic bounds (simplified, can use PostGIS polygon later)
  @Column({ name: 'zip_codes', type: 'text', array: true, nullable: true })
  zipCodes?: string[];

  @Column({ type: 'jsonb', nullable: true })
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  // GeoJSON polygon for complex boundaries
  @Column({ name: 'boundary_geojson', type: 'jsonb', nullable: true })
  boundaryGeoJson?: object;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Assigned crew (default)
  @Column({ name: 'default_crew_id', type: 'uuid', nullable: true })
  defaultCrewId?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;
}
