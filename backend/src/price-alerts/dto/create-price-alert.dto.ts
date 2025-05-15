import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsUrl,
  Min,
  MaxLength,
  IsPositive,
  IsInt,
} from 'class-validator';

export class CreatePriceAlertDto {
  @ApiProperty({ description: 'User ID (UUID from auth.users)', example: 'user-uuid-123' })
  @IsUUID()
  userId: string; // This should ideally be taken from the authenticated user context, not payload

  @ApiPropertyOptional({
    description: 'ID of the local VinylItem to associate with this alert',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  vinyl_item_id?: number;

  @ApiPropertyOptional({
    description: 'External item identifier (e.g., ASIN, Discogs Release ID)',
    example: 'B0000025A3',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  external_item_id?: string;

  @ApiProperty({ description: 'Title of the item being tracked', example: 'Kind of Blue' })
  @IsString()
  @MaxLength(255)
  item_title: string;

  @ApiPropertyOptional({ description: 'Artist of the item being tracked', example: 'Miles Davis' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  item_artist?: string;

  @ApiProperty({ description: 'Type of item (e.g., VINYL, CD)', example: 'VINYL' })
  @IsString()
  @MaxLength(50)
  item_type: string;

  @ApiProperty({ description: 'Retailer or source of the price', example: 'Amazon US' })
  @IsString()
  @MaxLength(100)
  retailer: string;

  @ApiPropertyOptional({
    description: 'Direct URL to the item page',
    example: 'https://amazon.com/dp/B0000025A3',
  })
  @IsOptional()
  @IsUrl()
  url_to_item?: string;

  @ApiProperty({
    description: 'Target price for the alert',
    example: 25.99,
    type: 'number',
    format: 'float',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  target_price: number;

  @ApiProperty({ description: 'Currency code (3-letter ISO)', example: 'USD' })
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiPropertyOptional({
    description: 'Is the alert currently active?',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  alert_active?: boolean = true;
}
