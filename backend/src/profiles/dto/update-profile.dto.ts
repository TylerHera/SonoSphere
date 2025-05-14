import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  // Consider adding a regex for allowed username characters if needed
  username?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048) // Max URL length
  avatar_url?: string;
}
