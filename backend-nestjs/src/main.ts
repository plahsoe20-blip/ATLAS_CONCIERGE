import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger';
import { PrismaService } from './common/prisma';

/**
 * Bootstrap ATLAS Concierge Backend Application
 * 
 * Initializes NestJS application with:
 * - Global validation pipes
 * - Security headers (Helmet)
 * - CORS configuration
 * - Compression middleware
 * - Swagger API documentation
 * - Graceful shutdown hooks
 * - Request logging
 * 
 * @async
 * @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  // Create NestJS application with custom logger
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: false, // We'll configure CORS manually below
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  const prismaService = app.get(PrismaService);

  // Set custom logger
  app.useLogger(loggerService);

  // ============================================================================
  // Security Middleware
  // ============================================================================
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    }),
  );

  // CORS Configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [
    'http://localhost:3000',
    'http://localhost:19006',
  ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id', 'X-Request-Id'],
    exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
  });

  // ============================================================================
  // Compression
  // ============================================================================
  app.use(compression());

  // ============================================================================
  // Global Configuration
  // ============================================================================
  
  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Global validation pipe with DTO transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // ============================================================================
  // Swagger API Documentation
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ATLAS Concierge API')
      .setDescription(
        'Multi-tenant ride dispatch platform with real-time tracking, payments, and concierge services',
      )
      .setVersion('1.0')
      .setContact('ATLAS Support', 'https://atlasconcierge.com', 'support@atlasconcierge.com')
      .addTag('auth', 'Authentication endpoints')
      .addTag('companies', 'Company management')
      .addTag('users', 'User management')
      .addTag('drivers', 'Driver operations')
      .addTag('vehicles', 'Vehicle management')
      .addTag('rides', 'Ride booking and management')
      .addTag('payments', 'Payment processing')
      .addTag('realtime', 'WebSocket events')
      .addTag('integrations', 'External integrations')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Company-Id',
          in: 'header',
          description: 'Company identifier for multi-tenant context',
        },
        'company-id',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'ATLAS API Docs',
    });

    loggerService.log('📚 Swagger documentation available at /api');
  }

  // ============================================================================
  // Graceful Shutdown
  // ============================================================================
  await prismaService.enableShutdownHooks(app);

  app.enableShutdownHooks();

  // ============================================================================
  // Start Server
  // ============================================================================
  const port = configService.get<number>('PORT') || 4000;
  const host = '0.0.0.0'; // Listen on all interfaces for Docker

  await app.listen(port, host);

  // ============================================================================
  // Startup Logs
  // ============================================================================
  const environment = configService.get<string>('NODE_ENV') || 'development';
  const appUrl = `http://localhost:${port}/api`;

  loggerService.log(`🚀 ATLAS Concierge Backend v1.0.0`);
  loggerService.log(`🌍 Environment: ${environment}`);
  loggerService.log(`🔗 Server running on: ${appUrl}`);
  loggerService.log(`📚 API Documentation: ${appUrl}`);
  loggerService.log(`❤️  Health Check: http://localhost:${port}/health`);
  
  if (environment === 'development') {
    loggerService.log(`🔧 Prisma Studio: Run 'npm run prisma:studio'`);
  }
}

// Bootstrap application with error handling
bootstrap().catch((error) => {
  console.error('❌ Fatal error during bootstrap:', error);
  process.exit(1);
});
