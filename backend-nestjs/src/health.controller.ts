import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './common/prisma';

/**
 * HealthController
 * 
 * Provides health check endpoints for monitoring and load balancers.
 * 
 * @export
 * @class HealthController
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic health check endpoint
   * 
   * @returns {object} Health status
   * @memberof HealthController
   */
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-12-02T10:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
      },
    },
  })
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Detailed health check with database connectivity
   * 
   * @returns {object} Detailed health status
   * @memberof HealthController
   */
  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with database status' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
  })
  async getDetailedHealth() {
    let databaseStatus = 'disconnected';
    let databaseLatency = 0;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - start;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        rss: Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
      },
      database: {
        status: databaseStatus,
        latency: `${databaseLatency}ms`,
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
