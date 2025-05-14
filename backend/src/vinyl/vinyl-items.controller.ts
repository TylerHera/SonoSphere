import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { VinylItemsService } from './vinyl-items.service';
import { CreateVinylItemDto, UpdateVinylItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('vinyl-items')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class VinylItemsController {
  constructor(private readonly vinylItemsService: VinylItemsService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() createVinylItemDto: CreateVinylItemDto) {
    return this.vinylItemsService.create(userId, createVinylItemDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor) // Apply caching to this endpoint
  @CacheKey('user_vinyl_items') // Base key, will be combined with userId
  @CacheTTL(60 * 5 * 1000) // Cache for 5 minutes (in milliseconds)
  findAll(@CurrentUser('userId') userId: string) {
    console.log(
      `Fetching vinyl items for user: ${userId} - CacheKey: user_vinyl_items (NEEDS TO BE USER SPECIFIC)`,
    );
    return this.vinylItemsService.findAll(userId);
  }

  @Get(':id')
  // Cache individual items too, key should include item ID and user ID
  @UseInterceptors(CacheInterceptor)
  // @CacheKey(`vinyl_item_${id}_user_${userId}`) // This is illustrative of desired dynamic key
  @CacheTTL(60 * 10 * 1000) // Cache for 10 minutes
  findOne(@CurrentUser('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    console.log(
      `Fetching vinyl item ${id} for user: ${userId} - (NEEDS USER AND ITEM SPECIFIC CACHE KEY)`,
    );
    return this.vinylItemsService.findOne(userId, String(id));
  }

  @Patch(':id')
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVinylItemDto: UpdateVinylItemDto,
  ) {
    // TODO: Invalidate cache for `user_vinyl_items` and `vinyl_item_${id}_user_${userId}`
    return this.vinylItemsService.update(userId, String(id), updateVinylItemDto);
  }

  @Delete(':id')
  async remove(@CurrentUser('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    // TODO: Invalidate cache
    return this.vinylItemsService.remove(userId, String(id));
  }
}
