import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackeageDto } from './dto/create-packeage.dto';
import { UpdatePackeageDto } from './dto/update-packeage.dto';
import { Packeage } from './entities/packeage.entity';

@Injectable()
export class PackeageService {
  constructor(
    @InjectRepository(Packeage)
    private readonly packageRepository: Repository<Packeage>,
  ) {}

  // Create a new package
  async create(createPackeageDto: CreatePackeageDto): Promise<Packeage> {
    try {
      const newPackage = this.packageRepository.create(createPackeageDto);
      return await this.packageRepository.save(newPackage);
    } catch (error) {
      console.error('Error creating package:', error);
      throw new InternalServerErrorException('Failed to create package');
    }
  }

  // Get all packages
  async findAll(): Promise<Packeage[]> {
    try {
      return await this.packageRepository.find();
    } catch (error) {
      console.error('Error retrieving packages:', error);
      throw new InternalServerErrorException('Failed to retrieve packages');
    }
  }

  // Get a package by ID
  async findOne(id: number): Promise<Packeage> {
    try {
      const pack = await this.packageRepository.findOne({ where: { id } });
      if (!pack) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
      return pack;
    } catch (error) {
      console.error(`Error retrieving package with ID ${id}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve package');
    }
  }

  // Update a package by ID
  async update(
    id: number,
    updatePackeageDto: UpdatePackeageDto,
  ): Promise<Packeage> {
    try {
      const result = await this.packageRepository.update(id, updatePackeageDto);

      // Check if the package was updated
      if (result.affected === 0) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      const updatedPackage = await this.packageRepository.findOne({
        where: { id },
      });

      return updatedPackage;
    } catch (error) {
      console.error(`Error updating package with ID ${id}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update package');
    }
  }

  // Delete a package by ID
  async remove(id: number): Promise<void> {
    try {
      const result = await this.packageRepository.delete(id);

      // Check if the package was deleted
      if (result.affected === 0) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error deleting package with ID ${id}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete package');
    }
  }
}
