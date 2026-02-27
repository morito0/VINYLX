import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArtistDetail,
  getArtistDiscography,
} from "@/lib/musicbrainz/client";
import { AlbumSearchCard } from "@/components/album/album-search-card";
import { BackButton } from "@/components/ui/back-button";

type Props = { params: Promise<{ mbid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mbid } = await params;
  const artist = await getArtistDetail(mbid);
  if (!artist) return { title: "Artista no encontrado" };

  const title = `${artist.name} | VinylX`;
  const description = `Discografía de ${artist.name} en VinylX — El Letterboxd para la música.`;

  return {
    title: artist.name,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { mbid } = await params;

  const [artist, discography] = await Promise.all([
    getArtistDetail(mbid),
    getArtistDiscography(mbid),
  ]);

  if (!artist) notFound();

  const topTags = (artist.tags ?? [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const albums = discography.filter((rg) => rg.type === "Album");
  const eps = discography.filter((rg) => rg.type !== "Album");

  return (
    <div className="space-y-8">
      <BackButton />

      <header className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {artist.name}
          </h1>
          {artist.country && (
            <span className="font-mono text-sm text-muted">{artist.country}</span>
          )}
        </div>

        {artist.type && (
          <p className="text-sm text-muted">{artist.type}</p>
        )}

        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topTags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-medium text-muted"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Álbumes
            <span className="ml-2 text-sm font-normal text-muted">
              {albums.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {albums.map((item) => (
              <AlbumSearchCard key={item.mbid} item={item} />
            ))}
          </div>
        </section>
      )}

      {eps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            EPs y otros
            <span className="ml-2 text-sm font-normal text-muted">
              {eps.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {eps.map((item) => (
              <AlbumSearchCard key={item.mbid} item={item} />
            ))}
          </div>
        </section>
      )}

      {discography.length === 0 && (
        <p className="pt-8 text-center text-sm text-muted">
          No se encontró discografía para este artista.
        </p>
      )}
    </div>
  );
}
