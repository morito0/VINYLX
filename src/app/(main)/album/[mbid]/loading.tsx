import { Skeleton } from "@/components/ui/skeleton";

export default function AlbumLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Skeleton className="h-56 w-56 shrink-0 self-center rounded-xl shadow-2xl shadow-black/40 sm:self-auto" />
        <div className="space-y-3 self-center sm:self-auto">
          <Skeleton className="mx-auto h-9 w-64 sm:mx-0" />
          <Skeleton className="mx-auto h-5 w-40 sm:mx-0" />
          <Skeleton className="mx-auto h-5 w-24 sm:mx-0" />
          <div className="flex justify-center gap-2 sm:justify-start">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Action bar skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Tracklist skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <div className="divide-y divide-border/50 rounded-xl border border-border bg-card">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
