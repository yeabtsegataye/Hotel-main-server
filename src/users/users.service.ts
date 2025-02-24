import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  ///////////////
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
///////////////////
  async Signup(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where:{ email: createUserDto.email}
     });

    if (existingUser) {
      return "User already exists";
    } else {
      // Create new user logic here
      // For example:
      // const newUser = this.userRepository.create(createUserDto);
      // await this.userRepository.save(newUser);
      return 'New user created';
    }
  }

  Login(createUserDto: CreateUserDto) {
    return 'Login functionality will be implemented later';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
