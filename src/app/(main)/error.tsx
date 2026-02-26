"use client";

import { useEffect } from "react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MainLayout Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-6 pt-20 text-center">
      <div className="space-y-2">
        <h1 className="font-mono text-4xl font-bold tracking-tighter text-foreground">
          Error
        </h1>
        <p className="text-lg text-muted">
          Algo salió mal al cargar esta página.
        </p>
      </div>

      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-full overflow-x-auto rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-4 text-left text-xs text-red-400">
          {error.message}
          {error.stack && (
            <>
              {"\n\n"}
              {error.stack}
            </>
          )}
        </pre>
      )}

      <button
        onClick={reset}
        className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted"
      >
        Reintentar
      </button>
    </div>
  );
}
