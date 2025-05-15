export declare enum CollectionItemStatusDto {
    OWNED = "OWNED",
    WISHLIST = "WISHLIST"
}
export declare class CreateVinylItemDto {
    discogs_id?: number;
    title: string;
    artist_main: string;
    artists_extra?: any;
    release_title?: string;
    year?: number;
    formats?: any;
    labels?: any;
    genres?: string[];
    styles?: string[];
    cover_url_small?: string;
    cover_url_large?: string;
    notes?: string;
    custom_tags?: string[];
    status?: CollectionItemStatusDto;
    folder?: string;
}
