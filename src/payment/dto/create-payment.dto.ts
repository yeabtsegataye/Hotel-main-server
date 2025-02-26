import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: bigint; // Change from bigint to number

  @IsNotEmpty()
  @IsNumber()
  packeg_id: number; // Change from 'any' to number

  // @IsNotEmpty()
  // @IsString()
  tx_ref: string; // Ensure tx_ref is a string
}
