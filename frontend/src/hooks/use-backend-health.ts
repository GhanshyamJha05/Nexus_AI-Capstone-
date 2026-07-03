"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Readiness = "checking" | "ready" | "degraded";

export function useBackendHealth(apiBaseUrl?: string, pollIntervalMs = 30000) {
  const [status, setStatus] = useState<Readiness>("checking");
  const [checks, setChecks] = useState<Record<string, string> | null>(null);
  const mounted = useRef(false);
  const prevStatus = useRef<Readiness | null>(null);

  const getUrl = (path: string) => {
    const base = (apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
    return `${base}${path}`;
  };

  async function fetchReady() {
    try {
      const res = await fetch(getUrl("/health/ready"), { headers: { Accept: "application/json" } });
      if (!res.ok) {
        setStatus("degraded");
        setChecks(null);
        return;
      }
      const body = await res.json();
      const s = body?.status === "ready" ? "ready" : "degraded";
      setStatus(s);
      setChecks(body?.checks ?? null);
    } catch (e) {
      setStatus("degraded");
      setChecks(null);
    }
  }

  useEffect(() => {
    mounted.current = true;
    // initial check
    fetchReady();
    const id = setInterval(() => {
      fetchReady();
    }, pollIntervalMs);

    return () => {
      mounted.current = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, pollIntervalMs]);

  useEffect(() => {
    if (prevStatus.current && prevStatus.current !== status) {
      if (status === "ready") {
        toast.success("Backend ready");
      } else if (status === "degraded") {
        toast.error("Backend degraded — some features may be unavailable");
      }
    }
    prevStatus.current = status;
  }, [status]);

  return { status, checks, refetch: fetchReady } as const;
}
