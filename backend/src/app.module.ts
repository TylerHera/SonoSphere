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
import { AnalyticsModule } from './analytics/analytics.module';
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
          console.warn('REDIS_URL not configured. Caching will use in-memory store.');
          return {
            ttl: 5 * 1000, // 5 seconds default TTL for in-memory
          };
        }

        try {
          console.log(`Attempting to connect to Redis with URL: ${redisUrl}`);
          const store = await redisStore({
            url: redisUrl,
            ttl: 10 * 60, // Default TTL for Redis cache: 10 minutes (in seconds for redisStore)
            // You might want to add socket options here if needed, e.g., connectTimeout
          });
          console.log('Successfully connected to Redis and created store.');
          return {
            store: store,
            ttl: 10 * 60 * 1000, // TTL in milliseconds for CacheModule options
          };
        } catch (error) {
          console.error('Failed to connect to Redis or create store:', error);
          console.warn('Falling back to in-memory cache due to Redis connection failure.');
          return {
            ttl: 5 * 1000, // 5 seconds default TTL for in-memory
          };
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    VinylItemsModule,
    ProfilesModule,
    AuthModule,
    AnalyticsModule,
    // VinylItemsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
