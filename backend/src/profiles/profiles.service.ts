import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException(`Profile not found for user ID "${userId}".`);
    }
    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    // Ensure profile exists (findOne will throw if not)
    await this.findOne(userId);

    return this.prisma.profile.update({
      where: { id: userId },
      data: updateProfileDto,
    });
  }

  // Note: Profile creation is handled by a Supabase trigger on auth.users insert.
  // Deletion is handled by ON DELETE CASCADE from auth.users table.
}
