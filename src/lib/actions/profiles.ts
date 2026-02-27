"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Profile } from "@/lib/supabase/helpers";
import type { Database } from "@/lib/supabase/types";

export type ProfileSearchResult = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url" | "bio"
>;

export async function searchUsers(
  query: string
): Promise<ProfileSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const sanitized = query.trim().replace(/%/g, "\\%").replace(/_/g, "\\_");

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .ilike("username", `%${sanitized}%`)
    .limit(10)
    .returns<ProfileSearchResult[]>();

  return data ?? [];
}

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  display_name: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
});

export type ProfileFormState = {
  error: string | null;
  success: boolean;
};

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado", success: false };

  const parsed = updateProfileSchema.safeParse({
    username: formData.get("username"),
    display_name: formData.get("display_name") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  const avatarFile = formData.get("avatar") as File | null;
  let avatarUrl: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > 2 * 1024 * 1024) {
      return { error: "La imagen no puede superar 2MB", success: false };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(avatarFile.type)) {
      return {
        error: "Formato no soportado. Usa JPG, PNG o WebP",
        success: false,
      };
    }

    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      return {
        error: `Error al subir avatar: ${uploadError.message}`,
        success: false,
      };
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    avatarUrl = `${publicUrl.publicUrl}?t=${Date.now()}`;
  }

  type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

  const payload: ProfileUpdate = {
    username: parsed.data.username,
    display_name: parsed.data.display_name ?? null,
    bio: parsed.data.bio ?? null,
  };

  if (avatarUrl) {
    payload.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ese username ya está en uso", success: false };
    }
    return { error: error.message, success: false };
  }

  revalidatePath(`/profile/${parsed.data.username}`);
  revalidatePath("/settings/profile");
  return { error: null, success: true };
}

const updateDetailsSchema = z.object({
  country: z.string().min(1, "Selecciona un país"),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .nullable(),
  favorite_genres: z.array(z.string()).max(5, "Máximo 5 géneros").default([]),
  display_name: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateDetailsInput = z.infer<typeof updateDetailsSchema>;

export async function updateProfileDetails(
  data: UpdateDetailsInput
): Promise<ProfileFormState> {
  const parsed = updateDetailsSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado", success: false };

  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
    country: parsed.data.country,
    birth_date: parsed.data.birth_date,
    favorite_genres: parsed.data.favorite_genres,
  };

  if (parsed.data.display_name !== undefined) {
    payload.display_name = parsed.data.display_name || null;
  }
  if (parsed.data.bio !== undefined) {
    payload.bio = parsed.data.bio || null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message, success: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath(`/profile/${profile?.username}`);
  revalidatePath("/feed");
  return { error: null, success: true };
}
