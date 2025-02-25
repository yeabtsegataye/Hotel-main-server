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
import { COOKIE_AUTH_ONLY } from './cookie-auth.decorator';
import { Reflector } from '@nestjs/core';
import { LICENSE_AUTH_ONLY } from './license.auth.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    ///////////////////////////////////
    const isCookieAuthOnly = this.reflector.getAllAndOverride<boolean>(
      COOKIE_AUTH_ONLY,
      [context.getHandler(), context.getClass()],
    );
    ///////////////////////////////////
    const islicenseAuthOnly = this.reflector.getAllAndOverride<boolean>(
      LICENSE_AUTH_ONLY,
      [context.getHandler(), context.getClass()],
    );
    ///////////////////////////////////
    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = this.extractAccessToken(request);
    const refreshToken = this.extractRefreshToken(request);

    if (isPublic) {
      return true; // Allow access to public routes
    }

    // Check if the route should be validated by cookies only
    if (isCookieAuthOnly) {
      const refresh_token = request.cookies?.refresh_token;

      if (!refresh_token) {
        throw new UnauthorizedException('No access token found in cookies');
      }
      try {
        const accessPayload = await this.jwtService.verifyAsync(refresh_token, {
          secret: jwtConstants.Refresh_secret,
        });
        request['user'] = accessPayload;
        return true;
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new ForbiddenException('Access token expired');
        } else {
          throw new UnauthorizedException('Invalid access token');
        }
      }
    }
    /////////////////////////////////////
    if (islicenseAuthOnly) {
      if (!accessToken) {
        throw new UnauthorizedException('No access token found');
      }
    
      try {
        // Verify the access token
        const accessPayload = await this.jwtService.verifyAsync(accessToken, {
          secret: jwtConstants.Access_secret,
        });
        request['user'] = accessPayload; // Attach payload to request
    
        // Fetch the user from the database using the payload
        const user = await this.userRepository.findOne({ where: { id: accessPayload.id } });
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
    
        // Check if the user has a valid license key
        if (!user.licenceKey) {
          console.log('no license');
          throw new UnauthorizedException('No license key found for the user');
        }
    
        // Verify the license key and check its expiration
        const decodedLicenceKey = await this.jwtService.verifyAsync(user.licenceKey, {
          secret: jwtConstants.Licence_secret,
        });
    
        // Check if the license key is expired
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decodedLicenceKey.exp && decodedLicenceKey.exp < currentTime) {
          console.log('License key expired');
          throw new UnauthorizedException('License key expired');
        }
    
        // License key is valid and not expired
        return true;
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          console.log('License key expired');
          throw new UnauthorizedException('License key expired');
        } else {
          console.log('Invalid license key');
          throw new UnauthorizedException('Invalid license key');
        }
      }
    }

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('No tokens found');
    }

    try {
      const accessPayload = await this.jwtService.verifyAsync(accessToken, {
        secret: jwtConstants.Access_secret,
      });
      request['user'] = accessPayload; // Attach payload to request
    } catch (error) {
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
