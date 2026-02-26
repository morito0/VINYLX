import { Skeleton } from "@/components/ui/skeleton";

export function LogCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex gap-4">
        <Skeleton className="h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-18 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
