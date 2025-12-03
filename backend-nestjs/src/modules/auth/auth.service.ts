import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SessionService } from './services/session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, companyId, firstName, lastName, role, phone } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this company');
    }

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        companyId,
        firstName,
        lastName,
        role,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
    });

    // Create session
    const session = await this.sessionService.createSession(user.id);

    return {
      user,
      sessionToken: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, companyId } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const session = await this.sessionService.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
      sessionToken: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const session = await this.sessionService.refreshSession(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      sessionToken: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  async logout(sessionToken: string): Promise<void> {
    await this.sessionService.deleteSession(sessionToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.deleteAllUserSessions(userId);
  }

  // Cron job to clean up expired sessions every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions() {
    const count = await this.sessionService.cleanupExpiredSessions();
    if (count > 0) {
      console.log(`Cleaned up ${count} expired sessions`);
    }
  }
}
