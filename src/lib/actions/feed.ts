"use server";

import { getFeedLogs, FEED_PAGE_SIZE } from "@/lib/queries/feed";
import type { LogCardData } from "@/components/log/log-card";

export async function loadMoreFeedLogs(
  offset: number
): Promise<{ logs: LogCardData[]; hasMore: boolean }> {
  const logs = await getFeedLogs(FEED_PAGE_SIZE, offset);
  return {
    logs,
    hasMore: logs.length === FEED_PAGE_SIZE,
  };
}
