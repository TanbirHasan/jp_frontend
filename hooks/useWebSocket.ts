"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getWebSocketUrl } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

const WS_URL = getWebSocketUrl();

export function useWebSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const ws = new WebSocket(`${WS_URL}?token=${accessToken}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type: string; message?: string };

        if (data.type === "application_status_update" && data.message) {
          addNotification(data.message);
          toast.info(data.message);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      console.error("WebSocket connection error");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [accessToken, addNotification]);
}
