"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useApiResource } from "@/lib/use-api-resource";
import type { NotificationFeed } from "@/api/notifications";
export function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const feed = useApiResource<NotificationFeed>(
    user ? "/notifications" : null,
    60000,
  );
  if (!user) return null;
  const count = feed.data?.unreadCount || 0;
  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${count ? ", " + count + " unread" : ""}`}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-brand px-1.5 text-[10px] leading-5 text-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
