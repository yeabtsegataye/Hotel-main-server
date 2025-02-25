import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  categoryType: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  // This will be handled separately using multer
  //image?: Express.Multer.File;
}