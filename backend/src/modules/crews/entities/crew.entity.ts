import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { CrewSpecialty, UserRole } from '@/common/enums';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('crew_members')
@Index(['tenantId', 'isActive'])
@Index(['tenantId', 'email'])
export class CrewMember extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'employee_number', length: 50, nullable: true })
  employeeNumber?: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CREW_MEMBER,
  })
  role: UserRole;

  // Auth
  @Column({ name: 'auth_user_id', length: 255, nullable: true })
  authUserId?: string;

  @Column({ name: 'pin_code', length: 10, nullable: true })
  pinCode?: string; // For mobile app clock-in

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate?: Date;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate?: Date;

  // Compensation (optional)
  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ name: 'pay_type', length: 20, nullable: true })
  payType?: string; // 'hourly', 'salary', 'commission'

  // Address
  @Column({ name: 'street_address', length: 255, nullable: true })
  streetAddress?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 50, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  // Emergency contact
  @Column({ name: 'emergency_contact_name', length: 255, nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', length: 20, nullable: true })
  emergencyContactPhone?: string;

  // Driver info
  @Column({ name: 'has_drivers_license', type: 'boolean', default: false })
  hasDriversLicense: boolean;

  @Column({ name: 'drivers_license_number', length: 50, nullable: true })
  driversLicenseNumber?: string;

  @Column({ name: 'drivers_license_expiry', type: 'date', nullable: true })
  driversLicenseExpiry?: Date;

  @Column({ name: 'can_drive_company_vehicle', type: 'boolean', default: false })
  canDriveCompanyVehicle: boolean;

  // Photo
  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl?: string;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Relations
  @OneToMany(() => CrewMemberSkill, (skill) => skill.crewMember)
  skills: CrewMemberSkill[];

  @OneToMany(() => CrewAssignment, (assignment) => assignment.crewMember)
  crewAssignments: CrewAssignment[];

  // Computed
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}

@Entity('crew_member_skills')
@Index(['crewMemberId'])
export class CrewMemberSkill extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'crew_member_id', type: 'uuid' })
  crewMemberId: string;

  @ManyToOne(() => CrewMember, (member) => member.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crew_member_id' })
  crewMember: CrewMember;

  @Column({ name: 'skill_name', length: 100 })
  skillName: string;

  @Column({ name: 'skill_level', type: 'int', default: 1 })
  skillLevel: number; // 1-5

  @Column({ name: 'certified', type: 'boolean', default: false })
  certified: boolean;

  @Column({ name: 'certification_number', length: 100, nullable: true })
  certificationNumber?: string;

  @Column({ name: 'certification_date', type: 'date', nullable: true })
  certificationDate?: Date;

  @Column({ name: 'certification_expiry', type: 'date', nullable: true })
  certificationExpiry?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('crews')
@Index(['tenantId', 'isActive'])
export class Crew extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CrewSpecialty,
    default: CrewSpecialty.GENERAL,
  })
  specialty: CrewSpecialty;

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId?: string;

  @ManyToOne(() => CrewMember, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead?: CrewMember;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ length: 7, nullable: true })
  color?: string; // For calendar display

  // Vehicle
  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId?: string;

  @Column({ name: 'vehicle_name', length: 100, nullable: true })
  vehicleName?: string;

  // Territory
  @Column({ name: 'service_territory', length: 100, nullable: true })
  serviceTerritory?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  // Relations
  @OneToMany(() => CrewAssignment, (assignment) => assignment.crew)
  members: CrewAssignment[];
}

@Entity('crew_assignments')
@Index(['crewId', 'crewMemberId'])
export class CrewAssignment extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'crew_id', type: 'uuid' })
  crewId: string;

  @ManyToOne(() => Crew, (crew) => crew.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crew_id' })
  crew: Crew;

  @Column({ name: 'crew_member_id', type: 'uuid' })
  crewMemberId: string;

  @ManyToOne(() => CrewMember, (member) => member.crewAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crew_member_id' })
  crewMember: CrewMember;

  @Column({ length: 50, default: 'member' })
  role: string; // 'lead', 'member', 'trainee'

  @Column({ name: 'start_date', type: 'date', default: () => 'CURRENT_DATE' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

@Entity('time_entries')
@Index(['tenantId', 'crewMemberId', 'date'])
@Index(['tenantId', 'jobId'])
export class TimeEntry extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'crew_member_id', type: 'uuid' })
  crewMemberId: string;

  @ManyToOne(() => CrewMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crew_member_id' })
  crewMember: CrewMember;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId?: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'clock_in', type: 'timestamp' })
  clockIn: Date;

  @Column({ name: 'clock_out', type: 'timestamp', nullable: true })
  clockOut?: Date;

  @Column({ name: 'break_minutes', type: 'int', default: 0 })
  breakMinutes: number;

  @Column({ name: 'total_minutes', type: 'int', nullable: true })
  totalMinutes?: number;

  @Column({ name: 'entry_type', length: 50, default: 'work' })
  entryType: string; // 'work', 'travel', 'break', 'training'

  // Location tracking
  @Column({ name: 'clock_in_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  clockInLatitude?: number;

  @Column({ name: 'clock_in_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  clockInLongitude?: number;

  @Column({ name: 'clock_out_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  clockOutLatitude?: number;

  @Column({ name: 'clock_out_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  clockOutLongitude?: number;

  // Approval
  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Payroll
  @Column({ name: 'is_synced_to_payroll', type: 'boolean', default: false })
  isSyncedToPayroll: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
