import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserLogs } from "@/lib/queries/feed";
import { LogCard } from "@/components/log/log-card";
import { FollowButton } from "@/components/profile/follow-button";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import type { Profile } from "@/lib/supabase/helpers";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Usuario no encontrado" };

  const displayName = profile.display_name || profile.username;
  const title = `${displayName} (@${profile.username}) | VinylX`;
  const description =
    profile.bio ||
    `Perfil de @${profile.username} en VinylX — El Letterboxd para la música.`;

  return {
    title: `@${profile.username}`,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      ...(profile.avatar_url && {
        images: [
          {
            url: profile.avatar_url,
            width: 256,
            height: 256,
            alt: displayName,
          },
        ],
      }),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()
    .returns<Profile>();

  if (!profile) notFound();

  const [
    logs,
    followersRes,
    followingRes,
    authResult,
  ] = await Promise.all([
    getUserLogs(profile.id, 30),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase.auth.getUser(),
  ]);

  const followersCount = followersRes.count ?? 0;
  const followingCount = followingRes.count ?? 0;
  const currentUser = authResult.data.user;
  const isOwnProfile = currentUser?.id === profile.id;

  let isFollowing = false;
  if (currentUser && !isOwnProfile) {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    isFollowing = !!data;
  }

  const logCount = logs.length;
  const avgRating =
    logCount > 0
      ? (logs.reduce((sum, l) => sum + l.rating, 0) / logCount).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-border text-2xl font-bold text-muted">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-full w-full object-cover"
            />
          ) : (
            profile.username[0].toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.display_name || profile.username}
            </h1>
            {currentUser && !isOwnProfile && (
              <FollowButton
                targetUserId={profile.id}
                initialIsFollowing={isFollowing}
                followerCount={followersCount}
              />
            )}
            {isOwnProfile && (
              <EditProfileModal
                profile={{
                  country: profile.country,
                  birth_date: profile.birth_date,
                  favorite_genres: profile.favorite_genres,
                  display_name: profile.display_name,
                  bio: profile.bio,
                }}
              />
            )}
          </div>
          <p className="text-sm text-muted">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {profile.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-5 text-sm">
            <span>
              <strong className="text-foreground">{logCount}</strong>{" "}
              <span className="text-muted">logs</span>
            </span>
            {avgRating && (
              <span>
                <strong className="font-mono text-accent-orange">{avgRating}</strong>{" "}
                <span className="text-muted">promedio</span>
              </span>
            )}
            <span>
              <strong className="text-foreground">{followersCount}</strong>{" "}
              <span className="text-muted">seguidores</span>
            </span>
            <span>
              <strong className="text-foreground">{followingCount}</strong>{" "}
              <span className="text-muted">siguiendo</span>
            </span>
            <Link
              href={`/profile/${profile.username}/listenlist`}
              className="text-muted transition-colors hover:text-foreground"
            >
              Listenlist →
            </Link>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Historia musical</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted">Sin actividad todavía.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
