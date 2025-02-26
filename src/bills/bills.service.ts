import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Bill } from './entities/bill.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CustomRequest } from 'src/auth/custom-request.interface';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    
    private readonly jwtService: JwtService,
  ) {}

  private extractHotelIdFromToken(req: CustomRequest): number {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.jwtService.verify(token);

    if (!decoded || !decoded.hotel_id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return decoded.hotel_id;
  }

  async create(createBillDto: CreateBillDto, @Req() req: CustomRequest): Promise<Bill> {
    try {
      const hotelId = this.extractHotelIdFromToken(req);
      const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      const newBill = this.billsRepository.create({ hotel, ...createBillDto });
      return await this.billsRepository.save(newBill);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create bill', error.message);
    }
  }

  async findAll(@Req() req: CustomRequest): Promise<Bill[]> {
    try {
      const hotelId = this.extractHotelIdFromToken(req);
      return await this.billsRepository.find({ where: { hotel: { id: hotelId } } });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve bills', error.message);
    }
  }

  async findOne(id: number, @Req() req: CustomRequest): Promise<Bill> {
    try {
      const hotelId = this.extractHotelIdFromToken(req);
      return await this.billsRepository.findOneOrFail({ where: { id, hotel: { id: hotelId } } });
    } catch (error) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }
  }

  async update(id: number, updateBillDto: UpdateBillDto, @Req() req: CustomRequest): Promise<Bill> {
    try {
      const bill = await this.findOne(id, req);
      Object.assign(bill, updateBillDto);
      return await this.billsRepository.save(bill);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update bill with ID ${id}`, error.message);
    }
  }

  async remove(id: number, @Req() req: CustomRequest): Promise<{ message: string }> {
    try {
      const bill = await this.findOne(id, req);
      await this.billsRepository.remove(bill);
      return { message: `Bill with ID ${id} has been deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete bill with ID ${id}`, error.message);
    }
  }
}
