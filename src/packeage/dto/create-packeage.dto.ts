import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsArray,
    ArrayMinSize,
    IsOptional,
    IsPositive,
  } from 'class-validator';
  
  export class CreatePackeageDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;
  
    // @IsString()
    // @IsNotEmpty({ message: 'user is required' })
    // user_id: string;

    @IsNumber()
    @IsPositive({ message: 'Subscription date must be a positive number' })
    sub_date: number;
  
    @IsString()
    @IsNotEmpty({ message: 'Price is required' })
    price: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description: string;
  
    @IsArray({ message: 'Features must be an array of strings' })
    @ArrayMinSize(1, { message: 'At least one feature is required' })
    @IsString({ each: true, message: 'Each feature must be a string' })
    features: string[];
  
    @IsString()
    @IsOptional()
    buttonClass?: string;
  
    @IsNumber()
    @IsOptional()
    delay?: number;
  }
  