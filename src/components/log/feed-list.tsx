"use client";

import { useState, useTransition } from "react";
import { LogCard } from "./log-card";
import { loadMoreFeedLogs } from "@/lib/actions/feed";
import type { LogCardData } from "./log-card";

interface FeedListProps {
  initialLogs: LogCardData[];
  initialHasMore: boolean;
}

export function FeedList({ initialLogs, initialHasMore }: FeedListProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreFeedLogs(logs.length);
      setLogs((prev) => [...prev, ...result.logs]);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
      <div className="space-y-4">
        {logs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-all hover:border-muted/50 hover:text-foreground disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-accent-orange" />
                Cargando
              </span>
            ) : (
              "Cargar más reseñas"
            )}
          </button>
        </div>
      )}
    </>
  );
}
