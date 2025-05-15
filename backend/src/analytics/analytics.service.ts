import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  TopArtistsResponseDto,
  TopTracksResponseDto,
  TopAlbumsResponseDto,
  LastFmArtistStats,
  LastFmTrackStats,
  LastFmAlbumStats,
  WeeklyTrackChartResponseDto,
  WeeklyArtistChartResponseDto,
  WeeklyAlbumChartResponseDto,
  LastFmWeeklyTrack,
  LastFmWeeklyArtist,
  LastFmWeeklyAlbum,
} from './dto/analytics.dto';

const LASTFM_API_BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

interface LastFmResponse<T> {
  topartists?: T; // For getTopArtists
  toptracks?: T; // For getTopTracks
  topalbums?: T; // For getTopAlbums
  weeklytrackchart?: T; // Added for getWeeklyTrackChart
  weeklyartistchart?: T; // Added for getWeeklyArtistChart
  weeklyalbumchart?: T; // Added for getWeeklyAlbumChart
  error?: number;
  message?: string;
}

interface LastFmAttr {
  page?: string; // Optional for non-paginated top charts
  perPage?: string; // Optional
  totalPages?: string; // Optional
  total?: string; // Optional
  user: string;
  from?: string; // For weekly charts
  to?: string; // For weekly charts
}

interface LastFmTopArtistsData {
  artist: LastFmArtistStats[];
  '@attr': LastFmAttr;
}

interface LastFmTopTracksData {
  track: LastFmTrackStats[];
  '@attr': LastFmAttr;
}

interface LastFmTopAlbumsData {
  album: LastFmAlbumStats[];
  '@attr': LastFmAttr;
}

// Interfaces for weekly chart data structures from Last.fm
interface LastFmWeeklyTrackChartData {
  track: LastFmWeeklyTrack[];
  '@attr': LastFmAttr;
}

interface LastFmWeeklyArtistChartData {
  artist: LastFmWeeklyArtist[];
  '@attr': LastFmAttr;
}

interface LastFmWeeklyAlbumChartData {
  album: LastFmWeeklyAlbum[];
  '@attr': LastFmAttr;
}

@Injectable()
export class AnalyticsService {
  private readonly lastFmApiKey: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.lastFmApiKey = this.configService.get<string>('LASTFM_API_KEY');
    if (!this.lastFmApiKey) {
      throw new Error('LASTFM_API_KEY is not configured in environment variables.');
    }
  }

  private async getLastFmUsername(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { lastfm_username: true },
    });
    if (!profile || !profile.lastfm_username) {
      throw new NotFoundException('Last.fm username not found for this user.');
    }
    return profile.lastfm_username;
  }

  private async fetchFromLastFm<T>(params: Record<string, string>): Promise<T> {
    const allParams = {
      ...params,
      api_key: this.lastFmApiKey,
      format: 'json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(LASTFM_API_BASE_URL, { params: allParams }),
      );
      const responseData = response.data as LastFmResponse<T>;
      if (responseData.error) {
        throw new HttpException(
          responseData.message || 'Last.fm API error',
          responseData.error === 10 ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_REQUEST,
        );
      }
      return responseData as T; // This needs careful casting based on actual Last.fm structure
    } catch (error) {
      console.error('Error fetching from Last.fm:', error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to fetch data from Last.fm', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTopArtists(
    userId: string,
    period: string = 'overall',
    limit: number = 10,
    page: number = 1,
  ): Promise<TopArtistsResponseDto> {
    const username = await this.getLastFmUsername(userId);
    const response = await this.fetchFromLastFm<LastFmResponse<LastFmTopArtistsData>>({
      method: 'user.gettopartists',
      user: username,
      period,
      limit: String(limit),
      page: String(page),
    });
    // The actual data is nested, e.g., response.topartists.artist
    const data = response.topartists;
    if (!data || !data.artist)
      throw new NotFoundException('No top artists data found from Last.fm');

    return {
      artists: data.artist,
      total: parseInt(data['@attr'].total, 10),
      page: parseInt(data['@attr'].page, 10),
      perPage: parseInt(data['@attr'].perPage, 10),
      totalPages: parseInt(data['@attr'].totalPages, 10),
    };
  }

  async getTopTracks(
    userId: string,
    period: string = 'overall',
    limit: number = 10,
    page: number = 1,
  ): Promise<TopTracksResponseDto> {
    const username = await this.getLastFmUsername(userId);
    const response = await this.fetchFromLastFm<LastFmResponse<LastFmTopTracksData>>({
      method: 'user.gettoptracks',
      user: username,
      period,
      limit: String(limit),
      page: String(page),
    });
    const data = response.toptracks;
    if (!data || !data.track) throw new NotFoundException('No top tracks data found from Last.fm');

    return {
      tracks: data.track,
      total: parseInt(data['@attr'].total, 10),
      page: parseInt(data['@attr'].page, 10),
      perPage: parseInt(data['@attr'].perPage, 10),
      totalPages: parseInt(data['@attr'].totalPages, 10),
    };
  }

  async getTopAlbums(
    userId: string,
    period: string = 'overall',
    limit: number = 10,
    page: number = 1,
  ): Promise<TopAlbumsResponseDto> {
    const username = await this.getLastFmUsername(userId);
    const response = await this.fetchFromLastFm<LastFmResponse<LastFmTopAlbumsData>>({
      method: 'user.gettopalbums',
      user: username,
      period,
      limit: String(limit),
      page: String(page),
    });
    const data = response.topalbums;
    if (!data || !data.album) throw new NotFoundException('No top albums data found from Last.fm');

    return {
      albums: data.album,
      total: parseInt(data['@attr'].total, 10),
      page: parseInt(data['@attr'].page, 10),
      perPage: parseInt(data['@attr'].perPage, 10),
      totalPages: parseInt(data['@attr'].totalPages, 10),
    };
  }

  // --- Methods for Weekly Charts ---

  async getWeeklyTrackChart(
    userId: string,
    from?: string,
    to?: string,
  ): Promise<WeeklyTrackChartResponseDto> {
    const username = await this.getLastFmUsername(userId);
    const params: Record<string, string> = {
      method: 'user.getweeklytrackchart',
      user: username,
    };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await this.fetchFromLastFm<LastFmResponse<LastFmWeeklyTrackChartData>>(params);
    const data = response.weeklytrackchart;
    if (!data || !data.track)
      throw new NotFoundException('No weekly track chart data found from Last.fm');

    return {
      tracks: data.track,
      from: data['@attr'].from,
      to: data['@attr'].to,
    };
  }

  async getWeeklyArtistChart(
    userId: string,
    from?: string,
    to?: string,
  ): Promise<WeeklyArtistChartResponseDto> {
    const username = await this.getLastFmUsername(userId);
    const params: Record<string, string> = {
      method: 'user.getweeklyartistchart',
      user: username,
    };
    if (from) params.from = from;
    if (to) params.to = to;

    const response =
      await this.fetchFromLastFm<LastFmResponse<LastFmWeeklyArtistChartData>>(params);
    const data = response.weeklyartistchart;
    if (!data || !data.artist)
      throw new NotFoundException('No weekly artist chart data found from Last.fm');

    return {
      artists: data.artist,
      from: data['@attr'].from,
      to: data['@attr'].to,
    };
  }

  async getWeeklyAlbumChart(
    userId: string,
    from?: string,
    to?: string,
  ): Promise<WeeklyAlbumChartResponseDto> {
    const username = await this.getLastFmUsername(userId);
    const params: Record<string, string> = {
      method: 'user.getweeklyalbumchart',
      user: username,
    };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await this.fetchFromLastFm<LastFmResponse<LastFmWeeklyAlbumChartData>>(params);
    const data = response.weeklyalbumchart;
    if (!data || !data.album)
      throw new NotFoundException('No weekly album chart data found from Last.fm');

    return {
      albums: data.album,
      from: data['@attr'].from,
      to: data['@attr'].to,
    };
  }
}
