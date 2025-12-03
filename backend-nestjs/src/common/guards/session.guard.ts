import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionService } from '../../modules/auth/services/session.service';

/**
 * Session-based authentication guard
 * Replaces JWT authentication with session tokens stored in database
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Extract session token from cookie or header
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No session token provided');
    }

    // Validate session
    const user = await this.sessionService.validateSession(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user to request
    request.user = user;

    return true;
  }

  private extractToken(request: any): string | null {
    // Try to get token from cookie first (most secure)
    if (request.cookies && request.cookies['session_token']) {
      return request.cookies['session_token'];
    }

    // Fallback to custom header
    if (request.headers['x-session-token']) {
      return request.headers['x-session-token'];
    }

    // Fallback to Authorization header (for API clients)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
