import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="flex max-w-lg flex-col items-center gap-8 text-center">
        <h1 className="font-mono text-5xl font-bold tracking-tighter text-foreground sm:text-7xl">
          Vinyl<span className="text-accent-orange">X</span>
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-muted">
          Curaduría manual. Reseñas cíclicas. Coleccionismo de álbumes.
          Tu historia musical, preservada.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-accent-orange px-8 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Comenzar
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:border-muted"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
