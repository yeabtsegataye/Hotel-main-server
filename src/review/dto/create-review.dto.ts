import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsNotEmpty()
  foodId: number;

  @IsNotEmpty()
  hotel_id: number;
}
