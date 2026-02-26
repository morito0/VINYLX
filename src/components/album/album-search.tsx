"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { searchAlbumsFromMusicBrainz } from "@/lib/actions/musicbrainz";
import { AlbumSearchCard } from "./album-search-card";
import type { SearchResultItem } from "@/lib/musicbrainz/types";

const DEBOUNCE_MS = 400;

export function AlbumSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSearch = useCallback(
    (value: string) => {
      if (value.trim().length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      startTransition(async () => {
        const data = await searchAlbumsFromMusicBrainz(value);
        setResults(data);
        setHasSearched(true);
      });
    },
    [startTransition]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => executeSearch(value), DEBOUNCE_MS);
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Buscar álbumes, artistas..."
          autoFocus
          className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-accent-orange" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((item) => (
            <AlbumSearchCard key={item.mbid} item={item} />
          ))}
        </div>
      )}

      {hasSearched && !isPending && results.length === 0 && (
        <p className="pt-8 text-center text-sm text-muted">
          Sin resultados para &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
