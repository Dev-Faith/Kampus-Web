"use client";
import { useState } from "react";
import Link from "next/link";
import { AccountPage } from "@/components/account/AccountPage";
import { ErrorNotice, Loading, Panel, date } from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import { notificationHref, type NotificationFeed } from "@/api/notifications";
import { apiClient } from "@/api/client";
import { authError } from "@/lib/auth-errors";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
export default function Notifications() {
  return (
    <AccountPage
      title="Notifications."
      description="Booking updates, roommate introductions, and messages in one place."
    >
      <Inbox />
    </AccountPage>
  );
}
function Inbox() {
  const feed = useApiResource<NotificationFeed>("/notifications", 30000),
    role = useAuthStore((s) => s.user!.role);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function mark(id?: string) {
    setBusy(true);
    setError("");
    try {
      await apiClient.post(
        id ? "/notifications/" + id + "/read" : "/notifications/read-all",
      );
      window.dispatchEvent(
        new CustomEvent("kampus:refresh", { detail: "/notifications" }),
      );
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <ErrorNotice error={feed.error || error} retry={feed.reload} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>{feed.data?.unreadCount || 0} unread</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={feed.reload}>
            Refresh
          </Button>
          <Button
            disabled={busy || !feed.data?.unreadCount}
            onClick={() => mark()}
          >
            Mark all read
          </Button>
        </div>
      </div>
      {!feed.data && !feed.error ? (
        <Loading />
      ) : feed.data?.items.length === 0 ? (
        <Panel>
          <p>No notifications yet.</p>
        </Panel>
      ) : (
        feed.data?.items.map((item) => {
          const href = notificationHref(item, role);
          return (
            <Panel key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-semibold">
                  {!item.isRead && (
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand" />
                  )}
                  {item.title}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {date(item.timestamp)}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {item.message}
              </p>
              <div className="flex flex-wrap gap-3">
                {href && (
                  <Link
                    href={href}
                    onClick={() => {
                      if (!item.isRead) void mark(item.id);
                    }}
                    className="text-brand-strong underline"
                  >
                    View details
                  </Link>
                )}
                {!item.isRead && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => mark(item.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </Panel>
          );
        })
      )}
      {feed.data && feed.data.total > feed.data.items.length && (
        <p className="text-sm text-muted-foreground">
          Showing your latest {feed.data.items.length} notifications.
        </p>
      )}
    </>
  );
}
