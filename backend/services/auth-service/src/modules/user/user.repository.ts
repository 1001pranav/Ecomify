/**
 * User Repository - Repository Pattern
 *
 * Implements the Repository pattern to abstract database operations
 * and provide a clean interface for data access.
 */

import { Injectable } from '@nestjs/common';
import { User, UserRole, Role, Prisma } from '@prisma/client';
import { getDatabase } from '@ecomify/database';

@Injectable()
export class UserRepository {
  private db = getDatabase();

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({
      data,
      include: {
        roles: true,
        sessions: false,
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({
      where: { id },
      data,
      include: {
        roles: true,
      },
    });
  }

  /**
   * Delete user (soft delete recommended in production)
   */
  async delete(id: string): Promise<User> {
    return this.db.user.delete({
      where: { id },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.db.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.db.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    return userRoles.map((ur) => ur.role);
  }

  /**
   * Add role to user
   */
  async addRole(userId: string, role: Role): Promise<UserRole> {
    return this.db.userRole.create({
      data: {
        userId,
        role,
      },
    });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, role: Role): Promise<void> {
    await this.db.userRole.deleteMany({
      where: {
        userId,
        role,
      },
    });
  }

  /**
   * Update verification token
   */
  async updateVerificationToken(userId: string, token: string): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data: { verificationToken: token },
    });
  }

  /**
   * Mark user as verified
   */
  async markAsVerified(userId: string): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
  }

  /**
   * Update MFA settings
   */
  async updateMfa(userId: string, enabled: boolean, secret?: string): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: enabled,
        mfaSecret: secret,
      },
    });
  }
}
