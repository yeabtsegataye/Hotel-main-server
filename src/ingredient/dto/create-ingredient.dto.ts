import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  foodId: number;
}
