import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  BL_name: string;

  // @IsNumber()
  @IsNotEmpty()
  BL_money: number;

  @IsString()
  BL_description: string;

  @IsString()
  @IsIn(['Daily', 'Weekly', 'Monthly','yearly'], { message: 'subType must be Daily, Weekly, Monthly or yearly' })
  BL_SUB_Type: string;

  @IsString()
  @IsNotEmpty()
  HT_id: string;
}
