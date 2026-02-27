"use server";

import {
  searchReleaseGroups,
  lookupReleaseGroupBasic,
  searchReleaseGroupTargeted,
} from "@/lib/musicbrainz/client";
import type { SearchResultItem } from "@/lib/musicbrainz/types";

const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0";
const COVER_ART_URL = "https://coverartarchive.org";

interface LastFmAlbum {
  name: string;
  artist: string;
  mbid: string;
  image?: { "#text": string; size: string }[];
}

interface LastFmSearchResponse {
  results?: {
    albummatches?: {
      album?: LastFmAlbum[];
    };
  };
}

function coverArtUrl(rgId: string): string {
  return `${COVER_ART_URL}/release-group/${rgId}/front-250`;
}

// ── Phase 1: Last.fm as Single Source of Truth for ordering ──────────────

async function fetchLastFm(query: string): Promise<LastFmAlbum[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) throw new Error("LASTFM_API_KEY not configured");

  const url = `${LASTFM_BASE}/?method=album.search&album=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=15`;

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error(`Last.fm ${res.status}`);

  const data: LastFmSearchResponse = await res.json();
  const albums = data?.results?.albummatches?.album;
  if (!Array.isArray(albums)) return [];
  return albums.filter((a) => a.name?.trim());
}

// ── Phase 2: Targeted hydration per item ─────────────────────────────────

async function hydrateItem(
  item: LastFmAlbum
): Promise<SearchResultItem | null> {
  type RGBasic = {
    mbid: string;
    title: string;
    artistName: string;
    artistMbid: string | null;
    releaseDate: string | null;
    type: string | null;
  };

  let resolved: RGBasic | null = null;

  if (item.mbid?.length > 0) {
    resolved = await lookupReleaseGroupBasic(item.mbid);
  }

  if (!resolved) {
    resolved = await searchReleaseGroupTargeted(item.artist, item.name);
  }

  if (!resolved) return null;

  return {
    mbid: resolved.mbid,
    title: resolved.title,
    artistName: resolved.artistName,
    artistMbid: resolved.artistMbid,
    releaseDate: resolved.releaseDate,
    type: resolved.type,
    coverUrl: coverArtUrl(resolved.mbid),
    score: 0,
  };
}

// ── Exported action ──────────────────────────────────────────────────────

export async function searchAlbums(
  query: string
): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  // Phase 1: Last.fm dictates the order
  let lfResults: LastFmAlbum[];

  try {
    lfResults = await fetchLastFm(trimmed);
  } catch (err) {
    console.warn("[Search] Last.fm unavailable, full MB fallback:", err);
    return searchReleaseGroups(trimmed, 12, true);
  }

  if (lfResults.length === 0) {
    return searchReleaseGroups(trimmed, 12, true);
  }

  console.log(
    `[Search] Phase 1 — LF ${lfResults.length} hits`,
    `| #1: "${lfResults[0].name}" by ${lfResults[0].artist}`,
    `(mbid: ${lfResults[0].mbid || "∅"})`
  );

  // Phase 2: Sequential hydration — respects MB 1req/s via promise chain
  let chain = Promise.resolve<void>(undefined);

  const hydrationPromises = lfResults.map((item) => {
    const p: Promise<SearchResultItem | null> = chain.then(() =>
      hydrateItem(item)
    );
    chain = p.then(
      () => {},
      () => {}
    );
    return p;
  });

  const settled = await Promise.allSettled(hydrationPromises);

  // Phase 3: Assemble final array — Last.fm index is law, no .sort()
  const seen = new Set<string>();
  const results: SearchResultItem[] = [];

  for (let i = 0; i < settled.length; i++) {
    const s = settled[i];
    if (s.status !== "fulfilled" || !s.value) continue;

    const item = s.value;
    if (seen.has(item.mbid)) continue;
    seen.add(item.mbid);

    results.push({ ...item, score: 100 - i });
  }

  console.log(
    `[Search] Phase 3 — ${results.length}/${lfResults.length} survived`,
    results[0]
      ? `| #1: "${results[0].title}" by ${results[0].artistName}`
      : ""
  );

  return results;
}
