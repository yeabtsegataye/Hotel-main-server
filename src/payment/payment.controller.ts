// src/payments/payments.controller.ts

import { Controller, Post, Body, } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create_chapa')
  async chapaPayment(@Body() createPaymentDto: CreatePaymentDto){
    return this.paymentsService.chapaPayment(createPaymentDto);
  }

  @Post('processing')
  async processing(@Body() createPaymentDto: CreatePaymentDto){
    return this.paymentsService.processing(createPaymentDto);
  }
}
