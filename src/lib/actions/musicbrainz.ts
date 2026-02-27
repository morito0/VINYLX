"use server";

import {
  searchReleaseGroups,
  getReleaseGroupDetail,
  getArtistMbidFromReleaseGroup,
} from "@/lib/musicbrainz/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { hydrateStreamingLinks } from "@/lib/odesli/hydrate";
import type { SearchResultItem } from "@/lib/musicbrainz/types";
import type { Album, Track } from "@/lib/supabase/helpers";

export async function searchAlbumsFromMusicBrainz(
  query: string
): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];
  return searchReleaseGroups(query.trim());
}

export type AlbumResult = {
  album: Album;
  tracks: Track[];
  artistMbid: string | null;
};

export async function ensureAlbumInDatabase(
  mbid: string
): Promise<AlbumResult | null> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("albums")
    .select("*")
    .eq("musicbrainz_id", mbid)
    .single()
    .returns<Album>();

  if (existing) {
    const [{ data: tracks }, artistMbid] = await Promise.all([
      supabase
        .from("tracks")
        .select("*")
        .eq("album_id", existing.id)
        .order("track_number", { ascending: true })
        .returns<Track[]>(),
      getArtistMbidFromReleaseGroup(mbid),
    ]);

    if (
      !existing.streaming_links ||
      Object.keys(existing.streaming_links as Record<string, unknown>).length === 0
    ) {
      const detail = await getReleaseGroupDetail(mbid);
      if (detail) {
        hydrateStreamingLinks(existing.id, detail.releaseId).catch(() => {});
      }
    }

    return { album: existing, tracks: tracks ?? [], artistMbid };
  }

  const detail = await getReleaseGroupDetail(mbid);
  if (!detail) {
    console.error("[ensureAlbumInDatabase] MusicBrainz returned null for mbid:", mbid);
    return null;
  }

  const { data: album, error: albumError } = await supabase
    .from("albums")
    .upsert(
      {
        musicbrainz_id: detail.mbid,
        title: detail.title,
        artist_name: detail.artistName,
        release_date: detail.releaseDate,
        cover_url: detail.coverUrl,
      },
      { onConflict: "musicbrainz_id" }
    )
    .select("*")
    .single()
    .returns<Album>();

  if (albumError || !album) {
    console.error("[ensureAlbumInDatabase] Upsert failed:", albumError?.message);
    return null;
  }

  if (detail.tracks.length > 0) {
    const trackRows = detail.tracks.map((t) => ({
      album_id: album.id,
      musicbrainz_track_id: t.mbTrackId,
      title: t.title,
      track_number: t.trackNumber,
      duration_ms: t.durationMs,
    }));

    const { error: trackError } = await supabase
      .from("tracks")
      .upsert(trackRows, { onConflict: "musicbrainz_track_id" });

    if (trackError) {
      console.error("[ensureAlbumInDatabase] Track upsert failed:", trackError.message);
    }
  }

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("album_id", album.id)
    .order("track_number", { ascending: true })
    .returns<Track[]>();

  hydrateStreamingLinks(album.id, detail.releaseId).catch(() => {});

  return { album, tracks: tracks ?? [], artistMbid: detail.artistMbid };
}
