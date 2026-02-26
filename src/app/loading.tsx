export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-border" />
        <div className="h-4 w-48 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}
