"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification-store";
import { cn } from "@/lib/utils";

function formatTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, markAllRead, clearAll } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-emerald-600 text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 transition-colors",
                    !n.isRead && "bg-emerald-50"
                  )}
                >
                  <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatTime(n.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
