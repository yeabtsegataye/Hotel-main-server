import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';
import { Public } from './public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('signup')
  @Public()
  async Signup(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    return this.authService.Signup(createAuthDto, res);
  }
  
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @Public()
  async Login(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    return this.authService.login(createAuthDto, res);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('Dash_login')
  @Public()
  async DLogin(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    return this.authService.Dlogin(createAuthDto, res);
  }

  @Throttle({ default: { limit: 1, ttl: 60000} })
  @Post('send_otp')
  @Public()
  async Send_otp(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    return this.authService.Send_otp(createAuthDto, res);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset_password')
  @Public()
  async reset_password(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    return this.authService.reset_password(createAuthDto, res);
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Res() res: Response, @Req() req: CustomRequest) {
    return this.authService.refreshToken(res, req);
  }

  @Post('verify-token')
 // @Public()
  async verifiToken(@Res() res: Response, @Req() req: CustomRequest) {
    return this.authService.verifiToken(res, req);
  }

  @Post('Dash_verify-token')
 // @Public()
  async Dash_verifiToken(@Res() res: Response, @Req() req: CustomRequest) {
    return this.authService.Dash_verifiToken(res, req);
  }
  @Post('log-out')
   @Public()
   async Logout(@Res() res: Response, @Req() req: CustomRequest) {
     return this.authService.Logout(res, req);
   }
}
