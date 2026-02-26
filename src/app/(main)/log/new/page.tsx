import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Album, Track } from "@/lib/supabase/helpers";
import { LogFormWrapper } from "@/components/log/log-form-wrapper";

export const metadata = { title: "Nuevo Log" };

type Props = {
  searchParams: Promise<{ album?: string; mbid?: string }>;
};

export default async function NewLogPage({ searchParams }: Props) {
  const { album: albumId } = await searchParams;

  if (!albumId) redirect("/explore");

  const supabase = await createClient();

  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", albumId)
    .single()
    .returns<Album>();

  if (!album) redirect("/explore");

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("album_id", albumId)
    .order("track_number", { ascending: true })
    .returns<Track[]>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Registrar escucha</h1>
      <LogFormWrapper album={album} tracks={tracks ?? []} />
    </div>
  );
}
