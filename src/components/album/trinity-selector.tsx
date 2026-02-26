"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MAX_SELECTIONS = 3;

interface TrackItem {
  id: string;
  title: string;
  trackNumber: number;
  durationMs: number | null;
}

interface TrinitySelectorProps {
  tracks: TrackItem[];
  value?: string[];
  onChange?: (selected: string[]) => void;
}

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TrinitySelector({
  tracks,
  value,
  onChange,
}: TrinitySelectorProps) {
  const [internal, setInternal] = useState<string[]>([]);
  const selected = value ?? internal;
  const isFull = selected.length >= MAX_SELECTIONS;

  const toggle = useCallback(
    (trackId: string) => {
      const next = selected.includes(trackId)
        ? selected.filter((id) => id !== trackId)
        : isFull
          ? selected
          : [...selected, trackId];

      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [selected, isFull, value, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          La Santa Trinidad
        </h3>
        <span
          className={cn(
            "font-mono text-xs font-bold",
            isFull ? "text-accent-emerald" : "text-muted"
          )}
        >
          {selected.length}/{MAX_SELECTIONS}
        </span>
      </div>
      <p className="text-xs text-muted/70">
        Elige tus 3 pistas favoritas de este álbum.
      </p>

      <div className="divide-y divide-border/50 rounded-xl border border-border bg-card">
        {tracks.map((track) => {
          const isSelected = selected.includes(track.id);
          const isDisabled = isFull && !isSelected;
          const selectionIndex = selected.indexOf(track.id);

          return (
            <button
              key={track.id}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(track.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all",
                isSelected &&
                  "bg-accent-emerald/5",
                isDisabled &&
                  "cursor-not-allowed opacity-30",
                !isSelected &&
                  !isDisabled &&
                  "hover:bg-border/20"
              )}
            >
              <span className="w-6 text-right font-mono text-xs text-muted/60">
                {track.trackNumber}
              </span>
              <span
                className={cn(
                  "flex-1 truncate",
                  isSelected && "font-medium text-accent-emerald"
                )}
              >
                {track.title}
              </span>
              {track.durationMs && (
                <span className="font-mono text-xs text-muted/40">
                  {formatDuration(track.durationMs)}
                </span>
              )}
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isSelected
                    ? "border-accent-emerald bg-accent-emerald text-background"
                    : "border-border"
                )}
              >
                {isSelected && (
                  <span className="text-xs font-bold">{selectionIndex + 1}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isFull && (
        <div className="flex items-center gap-2 rounded-lg border border-accent-emerald/20 bg-accent-emerald/5 px-3 py-2">
          <Check className="h-4 w-4 text-accent-emerald" />
          <span className="text-xs font-medium text-accent-emerald">
            Trinidad completa
          </span>
        </div>
      )}
    </div>
  );
}
