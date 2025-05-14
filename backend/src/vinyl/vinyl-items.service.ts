import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVinylItemDto, UpdateVinylItemDto } from './dto';
import { VinylItem } from '@prisma/client'; // Import the Prisma-generated type

@Injectable()
export class VinylItemsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createVinylItemDto: CreateVinylItemDto): Promise<VinylItem> {
    return this.prisma.vinylItem.create({
      data: {
        ...createVinylItemDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<VinylItem[]> {
    return this.prisma.vinylItem.findMany({
      where: { userId },
      orderBy: {
        addedAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<VinylItem | null> {
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
    id: string,
    updateVinylItemDto: UpdateVinylItemDto,
  ): Promise<VinylItem> {
    // First, verify the item exists and belongs to the user
    await this.findOne(userId, id);
    // findOne throws NotFoundException if not found or not owned by user, so no need to check again here.

    return this.prisma.vinylItem.update({
      where: { id }, // id is unique, so no need for userId here in the where clause for update
      data: updateVinylItemDto,
    });
  }

  async remove(userId: string, id: string): Promise<VinylItem> {
    // First, verify the item exists and belongs to the user
    await this.findOne(userId, id);
    // findOne throws NotFoundException if not found or not owned by user.

    return this.prisma.vinylItem.delete({
      where: { id }, // id is unique
    });
  }
}
