import { Controller, Get, Patch, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('profiles')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me') // Route to get the current authenticated user's profile
  @UseInterceptors(CacheInterceptor)
  @CacheKey('my_profile') // Will be further made unique by user context if key generator is smart
  @CacheTTL(60 * 15 * 1000) // Cache for 15 minutes
  async getMyProfile(@CurrentUser('userId') userId: string) {
    console.log(
      `Fetching profile for user: ${userId} - CacheKey: my_profile (SHOULD BE USER-SPECIFIC INTERNALLY)`,
    );
    return this.profilesService.findOne(userId);
  }

  @Patch('me') // Route to update the current authenticated user's profile
  async updateMyProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // TODO: Invalidate 'my_profile' cache for this user
    // const cacheManager = Inject(CACHE_MANAGER) cacheManager // how to inject in controller or service for invalidation
    // await cacheManager.del(...)
    return this.profilesService.update(userId, updateProfileDto);
  }
}
