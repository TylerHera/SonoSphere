import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceAlertDto, UpdatePriceAlertDto } from './dto';
import { PriceAlert, Prisma } from '@prisma/client'; // Import Prisma types

@Injectable()
export class PriceAlertsService {
  private readonly logger = new Logger(PriceAlertsService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    createPriceAlertDto: CreatePriceAlertDto,
    userId: string, // userId should be from authenticated user
  ): Promise<PriceAlert> {
    this.logger.log(
      `Attempting to create price alert for user ${userId}, item: ${createPriceAlertDto.item_title}`,
    );
    try {
      // Ensure userId from DTO matches authenticated user, or remove from DTO and use authenticated user ID
      const alert = await this.prisma.priceAlert.create({
        data: {
          ...createPriceAlertDto,
          userId: userId, // Override or ensure this is the authenticated user's ID
          // Prisma will handle default for alert_active if not provided in DTO
        },
      });
      this.logger.log(`Price alert created with ID: ${alert.id}`);
      return alert;
    } catch (error) {
      this.logger.error(
        `Failed to create price alert for user ${userId}: ${error.message}`,
        error.stack,
      );
      // Handle specific Prisma errors if needed, e.g., foreign key constraint
      throw error; // Re-throw or return a custom error response
    }
  }

  async findAll(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.PriceAlertWhereUniqueInput;
      where?: Prisma.PriceAlertWhereInput;
      orderBy?: Prisma.PriceAlertOrderByWithRelationInput;
    },
  ): Promise<{
    data: PriceAlert[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, take, where, orderBy } = params;
    const effectiveWhere = { ...where, userId }; // Ensure user only sees their alerts

    this.logger.log(
      `Fetching all price alerts for user ${userId} with params: ${JSON.stringify(params)}`,
    );
    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.priceAlert.findMany({
          skip,
          take,
          where: effectiveWhere,
          orderBy,
        }),
        this.prisma.priceAlert.count({ where: effectiveWhere }),
      ]);

      const page = take && skip !== undefined ? Math.floor(skip / take) + 1 : 1;
      const limit = take || total;
      const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

      return { data, total, page, limit, totalPages };
    } catch (error) {
      this.logger.error(
        `Failed to fetch price alerts for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number, userId: string): Promise<PriceAlert | null> {
    this.logger.log(`Fetching price alert with ID: ${id} for user ${userId}`);
    const alert = await this.prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert || alert.userId !== userId) {
      this.logger.warn(`Price alert with ID ${id} not found or does not belong to user ${userId}`);
      throw new NotFoundException(`Price alert with ID ${id} not found or not accessible.`);
    }
    return alert;
  }

  async update(
    id: number,
    updatePriceAlertDto: UpdatePriceAlertDto,
    userId: string,
  ): Promise<PriceAlert> {
    this.logger.log(`Attempting to update price alert ID: ${id} for user ${userId}`);
    // First, verify the alert exists and belongs to the user
    const existingAlert = await this.findOne(id, userId); // This will throw NotFoundException if not found/accessible

    try {
      const updatedAlert = await this.prisma.priceAlert.update({
        where: { id }, // id is already validated to belong to user by findOne
        data: updatePriceAlertDto,
      });
      this.logger.log(`Price alert ID: ${id} updated successfully.`);
      return updatedAlert;
    } catch (error) {
      this.logger.error(
        `Failed to update price alert ID ${id} for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number, userId: string): Promise<PriceAlert> {
    this.logger.log(`Attempting to remove price alert ID: ${id} for user ${userId}`);
    // First, verify the alert exists and belongs to the user
    const existingAlert = await this.findOne(id, userId); // This will throw NotFoundException if not found/accessible

    try {
      const deletedAlert = await this.prisma.priceAlert.delete({
        where: { id }, // id is already validated
      });
      this.logger.log(`Price alert ID: ${id} removed successfully.`);
      return deletedAlert;
    } catch (error) {
      this.logger.error(
        `Failed to remove price alert ID ${id} for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // TODO: Add method to be called by a background job to check prices and update alerts
  // async checkAndUpdateAlertPrices(): Promise<void> { ... }
}
