import Link from "next/link";
import { getTrendingAlbums } from "@/lib/queries/trending";
import { AlbumCover } from "@/components/album/album-cover";

export const metadata = { title: "Trending" };

export default async function TrendingPage() {
  const trending = await getTrendingAlbums();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Trending</h1>
        <p className="text-sm text-muted">
          Lo más escuchado en los últimos 14 días
        </p>
      </div>

      {trending.length === 0 ? (
        <div className="flex flex-col items-center gap-4 pt-12 text-center">
          <p className="text-sm text-muted">
            No hay suficientes datos todavía. Sé el primero en registrar escuchas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trending.map(({ album, recentLogCount }, i) => (
            <Link
              key={album.id}
              href={`/album/${album.musicbrainz_id}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-muted/50 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="relative aspect-square overflow-hidden">
                <AlbumCover
                  src={album.cover_url}
                  alt={album.title}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 font-mono text-5xl font-black leading-none text-white/10 sm:text-6xl">
                  {i + 1}
                </span>
              </div>
              <div className="space-y-0.5 p-3">
                <p className="truncate text-sm font-semibold leading-tight">
                  {album.title}
                </p>
                <p className="truncate text-xs text-muted">
                  {album.artist_name}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {album.log_count > 0 && (
                    <span className="font-mono text-xs font-bold text-accent-orange">
                      {Number(album.avg_rating).toFixed(1)}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-muted/50">
                    {recentLogCount} {recentLogCount === 1 ? "log" : "logs"} recientes
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
