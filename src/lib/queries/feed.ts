import { createClient } from "@/lib/supabase/server";
import type { AlbumLog, Album, Profile, Track } from "@/lib/supabase/helpers";
import type { LogCardData } from "@/components/log/log-card";

export const FEED_PAGE_SIZE = 20;

export async function getFeedLogs(
  limit = FEED_PAGE_SIZE,
  offset = 0
): Promise<LogCardData[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logs } = await supabase
    .from("album_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
    .returns<AlbumLog[]>();

  if (!logs || logs.length === 0) return [];

  return enrichLogs(logs, user?.id ?? null);
}

export async function getUserLogs(
  userId: string,
  limit = 20
): Promise<LogCardData[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logs } = await supabase
    .from("album_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<AlbumLog[]>();

  if (!logs || logs.length === 0) return [];

  return enrichLogs(logs, user?.id ?? null);
}

async function enrichLogs(
  logs: AlbumLog[],
  currentUserId: string | null
): Promise<LogCardData[]> {
  const supabase = await createClient();

  const userIds = [...new Set(logs.map((l) => l.user_id))];
  const albumIds = [...new Set(logs.map((l) => l.album_id))];
  const logIds = logs.map((l) => l.id);
  const allTrackIds = [
    ...new Set(logs.flatMap((l) => l.trinity_tracks)),
  ];

  const [usersRes, albumsRes, tracksRes, ordinalsRes, likesRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
        .returns<Profile[]>(),
      supabase
        .from("albums")
        .select("*")
        .in("id", albumIds)
        .returns<Album[]>(),
      allTrackIds.length > 0
        ? supabase
            .from("tracks")
            .select("*")
            .in("id", allTrackIds)
            .returns<Track[]>()
        : Promise.resolve({ data: [] as Track[] }),
      supabase
        .from("album_logs")
        .select("id, user_id, album_id, created_at")
        .in("user_id", userIds)
        .in("album_id", albumIds)
        .order("created_at", { ascending: true }),
      currentUserId
        ? supabase
            .from("log_likes")
            .select("log_id")
            .eq("user_id", currentUserId)
            .in("log_id", logIds)
        : Promise.resolve({ data: [] as { log_id: string }[] }),
    ]);

  const usersMap = new Map(
    (usersRes.data ?? []).map((u) => [u.id, u])
  );
  const albumsMap = new Map(
    (albumsRes.data ?? []).map((a) => [a.id, a])
  );
  const tracksMap = new Map(
    ((tracksRes as { data: Track[] | null }).data ?? []).map((t) => [
      t.id,
      t,
    ])
  );

  const ordinalMap = new Map<string, number>();
  const pairCounters = new Map<string, number>();
  for (const row of ordinalsRes.data ?? []) {
    const key = `${row.user_id}:${row.album_id}`;
    const count = (pairCounters.get(key) ?? 0) + 1;
    pairCounters.set(key, count);
    ordinalMap.set(row.id, count);
  }

  const likedLogIds = new Set(
    ((likesRes as { data: { log_id: string }[] | null }).data ?? []).map(
      (r) => r.log_id
    )
  );

  return logs.map((log) => {
    const user = usersMap.get(log.user_id);
    const album = albumsMap.get(log.album_id);

    const trinityTrackNames = log.trinity_tracks
      .map((tid) => tracksMap.get(tid)?.title)
      .filter((n): n is string => !!n);

    return {
      id: log.id,
      rating: log.rating,
      reviewText: log.review_text,
      isPioneer: log.is_pioneer,
      listenedAt: log.listened_at,
      createdAt: log.created_at,
      listenNumber: ordinalMap.get(log.id) ?? 1,
      likesCount: log.likes_count ?? 0,
      isLiked: likedLogIds.has(log.id),
      user: user
        ? {
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
          }
        : null,
      album: album
        ? {
            musicbrainzId: album.musicbrainz_id,
            title: album.title,
            artistName: album.artist_name,
            coverUrl: album.cover_url,
          }
        : null,
      trinityTrackNames,
    };
  });
}
