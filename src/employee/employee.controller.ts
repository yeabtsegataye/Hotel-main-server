import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Request } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CustomRequest } from 'src/auth/custom-request.interface';
import { LicenseCheck } from 'src/auth/license.auth.decorator';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @LicenseCheck()
  @Post('add')
  create(@Body() createEmployeeDto: CreateEmployeeDto,@Req() req: CustomRequest) {
    return this.employeeService.create(createEmployeeDto,req);
  }
  @LicenseCheck()
  @Get()
  findAll(@Req() req: CustomRequest) {
    return this.employeeService.findAll(req);
  }
  @LicenseCheck()
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.employeeService.findOne(+id, req);
  }
  @LicenseCheck()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Req() req: CustomRequest) {
    return this.employeeService.update(+id, updateEmployeeDto, req);
  }
  @LicenseCheck()
  @Delete(':id')
  remove(@Param('id') id: string,@Req() req: CustomRequest) {
    return this.employeeService.remove(+id, req);
  }
}
