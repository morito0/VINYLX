"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Compass, ListMusic, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BottomNavProps {
  username: string | null;
}

export function BottomNav({ username }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/trending", label: "Trend", icon: TrendingUp },
    { href: "/explore", label: "Buscar", icon: Compass },
    { href: "/listenlist", label: "Lista", icon: ListMusic },
    {
      href: username ? `/profile/${username}` : "/login",
      label: "Perfil",
      icon: User,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-glass backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-accent-orange"
                  : "text-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
