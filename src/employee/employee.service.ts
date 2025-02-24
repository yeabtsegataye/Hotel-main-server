import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
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

  async findAll(): Promise<Employee[]> {
    const response = await this.employeeRepository.find();
    return response;
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
