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
  Query,
  ValidationPipe,
  ParseEnumPipe,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { VinylItemsService, PaginatedVinylItemsResult } from './vinyl-items.service';
import { CreateVinylItemDto, UpdateVinylItemDto, CollectionItemStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CollectionItemStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Vinyl Items')
@ApiBearerAuth()
@Controller('vinyl-items')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class VinylItemsController {
  constructor(private readonly vinylItemsService: VinylItemsService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() createVinylItemDto: CreateVinylItemDto) {
    return this.vinylItemsService.create(userId, createVinylItemDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 5 * 1000)
  findAll(
    @CurrentUser('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('status', new ParseEnumPipe(CollectionItemStatusDto, { optional: true }))
    status?: CollectionItemStatusDto,
    @Query('genre') genre?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('tags') tags?: string,
    @Query('folder') folder?: string,
  ): Promise<PaginatedVinylItemsResult> {
    console.log(
      `Fetching vinyl items for user: ${userId}, page: ${page || 1}, limit: ${limit || 20}, search: ${search}, status: ${status}, genre: ${genre}, sortBy: ${sortBy}, sortOrder: ${sortOrder}, tags: ${tags}, folder: ${folder}`,
    );
    const mappedStatus = status as unknown as CollectionItemStatus;
    return this.vinylItemsService.findAll(
      userId,
      page || 1,
      limit || 20,
      search,
      mappedStatus,
      genre,
      sortBy,
      sortOrder,
      tags,
      folder,
    );
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey(`vinyl_item_details`)
  @CacheTTL(60 * 10 * 1000)
  findOne(@CurrentUser('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    console.log(
      `Fetching vinyl item ${id} for user: ${userId} - (NEEDS USER AND ITEM SPECIFIC CACHE KEY)`,
    );
    return this.vinylItemsService.findOne(userId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVinylItemDto: UpdateVinylItemDto,
  ) {
    // TODO: Invalidate cache for `user_vinyl_items` and `vinyl_item_${id}_user_${userId}`
    return this.vinylItemsService.update(userId, id, updateVinylItemDto);
  }

  @Delete(':id')
  async remove(@CurrentUser('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    // TODO: Invalidate cache
    return this.vinylItemsService.remove(userId, id);
  }

  @Get('export/csv')
  async exportCsv(@CurrentUser('userId') userId: string, @Res() res: Response) {
    const csvData = await this.vinylItemsService.exportToCsv(userId);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="sonosphere_collection_${userId}.csv"`);
    res.send(csvData);
  }

  @Post('import/csv')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file containing vinyl items to import.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file')) // 'file' is the field name in the form-data
  async importCsv(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('CSV file is required.'); // Or BadRequestException
    }
    const csvString = file.buffer.toString('utf-8');
    return this.vinylItemsService.importFromCsv(userId, csvString);
  }
}
