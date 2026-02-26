import { createClient } from "@/lib/supabase/server";

interface GrowerCurveProps {
  albumId: string;
  userId: string;
}

interface LogPoint {
  rating: number;
  listened_at: string;
}

export async function GrowerCurve({ albumId, userId }: GrowerCurveProps) {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("album_logs")
    .select("rating, listened_at")
    .eq("album_id", albumId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .returns<LogPoint[]>();

  if (!logs || logs.length < 2) return null;

  const W = 280;
  const H = 64;
  const PAD_X = 16;
  const PAD_Y = 8;
  const plotW = W - PAD_X * 2;
  const plotH = H - PAD_Y * 2;

  const points = logs.map((log, i) => {
    const x = PAD_X + (logs.length > 1 ? (i / (logs.length - 1)) * plotW : plotW / 2);
    const y = PAD_Y + plotH - ((log.rating - 1) / 9) * plotH;
    return { x, y, rating: log.rating, date: log.listened_at };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.rating - first.rating;
  const deltaColor =
    delta > 0 ? "text-accent-emerald" : delta < 0 ? "text-red-400" : "text-muted";

  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Tu curva
        </h2>
        <span className={`font-mono text-xs font-bold ${deltaColor}`}>
          {first.rating} → {last.rating}
          {delta !== 0 && (
            <span className="ml-1 text-[10px] opacity-70">
              ({delta > 0 ? "+" : ""}
              {delta})
            </span>
          )}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ maxWidth: W }}
          aria-label={`Evolución de calificación: ${logs.map((l) => l.rating).join(" → ")}`}
        >
          <polyline
            points={polyline}
            fill="none"
            stroke="var(--accent-orange)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="var(--background)"
                stroke="var(--accent-orange)"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight="bold"
              >
                {p.rating}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-2 flex justify-between text-[10px] text-muted/50">
          {points.map((p, i) => (
            <span key={i} className="font-mono">
              {new Date(p.date).toLocaleDateString("es", {
                month: "short",
                year: "2-digit",
              })}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
