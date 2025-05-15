import {
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
} from 'class-validator';

// Enum to match Prisma schema
export enum CollectionItemStatusDto {
  OWNED = 'OWNED',
  WISHLIST = 'WISHLIST',
}

export class CreateVinylItemDto {
  @IsOptional()
  @IsInt()
  discogs_id?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  artist_main: string;

  @IsOptional()
  artists_extra?: any; // Prisma Json - no specific validation here without knowing structure

  @IsOptional()
  @IsString()
  @MaxLength(255)
  release_title?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  formats?: any; // Prisma Json

  @IsOptional()
  labels?: any; // Prisma Json

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styles?: string[];

  @IsOptional()
  @IsUrl()
  cover_url_small?: string;

  @IsOptional()
  @IsUrl()
  cover_url_large?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  custom_tags?: string[];

  @IsOptional()
  @IsEnum(CollectionItemStatusDto)
  status?: CollectionItemStatusDto = CollectionItemStatusDto.OWNED;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  folder?: string;

  // userId will be injected from the authenticated user context, not part of the public DTO
}
