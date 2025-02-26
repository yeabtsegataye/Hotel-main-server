import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category,Hotel])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
