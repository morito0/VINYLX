import { createClient } from "@/lib/supabase/server";

interface RatingHistogramProps {
  albumId: string;
}

export async function RatingHistogram({ albumId }: RatingHistogramProps) {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("album_logs")
    .select("rating")
    .eq("album_id", albumId);

  if (!logs || logs.length === 0) return null;

  const counts = new Array(10).fill(0);
  for (const log of logs) {
    counts[log.rating - 1]++;
  }

  const maxCount = Math.max(...counts);
  const total = logs.length;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Distribución
      </h2>
      <div className="flex items-end gap-1.5" style={{ height: 80 }}>
        {counts.map((count, i) => {
          const rating = i + 1;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const isMax = count === maxCount && count > 0;

          return (
            <div key={rating} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative w-full" style={{ height: 60 }}>
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-sm transition-all ${
                    isMax ? "bg-accent-orange" : "bg-slate-800"
                  }`}
                  style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                  title={`${rating}/10: ${count} ${count === 1 ? "log" : "logs"} (${total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)`}
                />
              </div>
              <span
                className={`font-mono text-[10px] leading-none ${
                  isMax ? "font-bold text-accent-orange" : "text-muted/50"
                }`}
              >
                {rating}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
