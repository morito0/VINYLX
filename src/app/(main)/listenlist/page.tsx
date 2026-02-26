import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlbumCover } from "@/components/album/album-cover";
import type { Listenlist, Album } from "@/lib/supabase/helpers";

export const metadata = { title: "Listenlist" };

export default async function ListenlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("listenlists")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })
    .returns<Listenlist[]>();

  const albumIds = (items ?? []).map((i) => i.album_id);

  let albumsMap = new Map<string, Album>();
  if (albumIds.length > 0) {
    const { data: albums } = await supabase
      .from("albums")
      .select("*")
      .in("id", albumIds)
      .returns<Album[]>();

    albumsMap = new Map((albums ?? []).map((a) => [a.id, a]));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Mi Listenlist</h1>
        <span className="font-mono text-sm text-muted">{albumIds.length}</span>
      </div>

      {albumIds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 pt-12 text-center">
          <p className="text-sm text-muted">
            Tu lista de escucha está vacía. Explora y guarda álbumes para escuchar después.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {(items ?? []).map((item) => {
            const album = albumsMap.get(item.album_id);
            if (!album) return null;
            return (
              <Link
                key={item.id}
                href={`/album/${album.musicbrainz_id}`}
                className="group space-y-2"
              >
                <AlbumCover
                  src={album.cover_url}
                  alt={album.title}
                  className="aspect-square w-full transition-transform group-hover:scale-[1.03]"
                />
                <div className="space-y-0.5 px-0.5">
                  <p className="truncate text-xs font-semibold leading-tight">
                    {album.title}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {album.artist_name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
