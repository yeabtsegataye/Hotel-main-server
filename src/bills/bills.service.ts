import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Repository } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    try {
      const hotel = await this.hotelRepository.findOne({ where: { userId : createBillDto.user_id } });
      if (!hotel) {
        throw new NotFoundException(`Bill with ID ${createBillDto.user_id} not found`);
      }
      const hotel_id = hotel.id
      const newBill = this.billsRepository.create({HT_id:hotel_id, ...createBillDto});
      return await this.billsRepository.save(newBill);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create bill', error.message);
    }
  }

  async findAll(): Promise<Bill[]> {
    try {
      return await this.billsRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve bills', error.message);
    }
  }

  async findOne(id: number): Promise<Bill> {
    try {
      const bill = await this.billsRepository.findOne({ where: { id } });
      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }
      return bill;
    } catch (error) {
      throw new InternalServerErrorException(`Error retrieving bill with ID ${id}`, error.message);
    }
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    try {
      const bill = await this.findOne(id);
      const updatedBill = Object.assign(bill, updateBillDto);
      return await this.billsRepository.save(updatedBill);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update bill with ID ${id}`, error.message);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const bill = await this.findOne(id);
      await this.billsRepository.remove(bill);
      return { message: `Bill with ID ${id} has been deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete bill with ID ${id}`, error.message);
    }
  }
}
