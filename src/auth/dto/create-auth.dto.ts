import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
 @IsEmail()
  email: string;

  //   @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
  //     message:
  //       'Password must be at least 8 characters long and contain at least one letter and one number',
  //   })
  @IsNotEmpty()
  @IsString()
  Password: string;

  phone: string;

  // @IsString()
  hotel_name: any;

  // @IsString()
  hotel_description: any;
  
  userId: any
}
