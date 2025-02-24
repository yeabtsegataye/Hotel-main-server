import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill,Hotel])],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
