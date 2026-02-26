"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { toggleAlbumInListenlist } from "@/lib/actions/listenlists";
import { cn } from "@/lib/utils/cn";

interface ListenlistButtonProps {
  albumId: string;
  initialSaved: boolean;
}

export function ListenlistButton({
  albumId,
  initialSaved,
}: ListenlistButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticSaved, setOptimisticSaved] = useOptimistic(
    initialSaved,
    (_current, _action: "toggle") => !_current
  );

  function handleClick() {
    startTransition(async () => {
      setOptimisticSaved("toggle");
      const result = await toggleAlbumInListenlist(albumId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          result.saved
            ? "Añadido a tu Listenlist"
            : "Eliminado de tu Listenlist"
        );
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimisticSaved ? "Quitar de listenlist" : "Guardar en listenlist"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-95",
        optimisticSaved
          ? "bg-accent-orange/15 text-accent-orange"
          : "text-muted hover:bg-border/50 hover:text-foreground"
      )}
    >
      <Bookmark
        className="h-5 w-5"
        fill={optimisticSaved ? "currentColor" : "none"}
      />
    </button>
  );
}
