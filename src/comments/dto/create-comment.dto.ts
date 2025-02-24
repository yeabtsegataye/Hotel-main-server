import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  foodId: number;

  @IsNotEmpty()
  userId: number;
}
