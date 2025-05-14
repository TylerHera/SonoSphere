import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove non-whitelisted properties
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
      transform: true, // Automatically transform payloads to DTO instances
      // transformOptions: { // Optional: enable implicit type conversion if needed
      //   enableImplicitConversion: true,
      // },
    }),
  );

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter()); // Register the global filter

  // TODO: Configure CORS if frontend and backend are on different origins
  // app.enableCors();

  // Enable graceful shutdown for Prisma (PrismaService itself handles its connection lifecycle)
  app.get(PrismaService); // Ensures PrismaService is instantiated and its OnModuleInit/OnApplicationShutdown hooks are registered if used.

  // Get port from config service (environment variables)
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
