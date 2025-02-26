import {
  Injectable,
  BadRequestException,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { CustomRequest } from 'src/auth/custom-request.interface';
import { JwtService } from '@nestjs/jwt';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly jwtService: JwtService,

    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  private extractHotelIdFromToken(req: CustomRequest): number {
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

  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    const hotelId = this.extractHotelIdFromToken(req);

    try {
      const hotel = await this.hotelRepository.findOne({
        where: { id: hotelId },
      });

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      if (!file.mimetype.startsWith('image')) {
        throw new BadRequestException('Uploaded file is not an image.');
      }

      const compressedImage = await sharp(file.buffer)
        .resize(800)
        .jpeg({ quality: 80 })
        .toBuffer();

      const imageName = `category_${Date.now()}.jpg`;
      const imagePath = path.join('CDN', 'category_img', imageName);

      if (!fs.existsSync(path.join('CDN', 'category_img'))) {
        fs.mkdirSync(path.join('CDN', 'category_img'), { recursive: true });
      }

      fs.writeFileSync(imagePath, compressedImage);

      const category = this.categoryRepository.create({
        hotel,
        image: imagePath,
        status: createCategoryDto.status,
        name: createCategoryDto.categoryName,
        description: createCategoryDto.description,
      });

      const result = await this.categoryRepository.save(category);
      return result;
    } catch (error) {
      console.log(error, 'error on category');
      return { data: 'error occurred' };
    }
  }

  async findAll(@Req() req: CustomRequest) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);
      const hotel = await this.hotelRepository.findOne({
        where: { id: hotelId },
      });

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      const categories = await this.categoryRepository.find({
        where: { hotel: { id: hotelId } },
      });

      return categories;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to fetch categories');
    }
  }

  async findOne(id: number, @Req() req: CustomRequest) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);

      const category = await this.categoryRepository.findOne({
        where: { id, hotel: { id: hotelId } },
      });

      if (!category) {
        throw new NotFoundException('Category not found for the given hotel');
      }

      return category;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to fetch category');
    }
  }

  async update(
    @Req() req: CustomRequest,
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);

      const category = await this.categoryRepository.findOne({
        where: { id, hotel: { id: hotelId } },
      });

      if (!category) {
        throw new NotFoundException('Category not found for the given hotel');
      }

      if (file) {
        if (!file.mimetype.startsWith('image')) {
          throw new BadRequestException('Uploaded file is not an image.');
        }

        const compressedImage = await sharp(file.buffer)
          .resize(800)
          .jpeg({ quality: 80 })
          .toBuffer();

        const imageName = `category_${Date.now()}.jpg`;
        const imagePath = path.join('CDN', 'category_img', imageName);

        fs.writeFileSync(imagePath, compressedImage);

        if (category.image && fs.existsSync(category.image)) {
          fs.unlinkSync(category.image);
        }

        category.image = imagePath;
      }

      Object.assign(category, updateCategoryDto);

      return await this.categoryRepository.save(category);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: number, @Req() req: CustomRequest) {
    try {
      const hotelId = this.extractHotelIdFromToken(req);

      const category = await this.categoryRepository.findOne({
        where: { id, hotel: { id: hotelId } },
      });

      if (!category) {
        throw new NotFoundException('Category not found for the given hotel');
      }

      if (category.image && fs.existsSync(category.image)) {
        fs.unlinkSync(category.image);
      }

      return await this.categoryRepository.remove(category);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to delete category');
    }
  }
}