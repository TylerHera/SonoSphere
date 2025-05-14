import { Module } from '@nestjs/common';
import { VinylItemsService } from './vinyl-items.service';
import { VinylItemsController } from './vinyl-items.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Ensure PrismaService is available

@Module({
  imports: [PrismaModule], // Import PrismaModule to use PrismaService
  controllers: [VinylItemsController],
  providers: [VinylItemsService],
})
export class VinylItemsModule {}
