import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Hotel,Employee]),
  JwtModule.register({
    global: true,// to make it globaly available
    secret: jwtConstants.Access_secret,
    signOptions: { expiresIn: '1d' },
  }),],
  controllers: [AuthController],
  providers: [AuthService,
    { // remove this to make manual guard
      provide: APP_GUARD, // to make the guard for all routh
      useClass: AuthGuard,
    }
  ],
})
export class AuthModule {}
