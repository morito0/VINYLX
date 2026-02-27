import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/navigation/sidebar";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarding_completed) {
    const displayName =
      profile?.username ??
      (user.user_metadata as Record<string, string>)?.username ??
      "vinylxer";
    return <OnboardingWizard userId={user.id} username={displayName} />;
  }

  return (
    <div className="min-h-dvh">
      <Sidebar username={profile.username} />
      <main className="pb-20 lg:pl-64 lg:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav username={profile.username} />
    </div>
  );
}
