import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsNotEmpty()
  hotelId: number;
}
