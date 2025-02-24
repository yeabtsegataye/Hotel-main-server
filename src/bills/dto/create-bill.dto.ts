import { IsNotEmpty, IsNumber, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  BL_name: string;

  @IsNumber({}, { message: 'BL_money must be a valid number' })
  @IsNotEmpty()
  BL_money: number;

  @IsString()
  @IsOptional() // Make it optional instead of allowing an empty string
  BL_description?: string;

  @IsString()
  @IsIn(['Daily', 'Weekly', 'Monthly', 'Yearly'], {
    message: 'BL_SUB_Type must be Daily, Weekly, Monthly, or Yearly',
  })
  BL_SUB_Type: string;

  @IsNumber({}, { message: 'HT_id must be a valid number' }) // Ensure it's a number, not a string
  @IsNotEmpty()
  user_id: any;
}
