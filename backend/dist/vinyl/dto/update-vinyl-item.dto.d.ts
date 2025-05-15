import { CreateVinylItemDto, CollectionItemStatusDto } from './create-vinyl-item.dto';
declare const UpdateVinylItemDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateVinylItemDto>>;
export declare class UpdateVinylItemDto extends UpdateVinylItemDto_base {
    status?: CollectionItemStatusDto;
    folder?: string;
}
export {};
