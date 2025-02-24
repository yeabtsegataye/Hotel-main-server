import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee,Hotel])],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
