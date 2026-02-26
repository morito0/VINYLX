import { Skeleton } from "@/components/ui/skeleton";

export default function ListenlistLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-8" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-1 px-0.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
