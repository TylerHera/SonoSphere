"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const config_1 = require("@nestjs/config");
const vinyl_items_module_1 = require("./vinyl/vinyl-items.module");
const profiles_module_1 = require("./profiles/profiles.module");
const auth_module_1 = require("./auth/auth.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const analytics_module_1 = require("./analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
                    if (!redisUrl) {
                        console.warn('REDIS_URL not configured. Caching will use in-memory store.');
                        return {
                            ttl: 5 * 1000,
                        };
                    }
                    try {
                        console.log(`Attempting to connect to Redis with URL: ${redisUrl}`);
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            url: redisUrl,
                            ttl: 10 * 60,
                        });
                        console.log('Successfully connected to Redis and created store.');
                        return {
                            store: store,
                            ttl: 10 * 60 * 1000,
                        };
                    }
                    catch (error) {
                        console.error('Failed to connect to Redis or create store:', error);
                        console.warn('Falling back to in-memory cache due to Redis connection failure.');
                        return {
                            ttl: 5 * 1000,
                        };
                    }
                },
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            vinyl_items_module_1.VinylItemsModule,
            profiles_module_1.ProfilesModule,
            auth_module_1.AuthModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map