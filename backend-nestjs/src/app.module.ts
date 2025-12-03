import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import { validate } from './config/env.validation';

// Common
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';

// Health Controller
import { HealthController } from './health.controller';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { DriverModule } from './modules/driver/driver.module';
import { RideModule } from './modules/ride/ride.module';
import { PaymentModule } from './modules/payment/payment.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

/**
 * AppModule
 * 
 * Root module of the ATLAS Concierge backend application.
 * 
 * Imports:
 * - Configuration with environment variable validation
 * - Rate limiting (Throttler)
 * - Task scheduling
 * - Database (Prisma)
 * - Logging (Winston)
 * - All feature modules
 * 
 * @export
 * @class AppModule
 */
@Module({
  imports: [
    // ========================================================================
    // Configuration
    // ========================================================================
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // ========================================================================
    // Rate Limiting
    // ========================================================================
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    // ========================================================================
    // Scheduling
    // ========================================================================
    ScheduleModule.forRoot(),

    // ========================================================================
    // Common/Shared Modules
    // ========================================================================
    LoggerModule,
    PrismaModule,

    // ========================================================================
    // Feature Modules
    // ========================================================================
    AuthModule,
    CompanyModule,
    UserModule,
    DriverModule,
    RideModule,
    PaymentModule,
    IntegrationsModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }
