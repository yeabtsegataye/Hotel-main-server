import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, file: Express.Multer.File) {
    console.log(file,'files',createCategoryDto,'dtoo')
    // Validate if the file is an image
    if (!file.mimetype.startsWith('image')) {
      throw new BadRequestException('Uploaded file is not an image.');
    }

    // Compress the image
    const compressedImage = await sharp(file.buffer)
      .resize(800) // Resize to a maximum width of 800px
      .jpeg({ quality: 80 }) // Compress to 80% quality
      .toBuffer();

    // Define the image path
    const imageName = `category_${Date.now()}.jpg`;
    const imagePath = path.join('CDN', 'category_img', imageName);

    // Ensure the directory exists
    if (!fs.existsSync(path.join('CDN', 'category_img'))) {
      fs.mkdirSync(path.join('CDN', 'category_img'), { recursive: true });
    }

    // Save the compressed image to the file system
    fs.writeFileSync(imagePath, compressedImage);
    console.log(imagePath,'lllllll')

    // Save the category data to the database
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      image: imagePath,
    });

    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: number) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, file?: Express.Multer.File) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found.');
    }

    // Handle image update if a new file is provided
    if (file) {
      if (!file.mimetype.startsWith('image')) {
        throw new BadRequestException('Uploaded file is not an image.');
      }

      // Compress the new image
      const compressedImage = await sharp(file.buffer)
        .resize(800)
        .jpeg({ quality: 80 })
        .toBuffer();

      // Define the new image path
      const imageName = `category_${Date.now()}.jpg`;
      const imagePath = path.join('CDN', 'category_img', imageName);

      // Save the new image
      fs.writeFileSync(imagePath, compressedImage);

      // Delete the old image
      if (category.image && fs.existsSync(category.image)) {
        fs.unlinkSync(category.image);
      }

      // Update the image path
      category.image = imagePath;
    }

    // Update other fields
    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found.');
    }

    // Delete the image file
    if (category.image && fs.existsSync(category.image)) {
      fs.unlinkSync(category.image);
    }

    return this.categoryRepository.remove(category);
  }
}