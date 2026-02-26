"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Album, Profile } from "@/lib/supabase/helpers";

const createLogSchema = z.object({
  album_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(10),
  review_text: z.string().max(5000).optional(),
  trinity_tracks: z.array(z.string().uuid()).length(3),
  listened_at: z.string().optional(),
});

export type LogState = {
  error: string | null;
};

export async function createLog(
  _prevState: LogState,
  formData: FormData
): Promise<LogState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const trinityRaw = formData.get("trinity_tracks");
  let trinityParsed: string[] = [];
  if (typeof trinityRaw === "string") {
    try {
      trinityParsed = JSON.parse(trinityRaw);
    } catch {
      return { error: "Formato inválido para la Santa Trinidad" };
    }
  }

  const parsed = createLogSchema.safeParse({
    album_id: formData.get("album_id"),
    rating: formData.get("rating"),
    review_text: formData.get("review_text") || undefined,
    trinity_tracks: trinityParsed,
    listened_at: formData.get("listened_at") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("album_logs").insert({
    user_id: user.id,
    album_id: parsed.data.album_id,
    rating: parsed.data.rating,
    review_text: parsed.data.review_text ?? null,
    trinity_tracks: parsed.data.trinity_tracks,
    listened_at: parsed.data.listened_at,
  });

  if (error) return { error: error.message };

  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", parsed.data.album_id)
    .single()
    .returns<Album>();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
    .returns<Profile>();

  revalidatePath("/feed");
  if (profile) revalidatePath(`/profile/${profile.username}`);
  if (album) revalidatePath(`/album/${album.musicbrainz_id}`);

  const redirectMbid = album?.musicbrainz_id ?? parsed.data.album_id;
  redirect(`/album/${redirectMbid}`);
}
