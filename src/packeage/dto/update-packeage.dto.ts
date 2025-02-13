import { PartialType } from '@nestjs/mapped-types';
import { CreatePackeageDto } from './create-packeage.dto';

export class UpdatePackeageDto extends PartialType(CreatePackeageDto) {}
