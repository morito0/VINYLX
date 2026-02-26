"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleAlbumInListenlist(albumId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado", saved: false };

  const { data: existing } = await supabase
    .from("listenlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("album_id", albumId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("listenlists")
      .delete()
      .eq("user_id", user.id)
      .eq("album_id", albumId);

    if (error) return { error: error.message, saved: true };

    revalidatePath("/listenlist");
    return { error: null, saved: false };
  }

  const { error } = await supabase
    .from("listenlists")
    .insert({ user_id: user.id, album_id: albumId });

  if (error) return { error: error.message, saved: false };

  revalidatePath("/listenlist");
  return { error: null, saved: true };
}
