import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    try {
      const newHotel = this.hotelRepository.create(createHotelDto);
      return await this.hotelRepository.save(newHotel);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create hotel', error.message);
    }
  }

  async findAll(): Promise<Hotel[]> {
    try {
      return await this.hotelRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve hotels', error.message);
    }
  }

  async findOne(id: number): Promise<Hotel> {
    try {
      const hotel = await this.hotelRepository.findOne({ where: { id } });
      if (!hotel) {
        throw new NotFoundException(`Hotel with ID ${id} not found`);
      }
      return hotel;
    } catch (error) {
      throw new InternalServerErrorException(`Error retrieving hotel with ID ${id}`, error.message);
    }
  }

  async update(id: number, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    try {
      const hotel = await this.findOne(id);
      Object.assign(hotel, updateHotelDto);
      return await this.hotelRepository.save(hotel);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update hotel with ID ${id}`, error.message);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const hotel = await this.findOne(id);
      await this.hotelRepository.remove(hotel);
      return { message: `Hotel with ID ${id} has been deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete hotel with ID ${id}`, error.message);
    }
  }
}
