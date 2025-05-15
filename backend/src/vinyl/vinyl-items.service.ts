import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVinylItemDto, UpdateVinylItemDto } from './dto';
import { VinylItem, CollectionItemStatus } from '@prisma/client'; // Verified: CollectionItemStatus is correct from Prisma
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import * as Papa from 'papaparse';

export interface PaginatedVinylItemsResult {
  data: VinylItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class VinylItemsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createVinylItemDto: CreateVinylItemDto): Promise<VinylItem> {
    return this.prisma.vinylItem.create({
      data: {
        userId, // Ensure userId is passed directly
        title: createVinylItemDto.title,
        artist_main: createVinylItemDto.artist_main,
        // Optional fields from DTO, Prisma will handle undefined if not provided
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
        folder: createVinylItemDto.folder, // Added folder explicitly
      },
    });
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: CollectionItemStatus, // Uses Prisma's CollectionItemStatus
    genre?: string,
    sortBy?: string, // e.g., 'added_at', 'title', 'artist_main', 'year'
    sortOrder?: 'asc' | 'desc',
    tags?: string, // Comma-separated list of tags
    folder?: string, // Added folder filter
  ): Promise<PaginatedVinylItemsResult> {
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: any = { userId };

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
      whereClause.genres = { has: genre }; // Assumes genre is a single string to check for existence in the array
    }

    if (tags) {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');
      if (tagsArray.length > 0) {
        whereClause.custom_tags = { hasSome: tagsArray };
      }
    }

    if (folder) {
      whereClause.folder = folder;
    }

    const orderByClause: any = {};
    if (sortBy && sortOrder) {
      // Validate sortBy to prevent injection and ensure it's a valid field
      const validSortByFields = ['added_at', 'title', 'artist_main', 'year'];
      if (validSortByFields.includes(sortBy)) {
        orderByClause[sortBy] = sortOrder;
      } else {
        orderByClause['added_at'] = 'desc'; // Default sort if invalid sortBy
      }
    } else {
      orderByClause['added_at'] = 'desc'; // Default sort
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

  async findOne(userId: string, id: number): Promise<VinylItem | null> {
    const vinylItem = await this.prisma.vinylItem.findUnique({
      where: { id },
    });
    if (!vinylItem || vinylItem.userId !== userId) {
      // Ensure the item belongs to the user or doesn't exist
      throw new NotFoundException(`Vinyl item with ID "${id}" not found or access denied.`);
    }
    return vinylItem;
  }

  async update(
    userId: string,
    id: number,
    updateVinylItemDto: UpdateVinylItemDto,
  ): Promise<VinylItem> {
    await this.findOne(userId, id);

    // Explicitly map fields to prevent accidental updates of sensitive fields like userId
    // and to ensure only fields present in UpdateVinylItemDto are processed.
    const dataToUpdate: Partial<VinylItem> = {}; // Use Partial<VinylItem> for type safety

    // List all fields from UpdateVinylItemDto that can be updated
    if (updateVinylItemDto.title !== undefined) dataToUpdate.title = updateVinylItemDto.title;
    if (updateVinylItemDto.artist_main !== undefined)
      dataToUpdate.artist_main = updateVinylItemDto.artist_main;
    if (updateVinylItemDto.discogs_id !== undefined)
      dataToUpdate.discogs_id = updateVinylItemDto.discogs_id;
    if (updateVinylItemDto.artists_extra !== undefined)
      dataToUpdate.artists_extra = updateVinylItemDto.artists_extra;
    if (updateVinylItemDto.release_title !== undefined)
      dataToUpdate.release_title = updateVinylItemDto.release_title;
    if (updateVinylItemDto.year !== undefined) dataToUpdate.year = updateVinylItemDto.year;
    if (updateVinylItemDto.formats !== undefined) dataToUpdate.formats = updateVinylItemDto.formats;
    if (updateVinylItemDto.labels !== undefined) dataToUpdate.labels = updateVinylItemDto.labels;
    if (updateVinylItemDto.genres !== undefined) dataToUpdate.genres = updateVinylItemDto.genres;
    if (updateVinylItemDto.styles !== undefined) dataToUpdate.styles = updateVinylItemDto.styles;
    if (updateVinylItemDto.cover_url_small !== undefined)
      dataToUpdate.cover_url_small = updateVinylItemDto.cover_url_small;
    if (updateVinylItemDto.cover_url_large !== undefined)
      dataToUpdate.cover_url_large = updateVinylItemDto.cover_url_large;
    if (updateVinylItemDto.notes !== undefined) dataToUpdate.notes = updateVinylItemDto.notes;
    if (updateVinylItemDto.custom_tags !== undefined)
      dataToUpdate.custom_tags = updateVinylItemDto.custom_tags;
    if (updateVinylItemDto.status !== undefined) dataToUpdate.status = updateVinylItemDto.status;
    if (updateVinylItemDto.folder !== undefined) dataToUpdate.folder = updateVinylItemDto.folder; // Added folder

    // Prevent attempting to update with an empty object if no valid fields were passed
    if (Object.keys(dataToUpdate).length === 0) {
      // Optionally, could return the item as is, or throw a BadRequestException
      return this.findOne(userId, id); // Return existing item if no changes
    }

    return this.prisma.vinylItem.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(userId: string, id: number): Promise<VinylItem> {
    // First, verify the item exists and belongs to the user
    await this.findOne(userId, id);
    // findOne throws NotFoundException if not found or not owned by user.

    return this.prisma.vinylItem.delete({
      where: { id }, // id is unique
    });
  }

  async exportToCsv(userId: string): Promise<string> {
    const items = await this.prisma.vinylItem.findMany({
      where: { userId },
      orderBy: { added_at: 'desc' },
    });

    if (items.length === 0) {
      return ''; // Or throw an error, or return a header-only CSV
    }

    // Define CSV columns (adjust as needed)
    const columns = [
      'id', 'discogs_id', 'title', 'artist_main', 'release_title', 'year',
      'status', 'folder', 'added_at', 'notes', 'custom_tags',
      // Potentially flatten JSON fields like formats, labels, genres, styles
      // For simplicity, we'll stringify them or select main parts
      'formats_json', 'labels_json', 'genres_list', 'styles_list',
      'cover_url_small', 'cover_url_large'
    ];

    const data = items.map(item => ({
      id: item.id,
      discogs_id: item.discogs_id,
      title: item.title,
      artist_main: item.artist_main,
      release_title: item.release_title,
      year: item.year,
      status: item.status,
      folder: item.folder,
      added_at: item.added_at.toISOString(),
      notes: item.notes,
      custom_tags: item.custom_tags?.join(', '), // Convert array to comma-separated string
      formats_json: JSON.stringify(item.formats), // Simple stringify
      labels_json: JSON.stringify(item.labels),
      genres_list: item.genres?.join(', '),
      styles_list: item.styles?.join(', '),
      cover_url_small: item.cover_url_small,
      cover_url_large: item.cover_url_large,
    }));

    return stringify(data, { header: true, columns });
  }

  async importFromCsv(userId: string, csvString: string): Promise<{ count: number; errors: any[] }> {
    let parsedData;
    try {
      // Using PapaParse for robust parsing, especially with potential client-side generation
      const parseResult = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically convert numbers, booleans
      });
      parsedData = parseResult.data;
      if (parseResult.errors.length > 0) {
        // Handle parsing errors. For simplicity, we'll log them and return an error count.
        // In a real app, you might want more detailed error reporting.
        console.warn("CSV parsing errors:", parseResult.errors);
        // return { count: 0, errors: parseResult.errors };
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV data.');
    }

    if (!parsedData || parsedData.length === 0) {
      return { count: 0, errors: [{ message: 'No data found in CSV.' }] };
    }

    let importedCount = 0;
    const importErrors: any[] = [];

    for (const record of parsedData as any[]) {
      try {
        const createDto: CreateVinylItemDto = {
          title: record.title,
          artist_main: record.artist_main,
          discogs_id: record.discogs_id ? Number(record.discogs_id) : null,
          release_title: record.release_title,
          year: record.year ? Number(record.year) : null,
          status: record.status ? record.status as CollectionItemStatus : CollectionItemStatus.OWNED,
          folder: record.folder,
          notes: record.notes,
          custom_tags: record.custom_tags ? record.custom_tags.split(',').map(tag => tag.trim()) : [],
          // For JSON fields, expect them to be JSON strings or handle appropriately
          formats: record.formats_json ? JSON.parse(record.formats_json) : null,
          labels: record.labels_json ? JSON.parse(record.labels_json) : null,
          genres: record.genres_list ? record.genres_list.split(',').map(g => g.trim()) : [],
          styles: record.styles_list ? record.styles_list.split(',').map(s => s.trim()) : [],
          cover_url_small: record.cover_url_small,
          cover_url_large: record.cover_url_large,
          // artists_extra will be null if not in CSV or handle its parsing if included
        };

        // Basic validation (more can be added with class-validator on a DTO if needed)
        if (!createDto.title || !createDto.artist_main) {
          importErrors.push({ record, error: 'Missing required fields: title or artist_main' });
          continue;
        }

        await this.create(userId, createDto);
        importedCount++;
      } catch (error) {
        importErrors.push({ record, error: error.message });
      }
    }
    return { count: importedCount, errors: importErrors };
  }
}
