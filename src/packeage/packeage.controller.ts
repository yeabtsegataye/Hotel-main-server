import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PackeageService } from './packeage.service';
import { CreatePackeageDto } from './dto/create-packeage.dto';
import { UpdatePackeageDto } from './dto/update-packeage.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('packeage')
export class PackeageController {
  constructor(private readonly packeageService: PackeageService) {}
  @Public()
  @Post('create')
  create(@Body() createPackeageDto: CreatePackeageDto) {
    return this.packeageService.create(createPackeageDto);
  }
  @Public()
  @Get('get')
  findAll() {
    return this.packeageService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packeageService.findOne(+id);
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackeageDto: UpdatePackeageDto) {
    return this.packeageService.update(+id, updatePackeageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packeageService.remove(+id);
  }
}
