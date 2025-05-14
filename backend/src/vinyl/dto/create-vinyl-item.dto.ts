import { IsString, IsInt, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

export class CreateVinylItemDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  artist: string;

  @IsOptional()
  @IsInt()
  discogsReleaseId?: number;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  // userId will be injected from the authenticated user context, not part of the public DTO
}
