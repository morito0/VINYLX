import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureAlbumInDatabase } from "@/lib/actions/musicbrainz";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCover } from "@/components/album/album-cover";
import { AlbumTracklist } from "@/components/album/album-tracklist";
import { AlbumActions } from "@/components/album/album-actions";
import { StreamingLinks } from "@/components/album/streaming-links";
import { RatingHistogram } from "@/components/album/rating-histogram";
import { GrowerCurve } from "@/components/album/grower-curve";

type Props = { params: Promise<{ mbid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mbid } = await params;
  const result = await ensureAlbumInDatabase(mbid);
  if (!result) return { title: "Álbum no encontrado" };

  const { album } = result;
  const title = `${album.title} — ${album.artist_name} | VinylX`;
  const description = album.log_count > 0
    ? `Escucha y reseña ${album.title} de ${album.artist_name} en VinylX. ${album.log_count} logs · Promedio ${Number(album.avg_rating).toFixed(1)}/10.`
    : `Descubre ${album.title} de ${album.artist_name} en VinylX — El Letterboxd para la música.`;

  return {
    title: `${album.title} — ${album.artist_name}`,
    description,
    openGraph: {
      title,
      description,
      type: "music.album",
      ...(album.cover_url && {
        images: [
          { url: album.cover_url, width: 500, height: 500, alt: album.title },
        ],
      }),
    },
    twitter: {
      card: album.cover_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(album.cover_url && { images: [album.cover_url] }),
    },
  };
}

function HistogramSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function CurveSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default async function AlbumPage({ params }: Props) {
  const { mbid } = await params;
  const supabase = await createClient();

  const [result, authResult] = await Promise.all([
    ensureAlbumInDatabase(mbid),
    supabase.auth.getUser(),
  ]);

  if (!result) notFound();

  const { album, tracks, artistMbid } = result;
  const user = authResult.data.user;
  const year = album.release_date?.split("-")[0];

  let initialSaved = false;
  if (user) {
    const { data } = await supabase
      .from("listenlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("album_id", album.id)
      .maybeSingle();
    initialSaved = !!data;
  }

  const odesliData = (album.streaming_links as Record<string, string> | null) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <AlbumCover
          src={album.cover_url}
          alt={album.title}
          className="h-56 w-56 shrink-0 self-center sm:self-auto"
        />
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">{album.title}</h1>
          {artistMbid ? (
            <Link
              href={`/artist/${artistMbid}`}
              className="text-lg text-gray-300 transition-colors hover:text-foreground hover:underline"
            >
              {album.artist_name}
            </Link>
          ) : (
            <p className="text-lg text-muted">{album.artist_name}</p>
          )}
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            {album.log_count > 0 && (
              <>
                <span className="font-mono text-lg font-bold text-accent-orange">
                  {Number(album.avg_rating).toFixed(1)}
                </span>
                <span className="text-sm text-muted">
                  {album.log_count} {album.log_count === 1 ? "log" : "logs"}
                </span>
              </>
            )}
            {year && (
              <span className="font-mono text-sm text-muted/60">{year}</span>
            )}
          </div>
          {album.genres && album.genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {album.genres.map((genre) => (
                <Badge key={genre} variant="muted">{genre}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlbumActions
        albumId={album.id}
        mbid={mbid}
        initialSaved={initialSaved}
        isAuthenticated={!!user}
      />

      <StreamingLinks data={odesliData} />

      {album.log_count > 0 && (
        <Suspense fallback={<HistogramSkeleton />}>
          <RatingHistogram albumId={album.id} />
        </Suspense>
      )}

      {user && (
        <Suspense fallback={<CurveSkeleton />}>
          <GrowerCurve albumId={album.id} userId={user.id} />
        </Suspense>
      )}

      {tracks.length > 0 && <AlbumTracklist tracks={tracks} />}
    </div>
  );
}
