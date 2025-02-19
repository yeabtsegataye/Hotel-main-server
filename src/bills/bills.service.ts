import { Injectable } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
  ) {}
  async create(createBillDto: CreateBillDto): Promise<Bill> {
    const newBill = this.billsRepository.create(createBillDto);
    return await this.billsRepository.save(newBill);
  }

  async findAll(): Promise<Bill[]> {
    
    const res= await this.billsRepository.find();
    return res
  }


  findOne(id: number) {
    return `This action returns a #${id} bill`;
  }

  update(id: number, updateBillDto: UpdateBillDto) {
    return `This action updates a #${id} bill`;
  }

  remove(id: number) {
    return `This action removes a #${id} bill`;
  }
}
