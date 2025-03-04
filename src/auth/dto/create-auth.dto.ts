import { IsEmail, IsNotEmpty, IsNumber, isNumber, IsString, Matches } from 'class-validator';

export class CreateAuthDto {

  email: string;

  Password: string;

  phone: string;

  // @IsString()
  hotel_name: any;

  // @IsString()
  hotel_description: any;

  userId: any;

  role: any;
  
  otp: any;

  newPassword: any;
}
