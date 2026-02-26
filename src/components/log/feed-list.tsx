"use client";

import { useState, useTransition } from "react";
import { LogCard } from "./log-card";
import { LogCardSkeleton } from "./log-card-skeleton";
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

      {isPending && (
        <div className="space-y-4 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <LogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {hasMore && !isPending && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-all active:scale-95 hover:border-muted/50 hover:text-foreground"
          >
            Cargar más reseñas
          </button>
        </div>
      )}
    </>
  );
}
