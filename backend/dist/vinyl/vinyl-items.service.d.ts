import { PrismaService } from '../prisma/prisma.service';
import { CreateVinylItemDto, UpdateVinylItemDto } from './dto';
import { VinylItem, CollectionItemStatus } from '@prisma/client';
export interface PaginatedVinylItemsResult {
    data: VinylItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class VinylItemsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createVinylItemDto: CreateVinylItemDto): Promise<VinylItem>;
    findAll(userId: string, page?: number, limit?: number, search?: string, status?: CollectionItemStatus, genre?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', tags?: string, folder?: string): Promise<PaginatedVinylItemsResult>;
    findOne(userId: string, id: number): Promise<VinylItem | null>;
    update(userId: string, id: number, updateVinylItemDto: UpdateVinylItemDto): Promise<VinylItem>;
    remove(userId: string, id: number): Promise<VinylItem>;
}
