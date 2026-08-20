import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../domain/exceptions/index.js';

export interface CreateTeamMemberDTO {
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  bioEn?: string;
  bioAr?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  photoUrl?: string;
  department?: string;
}

export interface UpdateTeamMemberDTO extends Partial<CreateTeamMemberDTO> {
  isActive?: boolean;
  order?: number;
}

export class TeamService {
  /**
   * Get all team members
   */
  async getTeamMembers(includeInactive = false, department?: string) {
    logger.info('Fetching team members', { includeInactive, department });

    const where: Prisma.TeamMemberWhereInput = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (department) {
      where.department = department;
    }

    return prisma.teamMember.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get team member by ID
   */
  async getTeamMemberById(id: string) {
    const member = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundError('Team member not found');
    }

    return member;
  }

  /**
   * Create new team member
   */
  async createTeamMember(data: CreateTeamMemberDTO) {
    logger.info('Creating new team member', { nameEn: data.nameEn });

    // Get the highest order value
    const maxOrder = await prisma.teamMember.aggregate({
      _max: { order: true },
    });

    const member = await prisma.teamMember.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        bioEn: data.bioEn,
        bioAr: data.bioAr,
        email: data.email,
        linkedin: data.linkedin,
        twitter: data.twitter,
        photoUrl: data.photoUrl,
        department: data.department,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    logger.info('Team member created successfully', { memberId: member.id });
    return member;
  }

  /**
   * Update team member
   */
  async updateTeamMember(id: string, data: UpdateTeamMemberDTO) {
    logger.info('Updating team member', { id });

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Team member not found');
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data,
    });

    return member;
  }

  /**
   * Delete team member
   */
  async deleteTeamMember(id: string) {
    logger.info('Deleting team member', { id });

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Team member not found');
    }

    await prisma.teamMember.delete({ where: { id } });
  }

  /**
   * Reorder team members
   */
  async reorderTeamMembers(orderedIds: string[]) {
    logger.info('Reordering team members', { count: orderedIds.length });

    const updates = orderedIds.map((id, index) =>
      prisma.teamMember.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  /**
   * Get departments
   */
  async getDepartments() {
    const result = await prisma.teamMember.groupBy({
      by: ['department'],
      where: {
        department: { not: null },
        isActive: true,
      },
      _count: { id: true },
    });

    return result
      .filter((r) => r.department)
      .map((r) => ({
        name: r.department!,
        count: r._count.id,
      }));
  }
}

export const teamService = new TeamService();
