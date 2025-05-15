import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceAlertDto } from './create-price-alert.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdatePriceAlertDto extends PartialType(CreatePriceAlertDto) {
  // You can add specific fields for update that are not in CreatePriceAlertDto or override existing ones
  // For example, current_price might be updated by a background job, not directly by user update.

  @ApiPropertyOptional({
    description: 'Last fetched current price of the item',
    example: 29.99,
    type: 'number',
    format: 'float',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  current_price?: number;

  @ApiPropertyOptional({
    description: 'Timestamp of when the alert condition was last met',
  })
  @IsOptional()
  triggered_at?: Date;

  @ApiPropertyOptional({
    description:
      'Is the alert currently active? Overrides value from CreatePriceAlertDto if provided.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  alert_active?: boolean;
}
