"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { toggleFollow } from "@/lib/actions/follows";
import { cn } from "@/lib/utils/cn";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  followerCount?: number;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  followerCount,
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic(
    { isFollowing: initialIsFollowing, count: followerCount ?? 0 },
    (current, _action: "toggle") => ({
      isFollowing: !current.isFollowing,
      count: current.isFollowing ? current.count - 1 : current.count + 1,
    })
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic("toggle");
      const result = await toggleFollow(targetUserId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-all",
        optimistic.isFollowing
          ? "border border-border bg-transparent text-muted hover:border-red-500/50 hover:text-red-400"
          : "bg-accent-orange text-background hover:opacity-90"
      )}
    >
      <span>{optimistic.isFollowing ? "Siguiendo" : "Seguir"}</span>
      {followerCount !== undefined && (
        <span className="font-mono text-xs opacity-70">
          {optimistic.count}
        </span>
      )}
    </button>
  );
}
