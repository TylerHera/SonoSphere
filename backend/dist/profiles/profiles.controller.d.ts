import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto';
export declare class ProfilesController {
    private readonly profilesService;
    constructor(profilesService: ProfilesService);
    getMyProfile(userId: string): Promise<{
        id: string;
        updated_at: Date;
        username: string;
        avatar_url: string;
    }>;
    updateMyProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        updated_at: Date;
        username: string;
        avatar_url: string;
    }>;
}
