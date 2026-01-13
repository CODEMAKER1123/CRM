import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDate,
  IsEmail,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CrewSpecialty, UserRole } from '@/common/enums';

export class CreateCrewMemberDto {
  @ApiProperty({ description: 'Employee number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  employeeNumber?: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ enum: UserRole, description: 'Role' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'PIN code for mobile app', required: false })
  @IsOptional()
  @IsString()
  @Length(4, 10)
  pinCode?: string;

  @ApiProperty({ description: 'Hire date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hireDate?: Date;

  @ApiProperty({ description: 'Hourly rate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: 'Pay type', required: false })
  @IsOptional()
  @IsString()
  payType?: string;

  @ApiProperty({ description: 'Street address', required: false })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Emergency contact name', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ description: 'Emergency contact phone', required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({ description: 'Has drivers license', required: false })
  @IsOptional()
  @IsBoolean()
  hasDriversLicense?: boolean;

  @ApiProperty({ description: 'Can drive company vehicle', required: false })
  @IsOptional()
  @IsBoolean()
  canDriveCompanyVehicle?: boolean;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateCrewMemberDto extends PartialType(CreateCrewMemberDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Termination date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  terminationDate?: Date;
}

export class CreateCrewDto {
  @ApiProperty({ description: 'Crew name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CrewSpecialty, description: 'Specialty' })
  @IsEnum(CrewSpecialty)
  specialty: CrewSpecialty;

  @ApiProperty({ description: 'Lead crew member ID', required: false })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiProperty({ description: 'Color for calendar display', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string;

  @ApiProperty({ description: 'Vehicle ID', required: false })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiProperty({ description: 'Vehicle name', required: false })
  @IsOptional()
  @IsString()
  vehicleName?: string;

  @ApiProperty({ description: 'Service territory', required: false })
  @IsOptional()
  @IsString()
  serviceTerritory?: string;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateCrewDto extends PartialType(CreateCrewDto) {
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CrewAssignmentDto {
  @ApiProperty({ description: 'Crew member ID' })
  @IsUUID()
  crewMemberId: string;

  @ApiProperty({ description: 'Role in crew', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;
}

export class CreateCrewMemberSkillDto {
  @ApiProperty({ description: 'Skill name' })
  @IsString()
  @Length(1, 100)
  skillName: string;

  @ApiProperty({ description: 'Skill level (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  skillLevel: number;

  @ApiProperty({ description: 'Is certified', required: false })
  @IsOptional()
  @IsBoolean()
  certified?: boolean;

  @ApiProperty({ description: 'Certification number', required: false })
  @IsOptional()
  @IsString()
  certificationNumber?: string;

  @ApiProperty({ description: 'Certification date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  certificationDate?: Date;

  @ApiProperty({ description: 'Certification expiry', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  certificationExpiry?: Date;
}

export class TimeEntryDto {
  @ApiProperty({ description: 'Crew member ID' })
  @IsUUID()
  crewMemberId: string;

  @ApiProperty({ description: 'Job ID', required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ description: 'Date' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ description: 'Clock in time' })
  @Type(() => Date)
  @IsDate()
  clockIn: Date;

  @ApiProperty({ description: 'Clock out time', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  clockOut?: Date;

  @ApiProperty({ description: 'Break minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  breakMinutes?: number;

  @ApiProperty({ description: 'Entry type', required: false })
  @IsOptional()
  @IsString()
  entryType?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CrewQueryDto {
  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ enum: CrewSpecialty, description: 'Filter by specialty', required: false })
  @IsOptional()
  @IsEnum(CrewSpecialty)
  specialty?: CrewSpecialty;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
