import type {
  MBReleaseGroupSearchResult,
  MBReleaseGroup,
  MBRelease,
  MBReleaseWithRels,
  SearchResultItem,
  AlbumDetail,
} from "./types";

const BASE_URL = "https://musicbrainz.org/ws/2";
const COVER_ART_URL = "https://coverartarchive.org";
const USER_AGENT = "VinylX/1.0.0 (https://github.com/vinylx)";
const RATE_LIMIT_MS = 1100;

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
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
    next: { revalidate: 86400 },
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
  limit = 12
): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];

  const lucene = `${query.trim()} AND primarytype:album AND status:official`;
  const url = `${BASE_URL}/release-group/?query=${encodeURIComponent(lucene)}&limit=${limit}&fmt=json`;

  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return [];
    const data: MBReleaseGroupSearchResult = await res.json();

    return data["release-groups"].map((rg) => ({
      mbid: rg.id,
      title: rg.title,
      artistName: buildArtistName(rg["artist-credit"]),
      releaseDate: rg["first-release-date"] || null,
      type: rg["primary-type"] || null,
      coverUrl: coverArtUrl(rg.id),
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
      releaseDate: rg["first-release-date"] || null,
      coverUrl: coverArtUrl(rg.id),
      tracks,
    };
  } catch (err) {
    console.error("[MusicBrainz] getReleaseGroupDetail failed for", rgId, ":", err);
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
