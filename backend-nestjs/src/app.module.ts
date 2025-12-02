import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import { validate } from './config/env.validation';

// Common
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { DriverModule } from './modules/driver/driver.module';
import { RideModule } from './modules/ride/ride.module';
import { PaymentModule } from './modules/payment/payment.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '.env',
    }),

    // Throttling (Rate Limiting)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per ttl
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Common
    LoggerModule,
    PrismaModule,

    // Feature Modules
    AuthModule,
    CompanyModule,
    UserModule,
    DriverModule,
    RideModule,
    PaymentModule,
    IntegrationsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
