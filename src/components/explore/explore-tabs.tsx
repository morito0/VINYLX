"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { AlbumSearch } from "@/components/album/album-search";
import { UserSearch } from "@/components/profile/user-search";

type Tab = "albums" | "users";

const TABS = [
  { id: "albums" as const, label: "Álbumes" },
  { id: "users" as const, label: "Usuarios" },
];

interface ExploreTabsProps {
  currentUserId: string | null;
  followingIds: string[];
}

export function ExploreTabs({
  currentUserId,
  followingIds,
}: ExploreTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("albums");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-border/50 text-foreground"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "albums" ? (
        <AlbumSearch />
      ) : (
        <UserSearch
          currentUserId={currentUserId}
          followingIds={followingIds}
        />
      )}
    </div>
  );
}
