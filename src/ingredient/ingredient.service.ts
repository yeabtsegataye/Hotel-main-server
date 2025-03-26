import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Food } from 'src/food/entities/food.entity';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,

    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    console.log(createIngredientDto,'dtt')
    const { name, foodId } = createIngredientDto;
    const food = await this.foodRepository.findOne({ where: { id: foodId } });

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    const ingredient = this.ingredientRepository.create({ name, food });
    return await this.ingredientRepository.save(ingredient);
  }

  async findAll() {
    return await this.ingredientRepository.find({ relations: ['food'] });
  }

  async findOne(id: number) {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      relations: ['food'],
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  }
  // Get ingredients by food ID
  async findByFood(foodId: number): Promise<Ingredient[]> {
    if(!foodId){
      throw new NotFoundException(`food with ID ${foodId} not found`);
    }
    return await this.ingredientRepository.find({
      where: { food: { id: foodId } },
      relations: ['food'],
    });
  }
  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    Object.assign(ingredient, updateIngredientDto);
    return await this.ingredientRepository.save(ingredient);
  }

  async remove(id: number) {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    await this.ingredientRepository.remove(ingredient);
    return { message: `Ingredient with ID ${id} deleted successfully` };
  }
}
