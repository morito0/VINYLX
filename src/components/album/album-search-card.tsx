"use client";

import Link from "next/link";
import { useState } from "react";
import type { SearchResultItem } from "@/lib/musicbrainz/types";

export function AlbumSearchCard({ item }: { item: SearchResultItem }) {
  const [imgError, setImgError] = useState(false);
  const year = item.releaseDate?.split("-")[0];

  return (
    <Link
      href={`/album/${item.mbid}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-muted/50 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative aspect-square overflow-hidden bg-border">
        {item.coverUrl && !imgError ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card">
            <span className="font-mono text-3xl font-bold text-border">
              {item.title[0]}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-0.5 p-3">
        <p className="truncate text-sm font-semibold leading-tight">
          {item.title}
        </p>
        <p className="truncate text-xs text-muted">{item.artistName}</p>
        {year && (
          <p className="font-mono text-xs text-muted/60">{year}</p>
        )}
      </div>
    </Link>
  );
}
