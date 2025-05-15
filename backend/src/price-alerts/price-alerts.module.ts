import { Module } from '@nestjs/common';
import { PriceAlertsService } from './price-alerts.service';
import { PriceAlertsController } from './price-alerts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // For JWT Guard dependency

@Module({
  imports: [PrismaModule, AuthModule], // AuthModule might be needed if JwtAuthGuard is provided there
  controllers: [PriceAlertsController],
  providers: [PriceAlertsService],
  exports: [PriceAlertsService], // If other modules need to use this service
})
export class PriceAlertsModule {}
