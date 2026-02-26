import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-mono text-6xl font-bold tracking-tighter text-foreground">
        404
      </h1>
      <p className="text-lg text-muted">
        Esta página no existe.
      </p>
      <Link
        href="/"
        className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
