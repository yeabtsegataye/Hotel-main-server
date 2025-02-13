import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes
    }

    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = this.extractAccessToken(request);
    const refreshToken = this.extractRefreshToken(request);

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('No tokens found');
    }

    try {
      const accessPayload = await this.jwtService.verifyAsync(accessToken, {
        secret: jwtConstants.Access_secret,
      });
      request['user'] = accessPayload; // Attach payload to request
    } catch (error) {
      console.log(error.name, 'errrrorr');
      if (error.name === 'TokenExpiredError') {
        
        // If the access token is expired, check the refresh token
        throw new ForbiddenException('Access token expired ');
      } else {
        throw new UnauthorizedException('Invalid access token');
      }
    }
    //////////////////////
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.Refresh_secret,
      });

      // Refresh token is valid, but access token is expired, so return 403
    } catch (refreshError) {
      if (refreshError.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      } else {
        throw new UnauthorizedException('Invalid refresh token');
      }
    }

    return true;
  }

  private extractAccessToken(request: Request): string | undefined {
    // Check Authorization header for access token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    // Check cookies for access token
    return request.cookies?.access_token;
  }

  private extractRefreshToken(request: Request): string | undefined {
    // Check cookies for refresh token
    return request.cookies?.refresh_token;
  }
}
