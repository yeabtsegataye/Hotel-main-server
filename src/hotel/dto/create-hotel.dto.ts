export class CreateHotelDto {
  hotel_name: string; // Required field
  hotel_description: string; // Required field
  hotel_img?: string; // Optional (nullable) field
  userId: any
}
