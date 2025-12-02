import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip, headers } = request;

    const companyId = user?.companyId;
    const userId = user?.id;

    return next.handle().pipe(
      tap({
        next: async (data) => {
          // Only log state-changing operations
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
              await this.prisma.auditLog.create({
                data: {
                  companyId,
                  userId,
                  action: `${method} ${url}`,
                  entity: this.extractEntity(url),
                  entityId: data?.id || null,
                  newValues: data || {},
                  ipAddress: ip,
                  userAgent: headers['user-agent'],
                },
              });
            } catch (error) {
              this.logger.error(`Failed to create audit log: ${error.message}`);
            }
          }
        },
      }),
    );
  }

  private extractEntity(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2] || parts[parts.length - 1] || 'unknown';
  }
}
