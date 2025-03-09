import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { CustomRequest } from 'src/auth/custom-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/public.decorator';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) { }

  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createFoodDto: CreateFoodDto, @Req() req: CustomRequest, @UploadedFile() file: Express.Multer.File) {
    return this.foodService.create(createFoodDto, file, req);
  }

  @Get('get/:id')
  findAll(@Req() req: CustomRequest, @Param('id') id: string) {
    console.log(id, "controller id");
    
    return this.foodService.findAll(req, +id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodService.findOne(+id);
  }

  @Get('menue_foods/:id')
  @Public()
  menu_Food(@Param('id') id: string) {
    return this.foodService.menu_Food(+id);
  }

  @Get('menue_foods_details/:id')
  @Public()
  menue_foods_details(@Param('id') id: string) {
    return this.foodService.getFoodWithIngredients(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodService.update(+id, updateFoodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foodService.remove(+id);
  }
}