import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Profile } from "@/lib/supabase/helpers";

export const metadata = { title: "Editar perfil" };

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
    .returns<Profile>();

  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar perfil</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
