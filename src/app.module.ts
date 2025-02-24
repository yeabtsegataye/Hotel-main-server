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
import { BillsModule } from './bills/bills.module';
import { Bill } from './bills/entities/bill.entity';
import { CategoryModule } from './category/category.module';
import { Category } from './category/entities/category.entity';
import { HotelModule } from './hotel/hotel.module';
import { Hotel } from './hotel/entities/hotel.entity';
import { EmployeeModule } from './employee/employee.module';
import { FoodModule } from './food/food.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/entities/comment.entity';
import { Employee } from './employee/entities/employee.entity';
import { Food } from './food/entities/food.entity';
import { Ingredient } from './ingredient/entities/ingredient.entity';
import { Order } from './order/entities/order.entity';
import { Review } from './review/entities/review.entity';
@Module({
  imports: [
    ConfigModule.forRoot(), // for env
    ChapaModule.register({
      secretKey: process.env.CHAPA_SECRET_KEY, //secretKey
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: Number(process.env.DBPORT),
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DB,
      entities: [
        User,
        Packeage,
        Payment,
        Bill,
        Category,
        Hotel,
        Comment,
        Employee,
        Food,
        Ingredient,
        Order,
        Review,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    PackeageModule,
    PaymentsModule,
    BillsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 600,
      },
    ]),
    BillsModule,
    CategoryModule,
    HotelModule,
    EmployeeModule,
    FoodModule,
    IngredientModule,
    OrderModule,
    ReviewModule,
    CommentsModule,
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
