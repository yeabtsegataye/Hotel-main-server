import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { LicenseCheck } from 'src/auth/license.auth.decorator';
import { CustomRequest } from 'src/auth/custom-request.interface';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @LicenseCheck()
  @Post('add')
  create(@Body() createBillDto: CreateBillDto) { 
    return this.billsService.create(createBillDto);
  }
 
  @LicenseCheck()
  @Get()
  findAll(@Req() req: CustomRequest) {
    return this.billsService.findAll(req);
  }
  @LicenseCheck()
  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: CustomRequest) {
    return this.billsService.findOne(+id, req);
  }
  @LicenseCheck()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto,@Req() req: CustomRequest) {
    return this.billsService.update(+id, updateBillDto, req);
  }
  @LicenseCheck()
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.billsService.remove(+id, req);
  }
}
