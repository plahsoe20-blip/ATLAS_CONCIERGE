import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../common/prisma';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new session for a user
   * Uses crypto.randomUUID() for secure session token generation
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: any
  ): Promise<{ token: string; refreshToken: string; expiresAt: Date }> {
    // Generate secure random tokens
    const token = randomUUID();
    const refreshToken = randomUUID();

    // Session expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create session in database
    await this.prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        expiresAt,
        ipAddress,
        userAgent,
        deviceInfo: deviceInfo || {},
        isActive: true,
        lastActivityAt: new Date(),
      },
    });

    return { token, refreshToken, expiresAt };
  }

  /**
   * Validate session token and return user data
   */
  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            companyId: true,
            isActive: true,
          },
        },
      },
    });

    // Check if session exists
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date() || !session.isActive) {
      await this.deleteSession(token);
      return null;
    }

    // Update last activity
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

    return session.user;
  }

  /**
   * Refresh session - extend expiration time
   */
  async refreshSession(refreshToken: string): Promise<{ token: string; refreshToken: string; expiresAt: Date } | null> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date() || !session.isActive) {
      return null;
    }

    // Generate new tokens
    const newToken = randomUUID();
    const newRefreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update session
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt,
        lastActivityAt: new Date(),
      },
    });

    return { token: newToken, refreshToken: newRefreshToken, expiresAt };
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { token },
    });
  }

  /**
   * Delete all sessions for a user (logout all devices)
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Cleanup expired sessions (run as cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
    });

    return result.count;
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
      },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        userId, // Ensure user can only revoke their own sessions
      },
      data: {
        isActive: false,
      },
    });

    return result.count > 0;
  }
}
