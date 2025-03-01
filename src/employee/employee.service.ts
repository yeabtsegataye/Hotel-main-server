import {
  ConflictException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { JwtService } from '@nestjs/jwt';
import { CustomRequest } from 'src/auth/custom-request.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
    @Req() req: CustomRequest,
  ): Promise<Employee> {
    try {
      const hotel_id = await this.validateTokenAndGetHotelId(req);
      const existingEmployee = await this.employeeRepository.findOne({
        where: { email: createEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'Email must be unique. This user already exists.',
        );
      }
      // Find the hotel entity by ID
      const hotel = await this.hotelRepository.findOne({
        where: { id: hotel_id },
        relations:['user']
      });
      if (!hotel || hotel.user.role !=='admin' ) {
        throw new NotFoundException('Hotel not found');
      }
      const hash = await bcrypt.hash(createEmployeeDto.password, 10);
      // Create new employee and assign the hotel relation
      const newEmployee = this.employeeRepository.create({
        ...createEmployeeDto,
        hotel, // ✅ Assign the whole Hotel entity instead of HT_id
        password: hash,
      });

      return await this.employeeRepository.save(newEmployee);
    } catch (error) {
      console.error('Error while saving employee: ', error);
      throw new Error('Error while creating employee');
    }
  }

  async validateTokenAndGetHotelId(req: CustomRequest): Promise<number> {
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

  async findAll(@Req() req: CustomRequest): Promise<Employee[]> {
    try {
      const hotel_id = await this.validateTokenAndGetHotelId(req);

      return await this.employeeRepository.find({
        where: { hotel: { id: hotel_id } }, // ✅ Fix: Use relation-based filtering
        relations: ['hotel'], // ✅ Ensure the hotel relation is loaded if needed
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  async findOne(id: number, @Req() req: CustomRequest): Promise<Employee> {
    try {
      const hotel_id = await this.validateTokenAndGetHotelId(req);

      const employee = await this.employeeRepository.findOne({
        where: { id, hotel: { id: hotel_id } }, // ✅ Fix: Use relation-based filtering
        relations: ['hotel'], // ✅ Ensure the hotel relation is loaded
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      return employee;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: CustomRequest,
  ): Promise<Employee> {
    try {
      const hotel_id = await this.validateTokenAndGetHotelId(req);

      const employee = await this.employeeRepository.findOne({
        where: { id, hotel: { id: hotel_id } }, // ✅ Fix: Use relation-based filtering
        relations: ['hotel'],
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      await this.employeeRepository.update(id, updateEmployeeDto);
      return this.employeeRepository.findOne({
        where: { id },
        relations: ['hotel'],
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  async remove(id: number, @Req() req: CustomRequest): Promise<void> {
    try {
      const hotel_id = await this.validateTokenAndGetHotelId(req);

      const employee = await this.employeeRepository.findOne({
        where: { id, hotel: { id: hotel_id } }, // ✅ Fix: Use relation-based filtering
        relations: ['hotel'],
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      await this.employeeRepository.delete(id);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new UnauthorizedException('Unauthorized access');
    }
  }
}
