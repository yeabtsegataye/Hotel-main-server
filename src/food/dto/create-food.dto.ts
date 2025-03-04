import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  // @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  // @IsNumber()
  @IsNotEmpty()
  price: number;

  rate: string;

  @IsString()
  timeOfComplition?: string;

  
  // @IsNumber()
  @IsNotEmpty()
  category_id?: number;
}