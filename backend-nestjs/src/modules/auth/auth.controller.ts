import { Controller, Post, Body, Get, Delete, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './services/session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) { }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    // Set httpOnly cookie for session
    res.cookie('session_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return result;
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['session_token'] || req.headers['x-session-token'];

    if (token) {
      await this.authService.logout(token as string);
    }

    res.clearCookie('session_token');

    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  async logoutAll(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(user.id);
    res.clearCookie('session_token');

    return { message: 'Logged out from all devices' };
  }

  @Get('sessions')
  async getSessions(@CurrentUser() user: any) {
    return this.sessionService.getUserSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  async revokeSession(
    @CurrentUser() user: any,
    @Body('sessionId') sessionId: string,
  ) {
    const revoked = await this.sessionService.revokeSession(sessionId, user.id);

    if (!revoked) {
      return { message: 'Session not found or already revoked' };
    }

    return { message: 'Session revoked successfully' };
  }
}
