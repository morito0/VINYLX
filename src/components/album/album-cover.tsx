"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface AlbumCoverProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function AlbumCover({ src, alt, className }: AlbumCoverProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-border shadow-2xl shadow-black/40",
        className
      )}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-card">
          <span className="font-mono text-5xl font-bold text-border">
            {alt[0]?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
