import Link from "next/link";
import { getFeedLogs, FEED_PAGE_SIZE } from "@/lib/queries/feed";
import { FeedList } from "@/components/log/feed-list";

export const metadata = { title: "Feed" };

export default async function FeedPage() {
  const logs = await getFeedLogs();
  const hasMore = logs.length === FEED_PAGE_SIZE;

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 pt-20 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            Tu feed está vacío
          </p>
          <p className="max-w-xs text-sm text-muted">
            Explora álbumes y registra tu primera escucha para iniciar tu historia musical.
          </p>
        </div>
        <Link
          href="/explore"
          className="rounded-full bg-accent-orange px-6 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Explorar álbumes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
      <FeedList initialLogs={logs} initialHasMore={hasMore} />
    </div>
  );
}
