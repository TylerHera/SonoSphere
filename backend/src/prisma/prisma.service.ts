import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Prisma Connect is called automatically by the PrismaClient constructor.
    // However, explicitly calling connect here can be useful for ensuring
    // the database is reachable on module initialization, though it's often not strictly necessary.
    // await this.$connect();
    // For this setup, we'll rely on Prisma's default behavior of connecting lazily on first query.
  }

  // Graceful shutdown:
  // async enableShutdownHooks(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //   });
  // }
  // The shutdown hook will be managed in main.ts for NestJS apps.
}
