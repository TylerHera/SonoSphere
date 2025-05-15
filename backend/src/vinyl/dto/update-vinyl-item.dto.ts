import { PartialType } from '@nestjs/mapped-types';
import { CreateVinylItemDto, CollectionItemStatusDto } from './create-vinyl-item.dto';
import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';

export class UpdateVinylItemDto extends PartialType(CreateVinylItemDto) {
  // No specific overrides needed here if all fields are optional from CreateVinylItemDto
  // and PartialType makes them optional.
  // However, if status wasn't optional in Create (or had a default we don't want on update),
  // we would redefine it here.

  @IsOptional()
  @IsEnum(CollectionItemStatusDto)
  status?: CollectionItemStatusDto;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  folder?: string;
}
