"use client";

import {
  useState,
  useTransition,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  searchUsers,
  type ProfileSearchResult,
} from "@/lib/actions/profiles";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";

const DEBOUNCE_MS = 350;

interface UserSearchProps {
  currentUserId: string | null;
  followingIds: string[];
}

export function UserSearch({ currentUserId, followingIds }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
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
        const data = await searchUsers(value);
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
          placeholder="Buscar usuarios por nombre..."
          className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-accent-orange" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((profile) => {
            const isOwn = currentUserId === profile.id;
            const isFollowing = followingIds.includes(profile.id);

            return (
              <div
                key={profile.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted/50"
              >
                <Link
                  href={`/profile/${profile.username}`}
                  className="shrink-0"
                >
                  <Avatar className="h-12 w-12">
                    {profile.avatar_url && (
                      <AvatarImage
                        src={profile.avatar_url}
                        alt={profile.username}
                      />
                    )}
                    <AvatarFallback>
                      {profile.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Link
                  href={`/profile/${profile.username}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-semibold">
                    {profile.display_name || profile.username}
                  </p>
                  <p className="truncate text-xs text-muted">
                    @{profile.username}
                  </p>
                  {profile.bio && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted/70">
                      {profile.bio}
                    </p>
                  )}
                </Link>

                {currentUserId && !isOwn && (
                  <FollowButton
                    targetUserId={profile.id}
                    initialIsFollowing={isFollowing}
                  />
                )}
              </div>
            );
          })}
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
