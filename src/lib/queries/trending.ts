import { createClient } from "@/lib/supabase/server";
import type { Album } from "@/lib/supabase/helpers";

export interface TrendingAlbum {
  album: Album;
  recentLogCount: number;
}

export async function getTrendingAlbums(
  days = 14,
  limit = 20
): Promise<TrendingAlbum[]> {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: logs } = await supabase
    .from("album_logs")
    .select("album_id")
    .gte("created_at", since.toISOString());

  if (!logs || logs.length === 0) return [];

  const countMap = new Map<string, number>();
  for (const log of logs) {
    countMap.set(log.album_id, (countMap.get(log.album_id) ?? 0) + 1);
  }

  const sorted = [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const albumIds = sorted.map(([id]) => id);

  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .in("id", albumIds)
    .returns<Album[]>();

  if (!albums) return [];

  const albumsMap = new Map(albums.map((a) => [a.id, a]));

  return sorted
    .map(([id, count]) => {
      const album = albumsMap.get(id);
      if (!album) return null;
      return { album, recentLogCount: count };
    })
    .filter((t): t is TrendingAlbum => t !== null);
}
