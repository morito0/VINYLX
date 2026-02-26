import { createClient } from "@/lib/supabase/server";
import { ExploreTabs } from "@/components/explore/explore-tabs";

export const metadata = { title: "Explorar" };

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let followingIds: string[] = [];
  if (user) {
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    followingIds = data?.map((f) => f.following_id) ?? [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Explorar</h1>
      <ExploreTabs
        currentUserId={user?.id ?? null}
        followingIds={followingIds}
      />
    </div>
  );
}
