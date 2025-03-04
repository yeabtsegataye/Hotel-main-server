import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';
import { JwtService } from '@nestjs/jwt';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Category } from 'src/category/entities/category.entity';
import { CustomRequest } from 'src/auth/custom-request.interface';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,

    private readonly jwtService: JwtService,

    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

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

  async create(createFoodDto: CreateFoodDto, file: Express.Multer.File, req: CustomRequest) {
    const hotelId = this.extractHotelIdFromToken(req);

    try {
      const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      const category = await this.categoryRepository.findOne({ where: { id: createFoodDto.category_id } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (!file.mimetype.startsWith('image')) {
        throw new BadRequestException('Uploaded file is not an image.');
      }

      const compressedImage = await sharp(file.buffer)
        .resize(800)
        .jpeg({ quality: 80 })
        .toBuffer();

      const imageName = `food_${Date.now()}.jpg`;
      const imagePath = path.join('CDN', 'food_img', imageName);

      if (!fs.existsSync(path.join('CDN', 'food_img'))) {
        fs.mkdirSync(path.join('CDN', 'food_img'), { recursive: true });
      }

      fs.writeFileSync(imagePath, compressedImage);

      const food = this.foodRepository.create({
        name: createFoodDto.name,
        description: createFoodDto.description,
        price: createFoodDto.price,
        timeOfComplition: createFoodDto.timeOfComplition,
        category,
        image: imagePath,
      });

      const foodResult = await this.foodRepository.save(food)
      return foodResult;
    } catch (error) {
      console.error('Error adding food:', error);
      return { data: "error adding food", error: error.message };
    }
  }

  async findAll(@Req() req: CustomRequest, id?: number) {
    try {
      console.log(id, "cat id");
      
      const hotelId = this.extractHotelIdFromToken(req);
  
      const query = this.foodRepository.createQueryBuilder('food')
        .innerJoinAndSelect('food.category', 'category')
        .innerJoinAndSelect('category.hotel', 'hotel')
        .where('hotel.id = :hotelId', { hotelId });
  
      if (id) {
        query.andWhere('category.id = :id', { id });
      }
  
      const foods = await query.getMany();
      console.log(foods, "food");
      
      if (!foods.length) {
        return [];
      }
  
      return foods;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to fetch foods!');
    }
  }
  

  findOne(id: number) {
    return "This action returns a food";
  }

  update(id: number, updateFoodDto: UpdateFoodDto) {
    return "This action updates a #${id} food";
  }

  remove(id: number) {
    return "This action removes a #${id} food";
  }
} 