import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '@/common/entities/base.entity';
import { Tenant } from '@/modules/tenants/entities/tenant.entity';

@Entity('companycam_connections')
@Index(['tenantId'])
export class CompanyCamConnection extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'token_expires_at', type: 'timestamp', nullable: true })
  tokenExpiresAt?: Date;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId?: string;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'webhook_url', length: 500, nullable: true })
  webhookUrl?: string;

  @Column({ name: 'webhook_secret', length: 255, nullable: true })
  webhookSecret?: string;

  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    autoCreateProjects?: boolean;
    autoSyncPhotos?: boolean;
    defaultTags?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('companycam_projects')
@Index(['tenantId', 'jobId'])
@Index(['tenantId', 'companycamProjectId'])
export class CompanyCamProject extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'companycam_project_id', length: 100 })
  companycamProjectId: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ length: 500, nullable: true })
  address?: string;

  @Column({ name: 'photo_count', type: 'int', default: 0 })
  photoCount: number;

  @Column({ name: 'last_photo_at', type: 'timestamp', nullable: true })
  lastPhotoAt?: Date;

  @Column({ name: 'project_url', length: 500, nullable: true })
  projectUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}

@Entity('companycam_photos')
@Index(['tenantId', 'projectId'])
@Index(['tenantId', 'jobId'])
export class CompanyCamPhoto extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => CompanyCamProject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: CompanyCamProject;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'companycam_photo_id', length: 100 })
  companycamPhotoId: string;

  // Photo URLs from CompanyCam CDN
  @Column({ name: 'original_url', length: 1000 })
  originalUrl: string;

  @Column({ name: 'thumb_url', length: 1000, nullable: true })
  thumbUrl?: string;

  @Column({ name: 'medium_url', length: 1000, nullable: true })
  mediumUrl?: string;

  // Photo metadata
  @Column({ name: 'taken_at', type: 'timestamp', nullable: true })
  takenAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Photo stage
  @Column({ length: 50, nullable: true })
  stage?: string; // 'before', 'during', 'after'

  // Uploaded by
  @Column({ name: 'uploaded_by_name', length: 255, nullable: true })
  uploadedByName?: string;

  @Column({ name: 'uploaded_by_id', length: 100, nullable: true })
  uploadedById?: string;

  // Display settings
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'show_in_portal', type: 'boolean', default: true })
  showInPortal: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
