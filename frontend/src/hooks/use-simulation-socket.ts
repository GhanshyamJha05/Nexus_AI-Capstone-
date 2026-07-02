"use client";

import { useEffect, useRef, useCallback } from "react";
import type { WsAgentUpdate } from "@/lib/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useSimulationSocket(
  simulationId: number,
  onMessage: (update: WsAgentUpdate) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const token = typeof window !== "undefined"
      ? localStorage.getItem("nexus_access_token")
      : null;

    if (!token) return;

    const ws = new WebSocket(
      `${WS_URL}/api/v1/ws/simulations/${simulationId}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      // Send auth token as first message
      ws.send(JSON.stringify({ token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WsAgentUpdate;
        if (data.simulation_id === simulationId) {
          onMessage(data);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;
      // Reconnect with backoff unless deliberately closed
      if (event.code !== 1000 && event.code !== 4001) {
        reconnectTimerRef.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [simulationId, onMessage]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [connect]);
}
