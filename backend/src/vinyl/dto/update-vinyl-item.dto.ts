import { PartialType } from '@nestjs/mapped-types';
import { CreateVinylItemDto } from './create-vinyl-item.dto';

export class UpdateVinylItemDto extends PartialType(CreateVinylItemDto) {}
