import type {
  MBReleaseGroupSearchResult,
  MBReleaseGroup,
  MBRelease,
  MBReleaseWithRels,
  MBArtistDetail,
  MBReleaseGroupBrowse,
  SearchResultItem,
  AlbumDetail,
} from "./types";

const BASE_URL = "https://musicbrainz.org/ws/2";
const COVER_ART_URL = "https://coverartarchive.org";
const USER_AGENT = "VinylX/1.0.0 (https://github.com/vinylx)";
const RATE_LIMIT_MS = 1100;

let lastRequestTime = 0;

async function rateLimitedFetch(
  url: string,
  noCache = false
): Promise<Response> {
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastRequestTime);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequestTime = Date.now();

  return fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    ...(noCache
      ? { cache: "no-store" as const }
      : { next: { revalidate: 86400 } }),
  });
}

function buildArtistName(credits: MBReleaseGroup["artist-credit"]): string {
  return credits.map((c) => c.artist.name + (c.joinphrase ?? "")).join("");
}

function coverArtUrl(rgId: string): string {
  return `${COVER_ART_URL}/release-group/${rgId}/front-250`;
}

export async function searchReleaseGroups(
  query: string,
  limit = 12,
  noCache = false
): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];

  const lucene = `${query.trim()} AND primarytype:album AND status:official`;
  const url = `${BASE_URL}/release-group/?query=${encodeURIComponent(lucene)}&limit=${limit}&fmt=json`;

  try {
    const res = await rateLimitedFetch(url, noCache);
    if (!res.ok) return [];
    const data: MBReleaseGroupSearchResult = await res.json();

    return data["release-groups"]
      .filter((rg) => rg.id && rg.title)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((rg) => ({
        mbid: rg.id,
        title: rg.title,
        artistName: buildArtistName(rg["artist-credit"]),
        artistMbid: rg["artist-credit"]?.[0]?.artist?.id ?? null,
        releaseDate: rg["first-release-date"] || null,
        type: rg["primary-type"] || null,
        coverUrl: coverArtUrl(rg.id),
        score: rg.score ?? 0,
      }));
  } catch (err) {
    console.error("[MusicBrainz] searchReleaseGroups failed:", err);
    return [];
  }
}

export async function getReleaseGroupDetail(
  rgId: string
): Promise<AlbumDetail | null> {
  try {
    const rgUrl = `${BASE_URL}/release-group/${rgId}?inc=artist-credits+releases&fmt=json`;
    const rgRes = await rateLimitedFetch(rgUrl);
    if (!rgRes.ok) return null;
    const rg: MBReleaseGroup = await rgRes.json();

    const officialRelease =
      rg.releases?.find((r) => r.status === "Official") ?? rg.releases?.[0];
    if (!officialRelease) return null;

    const relUrl = `${BASE_URL}/release/${officialRelease.id}?inc=recordings&fmt=json`;
    const relRes = await rateLimitedFetch(relUrl);
    if (!relRes.ok) return null;
    const release: MBRelease = await relRes.json();

    const tracks =
      release.media
        ?.flatMap((m) =>
          (m.tracks ?? []).map((t, idx) => ({
            mbTrackId: t.recording.id,
            title: t.recording.title,
            trackNumber: idx + 1,
            durationMs: t.recording.length ?? t.length ?? null,
          }))
        ) ?? [];

    return {
      mbid: rg.id,
      releaseId: officialRelease.id,
      title: rg.title,
      artistName: buildArtistName(rg["artist-credit"]),
      artistMbid: rg["artist-credit"]?.[0]?.artist?.id ?? null,
      releaseDate: rg["first-release-date"] || null,
      coverUrl: coverArtUrl(rg.id),
      tracks,
    };
  } catch (err) {
    console.error("[MusicBrainz] getReleaseGroupDetail failed for", rgId, ":", err);
    return null;
  }
}

export async function getArtistMbidFromReleaseGroup(
  rgId: string
): Promise<string | null> {
  try {
    const url = `${BASE_URL}/release-group/${rgId}?inc=artist-credits&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const rg: MBReleaseGroup = await res.json();
    return rg["artist-credit"]?.[0]?.artist?.id ?? null;
  } catch {
    return null;
  }
}

export async function getArtistDetail(
  artistId: string
): Promise<MBArtistDetail | null> {
  try {
    const url = `${BASE_URL}/artist/${artistId}?inc=aliases+tags&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    return (await res.json()) as MBArtistDetail;
  } catch (err) {
    console.error("[MusicBrainz] getArtistDetail failed:", err);
    return null;
  }
}

export async function getArtistDiscography(
  artistId: string,
  limit = 50
): Promise<SearchResultItem[]> {
  try {
    const url = `${BASE_URL}/release-group?artist=${artistId}&type=album|ep&limit=${limit}&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return [];
    const data: MBReleaseGroupBrowse = await res.json();

    return data["release-groups"]
      .filter((rg) => rg.id && rg.title)
      .sort((a, b) => {
        const dateA = a["first-release-date"] ?? "";
        const dateB = b["first-release-date"] ?? "";
        return dateB.localeCompare(dateA);
      })
      .map((rg) => ({
        mbid: rg.id,
        title: rg.title,
        artistName: buildArtistName(rg["artist-credit"]),
        artistMbid: rg["artist-credit"]?.[0]?.artist?.id ?? null,
        releaseDate: rg["first-release-date"] || null,
        type: rg["primary-type"] || rg["secondary-types"]?.[0] || null,
        coverUrl: coverArtUrl(rg.id),
        score: rg.score ?? 0,
      }));
  } catch (err) {
    console.error("[MusicBrainz] getArtistDiscography failed:", err);
    return [];
  }
}

// ── Lightweight lookup (single release-group by mbid) ────────────────────

export async function lookupReleaseGroupBasic(mbid: string): Promise<{
  mbid: string;
  title: string;
  artistName: string;
  artistMbid: string | null;
  releaseDate: string | null;
  type: string | null;
} | null> {
  try {
    const url = `${BASE_URL}/release-group/${mbid}?inc=artist-credits&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const rg: MBReleaseGroup = await res.json();
    return {
      mbid: rg.id,
      title: rg.title,
      artistName: buildArtistName(rg["artist-credit"]),
      artistMbid: rg["artist-credit"]?.[0]?.artist?.id ?? null,
      releaseDate: rg["first-release-date"] || null,
      type: rg["primary-type"] || null,
    };
  } catch {
    return null;
  }
}

// ── Targeted Lucene search (artist + title exact match) ──────────────────

export async function searchReleaseGroupTargeted(
  artist: string,
  title: string
): Promise<{
  mbid: string;
  title: string;
  artistName: string;
  artistMbid: string | null;
  releaseDate: string | null;
  type: string | null;
} | null> {
  try {
    const safeArtist = artist.replace(/["\\]/g, "\\$&");
    const safeTitle = title.replace(/["\\]/g, "\\$&");
    const lucene = `artist:"${safeArtist}" AND releasegroup:"${safeTitle}"`;
    const url = `${BASE_URL}/release-group/?query=${encodeURIComponent(lucene)}&limit=1&fmt=json`;

    const res = await rateLimitedFetch(url, true);
    if (!res.ok) return null;

    const data: MBReleaseGroupSearchResult = await res.json();
    const rg = data["release-groups"]?.[0];
    if (!rg) return null;

    return {
      mbid: rg.id,
      title: rg.title,
      artistName: buildArtistName(rg["artist-credit"]),
      artistMbid: rg["artist-credit"]?.[0]?.artist?.id ?? null,
      releaseDate: rg["first-release-date"] || null,
      type: rg["primary-type"] || null,
    };
  } catch {
    return null;
  }
}

const STREAMING_REL_TYPES = [
  "streaming",
  "free streaming",
  "download for free",
  "purchase for download",
];

export async function getStreamingUrlFromRelease(
  releaseId: string
): Promise<string | null> {
  try {
    const url = `${BASE_URL}/release/${releaseId}?inc=url-rels&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const data: MBReleaseWithRels = await res.json();

    const streamingRel = data.relations?.find(
      (r) =>
        STREAMING_REL_TYPES.includes(r.type) &&
        r.url?.resource
    );

    return streamingRel?.url?.resource ?? null;
  } catch {
    console.warn("[MB] Streaming URL hydration skipped for release", releaseId);
    return null;
  }
}
