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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinylItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VinylItemsService = class VinylItemsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createVinylItemDto) {
        return this.prisma.vinylItem.create({
            data: {
                userId,
                title: createVinylItemDto.title,
                artist_main: createVinylItemDto.artist_main,
                discogs_id: createVinylItemDto.discogs_id,
                artists_extra: createVinylItemDto.artists_extra,
                release_title: createVinylItemDto.release_title,
                year: createVinylItemDto.year,
                formats: createVinylItemDto.formats,
                labels: createVinylItemDto.labels,
                genres: createVinylItemDto.genres,
                styles: createVinylItemDto.styles,
                cover_url_small: createVinylItemDto.cover_url_small,
                cover_url_large: createVinylItemDto.cover_url_large,
                notes: createVinylItemDto.notes,
                custom_tags: createVinylItemDto.custom_tags,
                status: createVinylItemDto.status,
                folder: createVinylItemDto.folder,
            },
        });
    }
    async findAll(userId, page = 1, limit = 20, search, status, genre, sortBy, sortOrder, tags, folder) {
        const skip = (page - 1) * limit;
        const take = limit;
        const whereClause = { userId };
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { artist_main: { contains: search, mode: 'insensitive' } },
                { release_title: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            whereClause.status = status;
        }
        if (genre) {
            whereClause.genres = { has: genre };
        }
        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            if (tagsArray.length > 0) {
                whereClause.custom_tags = { hasSome: tagsArray };
            }
        }
        if (folder) {
            whereClause.folder = folder;
        }
        const orderByClause = {};
        if (sortBy && sortOrder) {
            const validSortByFields = ['added_at', 'title', 'artist_main', 'year'];
            if (validSortByFields.includes(sortBy)) {
                orderByClause[sortBy] = sortOrder;
            }
            else {
                orderByClause['added_at'] = 'desc';
            }
        }
        else {
            orderByClause['added_at'] = 'desc';
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vinylItem.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip,
                take,
            }),
            this.prisma.vinylItem.count({ where: whereClause }),
        ]);
        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(userId, id) {
        const vinylItem = await this.prisma.vinylItem.findUnique({
            where: { id },
        });
        if (!vinylItem || vinylItem.userId !== userId) {
            throw new common_1.NotFoundException(`Vinyl item with ID "${id}" not found or access denied.`);
        }
        return vinylItem;
    }
    async update(userId, id, updateVinylItemDto) {
        await this.findOne(userId, id);
        const dataToUpdate = {};
        if (updateVinylItemDto.title !== undefined)
            dataToUpdate.title = updateVinylItemDto.title;
        if (updateVinylItemDto.artist_main !== undefined)
            dataToUpdate.artist_main = updateVinylItemDto.artist_main;
        if (updateVinylItemDto.discogs_id !== undefined)
            dataToUpdate.discogs_id = updateVinylItemDto.discogs_id;
        if (updateVinylItemDto.artists_extra !== undefined)
            dataToUpdate.artists_extra = updateVinylItemDto.artists_extra;
        if (updateVinylItemDto.release_title !== undefined)
            dataToUpdate.release_title = updateVinylItemDto.release_title;
        if (updateVinylItemDto.year !== undefined)
            dataToUpdate.year = updateVinylItemDto.year;
        if (updateVinylItemDto.formats !== undefined)
            dataToUpdate.formats = updateVinylItemDto.formats;
        if (updateVinylItemDto.labels !== undefined)
            dataToUpdate.labels = updateVinylItemDto.labels;
        if (updateVinylItemDto.genres !== undefined)
            dataToUpdate.genres = updateVinylItemDto.genres;
        if (updateVinylItemDto.styles !== undefined)
            dataToUpdate.styles = updateVinylItemDto.styles;
        if (updateVinylItemDto.cover_url_small !== undefined)
            dataToUpdate.cover_url_small = updateVinylItemDto.cover_url_small;
        if (updateVinylItemDto.cover_url_large !== undefined)
            dataToUpdate.cover_url_large = updateVinylItemDto.cover_url_large;
        if (updateVinylItemDto.notes !== undefined)
            dataToUpdate.notes = updateVinylItemDto.notes;
        if (updateVinylItemDto.custom_tags !== undefined)
            dataToUpdate.custom_tags = updateVinylItemDto.custom_tags;
        if (updateVinylItemDto.status !== undefined)
            dataToUpdate.status = updateVinylItemDto.status;
        if (updateVinylItemDto.folder !== undefined)
            dataToUpdate.folder = updateVinylItemDto.folder;
        if (Object.keys(dataToUpdate).length === 0) {
            return this.findOne(userId, id);
        }
        return this.prisma.vinylItem.update({
            where: { id },
            data: dataToUpdate,
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.vinylItem.delete({
            where: { id },
        });
    }
};
exports.VinylItemsService = VinylItemsService;
exports.VinylItemsService = VinylItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VinylItemsService);
//# sourceMappingURL=vinyl-items.service.js.map