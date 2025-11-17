/**
 * Session Repository - Repository Pattern
 *
 * Manages session data persistence
 */

import { Injectable } from '@nestjs/common';
import { Session, Prisma } from '@prisma/client';
import { getDatabase } from '@ecomify/database';

@Injectable()
export class SessionRepository {
  private db = getDatabase();

  /**
   * Create a new session
   */
  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    return this.db.session.create({
      data,
    });
  }

  /**
   * Find session by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.db.session.findUnique({
      where: { refreshToken },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<Session[]> {
    return this.db.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update session expiry
   */
  async updateExpiry(sessionId: string, expiresAt: Date): Promise<Session> {
    return this.db.session.update({
      where: { id: sessionId },
      data: { expiresAt },
    });
  }

  /**
   * Delete session by ID
   */
  async delete(sessionId: string): Promise<Session> {
    return this.db.session.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Delete session by refresh token
   */
  async deleteByRefreshToken(refreshToken: string): Promise<Session> {
    return this.db.session.delete({
      where: { refreshToken },
    });
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllForUser(userId: string): Promise<number> {
    const result = await this.db.session.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<number> {
    const result = await this.db.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Check if refresh token exists and is valid
   */
  async isValid(refreshToken: string): Promise<boolean> {
    const session = await this.db.session.findUnique({
      where: { refreshToken },
    });

    if (!session) return false;

    return session.expiresAt > new Date();
  }
}
