"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const onboardingSchema = z.object({
  userId: z.string().uuid(),
  country: z.string().min(1, "Selecciona un país"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  favorite_genres: z
    .array(z.string())
    .max(5, "Máximo 5 géneros")
    .default([]),
});

export type OnboardingState = {
  error: string | null;
  success: boolean;
};

export async function completeOnboarding(
  data: z.infer<typeof onboardingSchema>
): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== parsed.data.userId) {
    return { error: "No autenticado", success: false };
  }

  const username =
    (user.user_metadata as Record<string, string>)?.username ??
    user.email?.split("@")[0] ??
    `user_${user.id.slice(0, 8)}`;

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      username,
      country: parsed.data.country,
      birth_date: parsed.data.birth_date,
      favorite_genres: parsed.data.favorite_genres,
      onboarding_completed: true,
    });

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/");
  return { error: null, success: true };
}
