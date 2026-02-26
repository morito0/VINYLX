import { Skeleton } from "@/components/ui/skeleton";
import { LogCardSkeleton } from "@/components/log/log-card-skeleton";

export default function FeedLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-24" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
