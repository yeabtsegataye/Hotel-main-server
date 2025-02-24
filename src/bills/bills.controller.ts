import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { LicenseCheck } from 'src/auth/license.auth.decorator';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('add')
  create(@Body() createBillDto: CreateBillDto) { 
    return this.billsService.create(createBillDto);
  }
 
  @LicenseCheck()
  @Get()
  findAll() {
    return this.billsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billsService.update(+id, updateBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billsService.remove(+id);
  }
}
