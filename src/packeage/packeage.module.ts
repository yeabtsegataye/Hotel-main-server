import { Module } from '@nestjs/common';
import { PackeageService } from './packeage.service';
import { PackeageController } from './packeage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packeage } from './entities/packeage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Packeage])],
  controllers: [PackeageController],
  providers: [PackeageService],
})
export class PackeageModule {}
