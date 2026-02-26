export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <div className="space-y-4">
        <div className="font-mono text-6xl font-black tracking-tighter text-foreground">
          Vinyl<span className="text-accent-orange">X</span>
        </div>
        <div className="mx-auto h-px w-16 bg-border" />
        <p className="text-lg font-medium text-muted">
          Sin conexión
        </p>
        <p className="max-w-xs text-sm text-muted/60">
          Verifica tu conexión a internet e inténtalo de nuevo.
          Tu historial musical te espera.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-20 w-48 animate-pulse rounded-xl bg-border/50" />
        <div className="h-3 w-32 animate-pulse self-center rounded bg-border/30" />
        <div className="h-2 w-24 animate-pulse self-center rounded bg-border/20" />
      </div>
    </div>
  );
}
