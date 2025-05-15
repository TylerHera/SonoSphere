export interface LastFmImage {
    size: string;
    '#text': string;
}
export interface LastFmArtistStats {
    name: string;
    playcount: string;
    mbid?: string;
    url: string;
    image?: LastFmImage[];
}
export interface TopArtistsResponseDto {
    artists: LastFmArtistStats[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
export interface LastFmTrackStats {
    name: string;
    playcount: string;
    mbid?: string;
    url: string;
    artist: {
        name: string;
        mbid?: string;
        url: string;
    };
    image?: LastFmImage[];
}
export interface TopTracksResponseDto {
    tracks: LastFmTrackStats[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
export interface LastFmAlbumStats {
    name: string;
    playcount: string;
    mbid?: string;
    url: string;
    artist: {
        name: string;
        mbid?: string;
        url: string;
    };
    image?: LastFmImage[];
}
export interface TopAlbumsResponseDto {
    albums: LastFmAlbumStats[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
export interface LastFmWeeklyTrack {
    name: string;
    artist: {
        '#text': string;
        mbid?: string;
    };
    mbid?: string;
    playcount: string;
    url: string;
    image?: LastFmImage[];
    '@attr': {
        rank: string;
    };
}
export interface WeeklyTrackChartResponseDto {
    tracks: LastFmWeeklyTrack[];
    from: string;
    to: string;
}
export interface LastFmWeeklyArtist {
    name: string;
    mbid?: string;
    playcount: string;
    url: string;
    image?: LastFmImage[];
    '@attr': {
        rank: string;
    };
}
export interface WeeklyArtistChartResponseDto {
    artists: LastFmWeeklyArtist[];
    from: string;
    to: string;
}
export interface LastFmWeeklyAlbum {
    name: string;
    artist: {
        '#text': string;
        mbid?: string;
    };
    mbid?: string;
    playcount: string;
    url: string;
    image?: LastFmImage[];
    '@attr': {
        rank: string;
    };
}
export interface WeeklyAlbumChartResponseDto {
    albums: LastFmWeeklyAlbum[];
    from: string;
    to: string;
}
