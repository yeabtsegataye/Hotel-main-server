import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException, Req } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Repository } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { CustomRequest } from 'src/auth/custom-request.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
        private readonly jwtService: JwtService,
    
  ) {}

  async create(createBillDto: CreateBillDto, @Req() req: CustomRequest): Promise<Bill> {
    //console.log(createBillDto,'cerat')
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }

      // Extract and verify token
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);

      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const newBill = this.billsRepository.create({HT_id : decoded.hotel_id, ...createBillDto});
      return await this.billsRepository.save(newBill);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create bill', error.message);
    }
  }

  async findAll(@Req() req: CustomRequest): Promise<Bill[]> {
    try {
      // Get token from headers
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }
  
      // Extract and verify token
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
  
      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }
  
      // Fetch bills based on hotel_id
      const bills = await this.billsRepository.find({
        where: { HT_id: decoded.hotel_id },
      });
  
      return bills;
    } catch (error) {
      console.error('Error retrieving bills:', error);
      throw new UnauthorizedException('Unauthorized access');
    }
  }
  

  async findOne(id: number, @Req() req: CustomRequest): Promise<Bill> {
    try {
      // Get token from headers
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }
  
      // Extract and verify token
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
  
      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }
  
      // Fetch bill based on hotel_id and ID
      const bill = await this.billsRepository.findOne({ where: { id, HT_id: decoded.hotel_id } });
  
      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }
  
      return bill;
    } catch (error) {
      throw new InternalServerErrorException(`Error retrieving bill with ID ${id}`, error.message);
    }
  }
  
  async update(id: number, updateBillDto: UpdateBillDto, @Req() req: CustomRequest): Promise<Bill> {
    try {
      const bill = await this.findOne(id, req); // Fetch bill with authentication
      const updatedBill = Object.assign(bill, updateBillDto);
      return await this.billsRepository.save(updatedBill);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update bill with ID ${id}`, error.message);
    }
  }
  
  async remove(id: number, @Req() req: CustomRequest): Promise<{ message: string }> {
    try {
      const bill = await this.findOne(id, req); // Fetch bill with authentication
      await this.billsRepository.remove(bill);
      return { message: `Bill with ID ${id} has been deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete bill with ID ${id}`, error.message);
    }
  }
  
}
