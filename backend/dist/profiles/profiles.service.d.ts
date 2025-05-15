import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';
import { Profile } from '@prisma/client';
export declare class ProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(userId: string): Promise<Profile | null>;
    update(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile>;
}
