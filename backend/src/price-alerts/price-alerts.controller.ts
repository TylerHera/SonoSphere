import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PriceAlertsService } from './price-alerts.service';
import { CreatePriceAlertDto, UpdatePriceAlertDto } from './dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Corrected guard import

@ApiTags('Price Alerts')
@ApiBearerAuth() // Indicates that JWT is expected in Authorization header
@UseGuards(JwtAuthGuard) // Use the existing JWT guard
@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private readonly priceAlertsService: PriceAlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiResponse({ status: 201, description: 'Price alert created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createPriceAlertDto: CreatePriceAlertDto, @Req() req: any) {
    const userId = req.user.sub; // 'sub' should be the user ID from JWT payload
    return this.priceAlertsService.create(createPriceAlertDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all price alerts for the authenticated user' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active alerts only',
  })
  @ApiResponse({ status: 200, description: 'List of price alerts.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const userId = req.user.sub;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    let whereClause: any = {}; // Define type for whereClause if possible, e.g., Prisma.PriceAlertWhereInput
    if (activeOnly && activeOnly.toLowerCase() === 'true') {
      whereClause.alert_active = true;
    }

    return this.priceAlertsService.findAll(userId, {
      skip: skip,
      take: limitNum,
      where: whereClause,
      orderBy: { created_at: 'desc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific price alert by ID' })
  @ApiResponse({ status: 200, description: 'Price alert details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Price alert not found.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    return this.priceAlertsService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific price alert by ID' })
  @ApiResponse({ status: 200, description: 'Price alert updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Price alert not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePriceAlertDto: UpdatePriceAlertDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.priceAlertsService.update(+id, updatePriceAlertDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific price alert by ID' })
  @ApiResponse({ status: 204, description: 'Price alert deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Price alert not found.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    return this.priceAlertsService.remove(+id, userId);
  }
}
