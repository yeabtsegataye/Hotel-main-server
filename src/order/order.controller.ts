import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Public } from 'src/auth/public.decorator';
import { CustomRequest } from 'src/auth/custom-request.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('add')
  @Public()
  create(@Body() createOrderDto: CreateOrderDto[]) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(@Req() req: CustomRequest) {
    return this.orderService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.orderService.findOne(req, +id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: CustomRequest,
  ) {
    return this.orderService.update(req, +id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.orderService.remove(req, +id);
  }
}
