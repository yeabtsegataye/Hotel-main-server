import {
  ConflictException,
  Injectable,
  NotFoundException,
  Req,
  Res,
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

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private readonly jwtService: JwtService,

  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if an employee with the same email already exists
    const hotel = await this.hotelRepository.findOne({
      where: { userId: createEmployeeDto.user_id },
    });
    if (!hotel) {
      throw new NotFoundException(
        `${createEmployeeDto.user_id} not found`,
      );
    }
    const hotel_id = hotel.id;

    const existingEmployee = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmployee) {
      // Throw a ConflictException if the email already exists
      throw new ConflictException(
        'Email must be unique. This user already exists.',
      );
    }

    try {
      const newEmployee = this.employeeRepository.create({
        HT_id: hotel_id,
        ...createEmployeeDto,
      });
      console.log(newEmployee, 'new emp'); // Log the new employee object
      return await this.employeeRepository.save(newEmployee); // Save to the database
    } catch (error) {
      console.error('Error while saving employee: ', error); // Log any error
      throw new Error('Error while creating employee'); // Throw error if something goes wrong
    }
  }

  async findAll(@Req() req: CustomRequest): Promise<Employee[]> {
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

      // Fetch employees based on hotel_id
      const employees = await this.employeeRepository.find({
        where: { HT_id: decoded.hotel_id },
      });

      return employees;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  async findOne(id: number, @Req() req: CustomRequest): Promise<Employee> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);

      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const employee = await this.employeeRepository.findOne({ where: { id, HT_id: decoded.hotel_id } });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      return employee;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto,@Req() req: CustomRequest): Promise<Employee> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);

      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const employee = await this.employeeRepository.findOne({ where: { id, HT_id: decoded.hotel_id } });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      await this.employeeRepository.update(id, updateEmployeeDto);
      return this.employeeRepository.findOne({ where: { id } });
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  async remove(id: number, @Req() req: CustomRequest): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);

      if (!decoded || !decoded.hotel_id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const employee = await this.employeeRepository.findOne({ where: { id, HT_id: decoded.hotel_id } });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      await this.employeeRepository.delete(id);
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }
  }
}
