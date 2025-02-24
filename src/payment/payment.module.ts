// src/payments/payments.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Packeage } from 'src/packeage/entities/packeage.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment,Packeage,User])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
