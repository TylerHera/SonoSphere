import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VinylItemsModule } from './vinyl/vinyl-items.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
// import { VinylItemsModule } from './vinyl-items/vinyl-items.module'; // To be created

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available throughout the application
      envFilePath: '.env', // Specifies the .env file to load
    }),
    CacheModule.registerAsync({
      isGlobal: true, // Make CacheManager available globally
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          // Fallback or error if REDIS_URL is not set
          console.warn(
            'REDIS_URL not configured. Caching will be disabled or use in-memory store.',
          );
          return {
            ttl: 5 * 1000, // 5 seconds default TTL for in-memory
          };
        }
        const store = await redisStore({
          url: redisUrl,
          ttl: 10 * 60 * 1000, // Default TTL for Redis cache: 10 minutes (in milliseconds)
        });
        return {
          store: store,
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    VinylItemsModule,
    ProfilesModule,
    AuthModule,
    // VinylItemsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
