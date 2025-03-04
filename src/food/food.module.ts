import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Food } from './entities/food.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category,Hotel, Food])],
  controllers: [FoodController],
  providers: [FoodService],
})
export class FoodModule {}