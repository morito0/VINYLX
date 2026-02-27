"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createLog, type LogState } from "@/lib/actions/logs";
import { MagneticRatingSlider } from "@/components/log/magnetic-rating-slider";
import { TrinitySelector } from "@/components/album/trinity-selector";
import { AlbumCover } from "@/components/album/album-cover";
import { Button } from "@/components/ui/button";
import type { Album, Track } from "@/lib/supabase/helpers";

const initialState: LogState = { error: null };

interface Props {
  album: Album;
  tracks: Track[];
}

export function LogFormWrapper({ album, tracks }: Props) {
  const [state, formAction, isPending] = useActionState(createLog, initialState);
  const [trinity, setTrinity] = useState<string[]>([]);
  const [rating, setRating] = useState(7.0);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  const trackItems = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    trackNumber: t.track_number,
    durationMs: t.duration_ms,
  }));

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="album_id" value={album.id} />
      <input type="hidden" name="trinity_tracks" value={JSON.stringify(trinity)} />

      {state.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {/* Album header */}
      <div className="flex items-center gap-4">
        <AlbumCover
          src={album.cover_url}
          alt={album.title}
          className="h-20 w-20 shrink-0"
        />
        <div>
          <p className="font-semibold">{album.title}</p>
          <p className="text-sm text-muted">{album.artist_name}</p>
        </div>
      </div>

      {/* Rating */}
      <MagneticRatingSlider value={rating} onChange={setRating} />

      {/* Trinity */}
      {trackItems.length > 0 && (
        <TrinitySelector
          tracks={trackItems}
          value={trinity}
          onChange={setTrinity}
        />
      )}

      {/* Review */}
      <div className="space-y-2">
        <label htmlFor="review_text" className="block text-sm font-semibold">
          Reseña <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="review_text"
          name="review_text"
          rows={5}
          maxLength={5000}
          placeholder="¿Qué te provocó este álbum?"
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label htmlFor="listened_at" className="block text-sm font-semibold">
          Fecha de escucha
        </label>
        <input
          type="date"
          id="listened_at"
          name="listened_at"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={isPending || trinity.length !== 3}
        className="w-full"
      >
        {isPending ? "Registrando..." : "Registrar log"}
      </Button>

      {trinity.length !== 3 && (
        <p className="text-center text-xs text-muted">
          Selecciona tus 3 pistas favoritas para continuar.
        </p>
      )}
    </form>
  );
}
