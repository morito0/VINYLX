"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Compass,
  ListMusic,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/lib/actions/auth";

interface SidebarProps {
  username: string | null;
}

export function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/trending", label: "Trending", icon: TrendingUp },
    { href: "/explore", label: "Explorar", icon: Compass },
    { href: "/listenlist", label: "Listenlist", icon: ListMusic },
    {
      href: username ? `/profile/${username}` : "/login",
      label: "Perfil",
      icon: User,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-glass backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-6">
        <Link href="/feed" className="font-mono text-xl font-bold tracking-tighter">
          Vinyl<span className="text-accent-orange">X</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-border/50 text-foreground"
                  : "text-muted hover:bg-border/30 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        {username && (
          <Link
            href="/settings/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/settings")
                ? "bg-border/50 text-foreground"
                : "text-muted hover:bg-border/30 hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            Ajustes
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-border/30 hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
