import type { Track } from "@/lib/supabase/helpers";

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AlbumTracklist({ tracks }: { tracks: Track[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Tracklist</h2>
      <div className="divide-y divide-border/50 rounded-xl border border-border bg-card">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 px-4 py-3 text-sm"
          >
            <span className="w-6 text-right font-mono text-xs text-muted/60">
              {track.track_number}
            </span>
            <span className="flex-1 truncate">{track.title}</span>
            {track.duration_ms && (
              <span className="font-mono text-xs text-muted/60">
                {formatDuration(track.duration_ms)}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
