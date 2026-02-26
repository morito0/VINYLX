"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { toggleLike } from "@/lib/actions/likes";
import { cn } from "@/lib/utils/cn";

interface LikeButtonProps {
  logId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
}

export function LikeButton({
  logId,
  initialLikesCount,
  initialIsLiked,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialIsLiked, count: initialLikesCount },
    (current, _action: "toggle") => ({
      liked: !current.liked,
      count: current.liked ? current.count - 1 : current.count + 1,
    })
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic("toggle");
      const result = await toggleLike(logId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimistic.liked ? "Quitar like" : "Dar like"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all active:scale-95",
        optimistic.liked
          ? "text-red-400"
          : "text-muted/50 hover:text-muted"
      )}
    >
      <Heart
        className="h-3.5 w-3.5"
        fill={optimistic.liked ? "currentColor" : "none"}
      />
      {optimistic.count > 0 && (
        <span className="font-mono text-[11px] leading-none">
          {optimistic.count}
        </span>
      )}
    </button>
  );
}
