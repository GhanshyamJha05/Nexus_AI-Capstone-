"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { usersApi } from "@/lib/api";
import { userAtom, sidebarCollapsedAtom } from "@/lib/atoms";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopNav } from "./dashboard-top-nav";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useAtom(userAtom);
  const [collapsed] = useAtom(sidebarCollapsedAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexus_access_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    usersApi
      .getMe()
      .then((resp) => {
        setUser(resp.data);
      })
      .catch(() => {
        localStorage.removeItem("nexus_access_token");
        localStorage.removeItem("nexus_refresh_token");
        router.replace("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <DashboardTopNav />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
