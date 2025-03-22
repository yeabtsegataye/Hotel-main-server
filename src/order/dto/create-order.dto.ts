import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number; // Changed from string to number

  @IsNumber()
  @IsNotEmpty()
  foodId: number;

  @IsNumber()
  @IsNotEmpty()
  hotelId: number;

  @IsString()
  @IsNotEmpty()
  orderTable: string; // Changed from number to string (if orderTable is a string)
}