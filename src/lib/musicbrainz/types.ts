export interface MBArtistCredit {
  artist: {
    id: string;
    name: string;
    "sort-name": string;
  };
  joinphrase?: string;
}

export interface MBReleaseGroup {
  id: string;
  title: string;
  score?: number;
  "primary-type"?: string;
  "secondary-types"?: string[];
  "first-release-date"?: string;
  "artist-credit": MBArtistCredit[];
  releases?: MBRelease[];
}

export interface MBRelease {
  id: string;
  title: string;
  status?: string;
  date?: string;
  country?: string;
  media?: MBMedia[];
}

export interface MBMedia {
  position: number;
  "track-count": number;
  format?: string;
  tracks?: MBTrack[];
}

export interface MBTrack {
  id: string;
  number: string;
  title: string;
  length: number | null;
  recording: {
    id: string;
    title: string;
    length: number | null;
  };
}

export interface MBReleaseGroupSearchResult {
  "release-groups": MBReleaseGroup[];
  "release-group-count": number;
  "release-group-offset": number;
}

export interface SearchResultItem {
  mbid: string;
  title: string;
  artistName: string;
  artistMbid: string | null;
  releaseDate: string | null;
  type: string | null;
  coverUrl: string | null;
  score: number;
}

export interface MBUrlRelation {
  type: string;
  "target-type": string;
  url: {
    id: string;
    resource: string;
  };
}

export interface MBReleaseWithRels extends MBRelease {
  relations?: MBUrlRelation[];
}

export interface MBArtistDetail {
  id: string;
  name: string;
  "sort-name": string;
  type?: string;
  country?: string;
  "life-span"?: {
    begin: string | null;
    end: string | null;
    ended: boolean;
  };
  aliases?: { name: string; type: string | null }[];
  tags?: { count: number; name: string }[];
}

export interface MBReleaseGroupBrowse {
  "release-groups": MBReleaseGroup[];
  "release-group-count": number;
  "release-group-offset": number;
}

export interface AlbumDetail {
  mbid: string;
  releaseId: string;
  title: string;
  artistName: string;
  artistMbid: string | null;
  releaseDate: string | null;
  coverUrl: string | null;
  tracks: {
    mbTrackId: string;
    title: string;
    trackNumber: number;
    durationMs: number | null;
  }[];
}
