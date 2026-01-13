import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyCamConnection, CompanyCamProject, CompanyCamPhoto } from './entities/companycam.entity';
import {
  ConnectCompanyCamDto,
  UpdateCompanyCamSettingsDto,
  CreateProjectDto,
  UpdatePhotoDto,
  PhotoQueryDto,
} from './dto/companycam.dto';

@Injectable()
export class CompanyCamService {
  constructor(
    @InjectRepository(CompanyCamConnection)
    private readonly connectionRepository: Repository<CompanyCamConnection>,
    @InjectRepository(CompanyCamProject)
    private readonly projectRepository: Repository<CompanyCamProject>,
    @InjectRepository(CompanyCamPhoto)
    private readonly photoRepository: Repository<CompanyCamPhoto>,
  ) {}

  // Connection management
  async connect(tenantId: string, connectDto: ConnectCompanyCamDto): Promise<CompanyCamConnection> {
    const existing = await this.connectionRepository.findOne({
      where: { tenantId },
    });

    if (existing) {
      throw new BadRequestException('CompanyCam is already connected. Disconnect first.');
    }

    const connection = this.connectionRepository.create({
      tenantId,
      accessToken: connectDto.accessToken,
      refreshToken: connectDto.refreshToken,
    });

    return this.connectionRepository.save(connection);
  }

  async disconnect(tenantId: string): Promise<void> {
    const connection = await this.getConnection(tenantId);
    await this.connectionRepository.remove(connection);
  }

  async getConnection(tenantId: string): Promise<CompanyCamConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { tenantId },
    });
    if (!connection) {
      throw new NotFoundException('CompanyCam is not connected');
    }
    return connection;
  }

  async getConnectionStatus(tenantId: string): Promise<{ connected: boolean; connection?: CompanyCamConnection }> {
    const connection = await this.connectionRepository.findOne({
      where: { tenantId },
    });
    return {
      connected: !!connection?.isActive,
      connection,
    };
  }

  async updateSettings(tenantId: string, settings: UpdateCompanyCamSettingsDto): Promise<CompanyCamConnection> {
    const connection = await this.getConnection(tenantId);
    connection.settings = {
      ...connection.settings,
      ...settings,
    };
    return this.connectionRepository.save(connection);
  }

  // Project management
  async createProject(tenantId: string, createDto: CreateProjectDto): Promise<CompanyCamProject> {
    // In real implementation: call CompanyCam API to create project
    const project = this.projectRepository.create({
      tenantId,
      jobId: createDto.jobId,
      companycamProjectId: `cc_proj_${Date.now()}`, // Would come from API
      name: createDto.name,
      address: createDto.address,
    });

    return this.projectRepository.save(project);
  }

  async findAllProjects(tenantId: string): Promise<CompanyCamProject[]> {
    return this.projectRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findProjectByJob(tenantId: string, jobId: string): Promise<CompanyCamProject | null> {
    return this.projectRepository.findOne({
      where: { tenantId, jobId },
    });
  }

  async findOneProject(tenantId: string, id: string): Promise<CompanyCamProject> {
    const project = await this.projectRepository.findOne({
      where: { id, tenantId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async syncProjectFromCompanyCam(tenantId: string, companycamProjectId: string): Promise<CompanyCamProject> {
    // In real implementation: fetch project details from CompanyCam API
    const existing = await this.projectRepository.findOne({
      where: { tenantId, companycamProjectId },
    });

    if (existing) {
      // Update existing project
      return this.projectRepository.save(existing);
    }

    throw new NotFoundException('Project not found in local database');
  }

  // Photo management
  async findAllPhotos(tenantId: string, query: PhotoQueryDto): Promise<{ data: CompanyCamPhoto[]; total: number }> {
    const { page = 1, limit = 50, jobId, projectId, stage, isFeatured } = query;

    const queryBuilder = this.photoRepository.createQueryBuilder('photo');
    queryBuilder.where('photo.tenant_id = :tenantId', { tenantId });

    if (jobId) {
      queryBuilder.andWhere('photo.job_id = :jobId', { jobId });
    }

    if (projectId) {
      queryBuilder.andWhere('photo.project_id = :projectId', { projectId });
    }

    if (stage) {
      queryBuilder.andWhere('photo.stage = :stage', { stage });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('photo.is_featured = :isFeatured', { isFeatured });
    }

    queryBuilder.orderBy('photo.taken_at', 'DESC');
    queryBuilder.addOrderBy('photo.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findPhotosByJob(tenantId: string, jobId: string): Promise<CompanyCamPhoto[]> {
    return this.photoRepository.find({
      where: { tenantId, jobId },
      order: { takenAt: 'DESC' },
    });
  }

  async findOnePhoto(tenantId: string, id: string): Promise<CompanyCamPhoto> {
    const photo = await this.photoRepository.findOne({
      where: { id, tenantId },
    });
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }
    return photo;
  }

  async updatePhoto(tenantId: string, id: string, updateDto: UpdatePhotoDto): Promise<CompanyCamPhoto> {
    const photo = await this.findOnePhoto(tenantId, id);
    Object.assign(photo, updateDto);
    return this.photoRepository.save(photo);
  }

  async setFeaturedPhoto(tenantId: string, id: string, isFeatured: boolean): Promise<CompanyCamPhoto> {
    const photo = await this.findOnePhoto(tenantId, id);
    photo.isFeatured = isFeatured;
    return this.photoRepository.save(photo);
  }

  async syncPhotosForProject(tenantId: string, projectId: string): Promise<{ synced: number; errors: number }> {
    // In real implementation: fetch photos from CompanyCam API and save locally
    const project = await this.findOneProject(tenantId, projectId);

    // Placeholder
    return {
      synced: 0,
      errors: 0,
    };
  }

  async syncPhotosForJob(tenantId: string, jobId: string): Promise<{ synced: number; errors: number }> {
    const project = await this.findProjectByJob(tenantId, jobId);
    if (!project) {
      throw new NotFoundException('No CompanyCam project found for this job');
    }

    return this.syncPhotosForProject(tenantId, project.id);
  }

  // Webhook handling for incoming CompanyCam events
  async handlePhotoCreated(tenantId: string, payload: any): Promise<CompanyCamPhoto> {
    // Find the project
    const project = await this.projectRepository.findOne({
      where: { tenantId, companycamProjectId: payload.project_id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const photo = this.photoRepository.create({
      tenantId,
      projectId: project.id,
      jobId: project.jobId,
      companycamPhotoId: payload.id,
      originalUrl: payload.urls?.original,
      thumbUrl: payload.urls?.thumb,
      mediumUrl: payload.urls?.medium,
      takenAt: payload.taken_at ? new Date(payload.taken_at) : undefined,
      latitude: payload.coordinates?.lat,
      longitude: payload.coordinates?.lng,
      tags: payload.tags,
      uploadedByName: payload.creator?.name,
      uploadedById: payload.creator?.id,
    });

    const saved = await this.photoRepository.save(photo);

    // Update project photo count
    await this.projectRepository.increment({ id: project.id }, 'photoCount', 1);
    await this.projectRepository.update(project.id, { lastPhotoAt: new Date() });

    return saved;
  }

  async getFeaturedPhotosForJob(tenantId: string, jobId: string): Promise<CompanyCamPhoto[]> {
    return this.photoRepository.find({
      where: { tenantId, jobId, isFeatured: true },
      order: { sortOrder: 'ASC', takenAt: 'DESC' },
    });
  }

  async getPortalPhotosForJob(tenantId: string, jobId: string): Promise<CompanyCamPhoto[]> {
    return this.photoRepository.find({
      where: { tenantId, jobId, showInPortal: true },
      order: { takenAt: 'DESC' },
    });
  }
}
