// src/payments/payments.controller.ts

import { Controller, Post, Body, } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CookieAuthOnly } from 'src/auth/cookie-auth.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create_chapa')
  async chapaPayment(@Body() createPaymentDto: CreatePaymentDto){
    return this.paymentsService.chapaPayment(createPaymentDto);
  }

  // @CookieAuthOnly()
  @Public()
  @Post('processing')
  async processing(@Body() createPaymentDto: CreatePaymentDto){
    return this.paymentsService.processing(createPaymentDto);
  }
}
