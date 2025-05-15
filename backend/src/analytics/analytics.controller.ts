import { Controller, Get, Query, UseGuards, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  TopArtistsResponseDto,
  TopTracksResponseDto,
  TopAlbumsResponseDto,
  WeeklyTrackChartResponseDto,
  WeeklyArtistChartResponseDto,
  WeeklyAlbumChartResponseDto,
} from './dto/analytics.dto';

// Define available periods for Last.fm API
const validPeriods = ['overall', '7day', '1month', '3month', '6month', '12month'];
class PeriodValidationPipe extends ValidationPipe {
  constructor() {
    super({ transform: true, whitelist: true });
  }
  transform(value: any): any {
    if (value && !validPeriods.includes(value)) {
      return 'overall'; // Default to 'overall' if invalid period is provided
    }
    return value || 'overall'; // Default to 'overall' if no period is provided
  }
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-artists')
  async getTopArtists(
    @CurrentUser('userId') userId: string,
    @Query('period', PeriodValidationPipe) period: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ): Promise<TopArtistsResponseDto> {
    return this.analyticsService.getTopArtists(userId, period, limit || 10, page || 1);
  }

  @Get('top-tracks')
  async getTopTracks(
    @CurrentUser('userId') userId: string,
    @Query('period', PeriodValidationPipe) period: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ): Promise<TopTracksResponseDto> {
    return this.analyticsService.getTopTracks(userId, period, limit || 10, page || 1);
  }

  @Get('top-albums')
  async getTopAlbums(
    @CurrentUser('userId') userId: string,
    @Query('period', PeriodValidationPipe) period: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ): Promise<TopAlbumsResponseDto> {
    return this.analyticsService.getTopAlbums(userId, period, limit || 10, page || 1);
  }

  // Endpoints for Weekly Charts
  @Get('weekly-tracks')
  async getWeeklyTrackChart(
    @CurrentUser('userId') userId: string,
    @Query('from') from?: string, // Optional: UNIX timestamp
    @Query('to') to?: string, // Optional: UNIX timestamp
  ): Promise<WeeklyTrackChartResponseDto> {
    return this.analyticsService.getWeeklyTrackChart(userId, from, to);
  }

  @Get('weekly-artists')
  async getWeeklyArtistChart(
    @CurrentUser('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<WeeklyArtistChartResponseDto> {
    return this.analyticsService.getWeeklyArtistChart(userId, from, to);
  }

  @Get('weekly-albums')
  async getWeeklyAlbumChart(
    @CurrentUser('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<WeeklyAlbumChartResponseDto> {
    return this.analyticsService.getWeeklyAlbumChart(userId, from, to);
  }
}
