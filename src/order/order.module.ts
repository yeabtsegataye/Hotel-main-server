import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Food } from 'src/food/entities/food.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Hotel,Food,Order])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
