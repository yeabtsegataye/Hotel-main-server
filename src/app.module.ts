import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { RequestLoggerMiddleware } from './logging/rate-limiter-logger.middleware';
import { CustomLogger } from './logging/logger.service';
import { ConfigModule } from '@nestjs/config';
import { PackeageModule } from './packeage/packeage.module';
import { Packeage } from './packeage/entities/packeage.entity';
import { PaymentsModule } from './payment/payment.module';
import { Payment } from './payment/entities/payment.entity';
import { ChapaModule } from 'chapa-nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),// for env
    ChapaModule.register({
      secretKey: process.env.CHAPA_SECRET_KEY,//secretKey
    }),
   
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: Number(process.env.DBPORT),
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DB,
      entities: [User, Packeage, Payment],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    PackeageModule,
    PaymentsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 600,
      },
    ]),
    ],
  providers: [
    CustomLogger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
