"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-mono text-4xl font-bold tracking-tighter text-foreground">
        Error
      </h1>
      <p className="text-lg text-muted">
        Algo salió mal. Inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted"
      >
        Reintentar
      </button>
    </div>
  );
}
