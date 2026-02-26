"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike(logId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado", liked: false };

  const { data: existing } = await supabase
    .from("log_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("log_id", logId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("log_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("log_id", logId);

    if (error) return { error: error.message, liked: true };

    revalidatePath("/feed");
    return { error: null, liked: false };
  }

  const { error } = await supabase
    .from("log_likes")
    .insert({ user_id: user.id, log_id: logId });

  if (error) return { error: error.message, liked: false };

  revalidatePath("/feed");
  return { error: null, liked: true };
}
