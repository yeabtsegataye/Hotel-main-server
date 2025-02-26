import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomRequest } from 'src/auth/custom-request.interface';

@Controller('cat')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
   // console.log(file,'the file',createCategoryDto)

    if (!file) {
      throw new BadRequestException('Image is required.');
    }
    return this.categoryService.create(createCategoryDto, file,req);
  }

  @Get('get')
  findAll(@Req() req: CustomRequest,) {
    return this.categoryService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: CustomRequest) {
    return this.categoryService.findOne(+id, req);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
    
  ) {
    return this.categoryService.update(req,+id, updateCategoryDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string,@Req() req: CustomRequest) {
    return this.categoryService.remove(+id,req);
  }
}