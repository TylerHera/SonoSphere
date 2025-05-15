import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TopArtistsResponseDto, TopTracksResponseDto, TopAlbumsResponseDto, WeeklyTrackChartResponseDto, WeeklyArtistChartResponseDto, WeeklyAlbumChartResponseDto } from './dto/analytics.dto';
export declare class AnalyticsService {
    private prisma;
    private httpService;
    private configService;
    private readonly lastFmApiKey;
    constructor(prisma: PrismaService, httpService: HttpService, configService: ConfigService);
    private getLastFmUsername;
    private fetchFromLastFm;
    getTopArtists(userId: string, period?: string, limit?: number, page?: number): Promise<TopArtistsResponseDto>;
    getTopTracks(userId: string, period?: string, limit?: number, page?: number): Promise<TopTracksResponseDto>;
    getTopAlbums(userId: string, period?: string, limit?: number, page?: number): Promise<TopAlbumsResponseDto>;
    getWeeklyTrackChart(userId: string, from?: string, to?: string): Promise<WeeklyTrackChartResponseDto>;
    getWeeklyArtistChart(userId: string, from?: string, to?: string): Promise<WeeklyArtistChartResponseDto>;
    getWeeklyAlbumChart(userId: string, from?: string, to?: string): Promise<WeeklyAlbumChartResponseDto>;
}
