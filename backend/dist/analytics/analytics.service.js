"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const LASTFM_API_BASE_URL = 'http://ws.audioscrobbler.com/2.0/';
let AnalyticsService = class AnalyticsService {
    constructor(prisma, httpService, configService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.configService = configService;
        this.lastFmApiKey = this.configService.get('LASTFM_API_KEY');
        if (!this.lastFmApiKey) {
            throw new Error('LASTFM_API_KEY is not configured in environment variables.');
        }
    }
    async getLastFmUsername(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: { lastfm_username: true },
        });
        if (!profile || !profile.lastfm_username) {
            throw new common_1.NotFoundException('Last.fm username not found for this user.');
        }
        return profile.lastfm_username;
    }
    async fetchFromLastFm(params) {
        const allParams = {
            ...params,
            api_key: this.lastFmApiKey,
            format: 'json',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(LASTFM_API_BASE_URL, { params: allParams }));
            const responseData = response.data;
            if (responseData.error) {
                throw new common_1.HttpException(responseData.message || 'Last.fm API error', responseData.error === 10 ? common_1.HttpStatus.SERVICE_UNAVAILABLE : common_1.HttpStatus.BAD_REQUEST);
            }
            return responseData;
        }
        catch (error) {
            console.error('Error fetching from Last.fm:', error.message);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to fetch data from Last.fm', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async getTopArtists(userId, period = 'overall', limit = 10, page = 1) {
        const username = await this.getLastFmUsername(userId);
        const response = await this.fetchFromLastFm({
            method: 'user.gettopartists',
            user: username,
            period,
            limit: String(limit),
            page: String(page),
        });
        const data = response.topartists;
        if (!data || !data.artist)
            throw new common_1.NotFoundException('No top artists data found from Last.fm');
        return {
            artists: data.artist,
            total: parseInt(data['@attr'].total, 10),
            page: parseInt(data['@attr'].page, 10),
            perPage: parseInt(data['@attr'].perPage, 10),
            totalPages: parseInt(data['@attr'].totalPages, 10),
        };
    }
    async getTopTracks(userId, period = 'overall', limit = 10, page = 1) {
        const username = await this.getLastFmUsername(userId);
        const response = await this.fetchFromLastFm({
            method: 'user.gettoptracks',
            user: username,
            period,
            limit: String(limit),
            page: String(page),
        });
        const data = response.toptracks;
        if (!data || !data.track)
            throw new common_1.NotFoundException('No top tracks data found from Last.fm');
        return {
            tracks: data.track,
            total: parseInt(data['@attr'].total, 10),
            page: parseInt(data['@attr'].page, 10),
            perPage: parseInt(data['@attr'].perPage, 10),
            totalPages: parseInt(data['@attr'].totalPages, 10),
        };
    }
    async getTopAlbums(userId, period = 'overall', limit = 10, page = 1) {
        const username = await this.getLastFmUsername(userId);
        const response = await this.fetchFromLastFm({
            method: 'user.gettopalbums',
            user: username,
            period,
            limit: String(limit),
            page: String(page),
        });
        const data = response.topalbums;
        if (!data || !data.album)
            throw new common_1.NotFoundException('No top albums data found from Last.fm');
        return {
            albums: data.album,
            total: parseInt(data['@attr'].total, 10),
            page: parseInt(data['@attr'].page, 10),
            perPage: parseInt(data['@attr'].perPage, 10),
            totalPages: parseInt(data['@attr'].totalPages, 10),
        };
    }
    async getWeeklyTrackChart(userId, from, to) {
        const username = await this.getLastFmUsername(userId);
        const params = {
            method: 'user.getweeklytrackchart',
            user: username,
        };
        if (from)
            params.from = from;
        if (to)
            params.to = to;
        const response = await this.fetchFromLastFm(params);
        const data = response.weeklytrackchart;
        if (!data || !data.track)
            throw new common_1.NotFoundException('No weekly track chart data found from Last.fm');
        return {
            tracks: data.track,
            from: data['@attr'].from,
            to: data['@attr'].to,
        };
    }
    async getWeeklyArtistChart(userId, from, to) {
        const username = await this.getLastFmUsername(userId);
        const params = {
            method: 'user.getweeklyartistchart',
            user: username,
        };
        if (from)
            params.from = from;
        if (to)
            params.to = to;
        const response = await this.fetchFromLastFm(params);
        const data = response.weeklyartistchart;
        if (!data || !data.artist)
            throw new common_1.NotFoundException('No weekly artist chart data found from Last.fm');
        return {
            artists: data.artist,
            from: data['@attr'].from,
            to: data['@attr'].to,
        };
    }
    async getWeeklyAlbumChart(userId, from, to) {
        const username = await this.getLastFmUsername(userId);
        const params = {
            method: 'user.getweeklyalbumchart',
            user: username,
        };
        if (from)
            params.from = from;
        if (to)
            params.to = to;
        const response = await this.fetchFromLastFm(params);
        const data = response.weeklyalbumchart;
        if (!data || !data.album)
            throw new common_1.NotFoundException('No weekly album chart data found from Last.fm');
        return {
            albums: data.album,
            from: data['@attr'].from,
            to: data['@attr'].to,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map