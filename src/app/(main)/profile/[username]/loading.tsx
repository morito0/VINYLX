import { Skeleton } from "@/components/ui/skeleton";
import { LogCardSkeleton } from "@/components/log/log-card-skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-5">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-4 w-full max-w-xs" />
          <div className="flex gap-5 pt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        {Array.from({ length: 4 }).map((_, i) => (
          <LogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
