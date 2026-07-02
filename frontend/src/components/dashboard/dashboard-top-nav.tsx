"use client";

import { useAtom } from "jotai";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { userAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/history": "Simulation History",
  "/dashboard/settings": "Settings",
};

export function DashboardTopNav() {
  const [user] = useAtom(userAtom);
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] || "Nexus AI";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="hidden md:block w-64">
          <Input
            placeholder="Search simulations..."
            icon={<Search className="w-4 h-4" />}
            className="h-8 text-xs"
          />
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-background text-xs font-bold">
          {user?.full_name?.[0] || user?.username?.[0] || "U"}
        </div>
      </div>
    </header>
  );
}
