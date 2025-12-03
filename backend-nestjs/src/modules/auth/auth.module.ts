import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionService } from './services/session.service';
import { SessionGuard } from '../../common/guards/session.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, SessionService],
})
export class AuthModule { }
