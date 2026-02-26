import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Music } from "lucide-react";
import { LikeButton } from "./like-button";

export interface LogCardData {
  id: string;
  rating: number;
  reviewText: string | null;
  isPioneer: boolean;
  listenedAt: string;
  createdAt: string;
  listenNumber: number;
  likesCount: number;
  isLiked: boolean;
  user: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  album: {
    musicbrainzId: string;
    title: string;
    artistName: string;
    coverUrl: string | null;
  } | null;
  trinityTrackNames: string[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mes`;
}

export function LogCard({ log }: { log: LogCardData }) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:shadow-black/20",
        log.isPioneer
          ? "border-accent-emerald/30 shadow-accent-emerald/5"
          : "border-border hover:border-muted/50"
      )}
    >
      {log.isPioneer && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-emerald to-transparent" />
      )}

      <div className="flex gap-4 p-4 sm:p-5">
        <Link
          href={log.album ? `/album/${log.album.musicbrainzId}` : "#"}
          className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-border shadow-md shadow-black/30 transition-transform group-hover:scale-[1.02] sm:h-28 sm:w-28"
        >
          {log.album?.coverUrl ? (
            <img
              src={log.album.coverUrl}
              alt={log.album.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card">
              <Music className="h-8 w-8 text-border" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {log.user && (
                <Link
                  href={`/profile/${log.user.username}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  @{log.user.username}
                </Link>
              )}
              <span className="ml-2 text-xs text-muted/60">
                {timeAgo(log.createdAt)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {log.listenNumber > 1 && (
                <span className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted">
                  #{log.listenNumber}
                </span>
              )}
              <span className="font-mono text-lg font-bold leading-none text-accent-orange">
                {log.rating}
              </span>
              <span className="font-mono text-xs text-muted/40">/10</span>
            </div>
          </div>

          {log.album && (
            <div>
              <Link
                href={`/album/${log.album.musicbrainzId}`}
                className="block truncate text-sm font-semibold leading-tight hover:underline"
              >
                {log.album.title}
              </Link>
              <p className="truncate text-xs text-muted">
                {log.album.artistName}
              </p>
            </div>
          )}

          {log.isPioneer && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-2 py-0.5 text-xs font-semibold text-accent-emerald">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-emerald" />
              Pionero
            </span>
          )}

          {log.reviewText && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted">
              {log.reviewText}
            </p>
          )}

          <div className="flex items-center justify-between pt-0.5">
            {log.trinityTrackNames.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {log.trinityTrackNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted"
                  >
                    <span className="font-mono text-[10px] font-bold text-accent-emerald">
                      {i + 1}
                    </span>
                    <span className="max-w-[120px] truncate">{name}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div />
            )}
            <LikeButton
              logId={log.id}
              initialLikesCount={log.likesCount}
              initialIsLiked={log.isLiked}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
