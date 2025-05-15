import { AnalyticsService } from './analytics.service';
import { TopArtistsResponseDto, TopTracksResponseDto, TopAlbumsResponseDto, WeeklyTrackChartResponseDto, WeeklyArtistChartResponseDto, WeeklyAlbumChartResponseDto } from './dto/analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getTopArtists(userId: string, period: string, limit?: number, page?: number): Promise<TopArtistsResponseDto>;
    getTopTracks(userId: string, period: string, limit?: number, page?: number): Promise<TopTracksResponseDto>;
    getTopAlbums(userId: string, period: string, limit?: number, page?: number): Promise<TopAlbumsResponseDto>;
    getWeeklyTrackChart(userId: string, from?: string, to?: string): Promise<WeeklyTrackChartResponseDto>;
    getWeeklyArtistChart(userId: string, from?: string, to?: string): Promise<WeeklyArtistChartResponseDto>;
    getWeeklyAlbumChart(userId: string, from?: string, to?: string): Promise<WeeklyAlbumChartResponseDto>;
}
