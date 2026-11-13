export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  timestamp: string;
  data?: {
    bookingId?: string;
    connectionId?: string;
    [key: string]: unknown;
  } | null;
}
export interface NotificationFeed {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
}
export function notificationHref(item: NotificationItem, role: string) {
  if (item.data?.connectionId)
    return (
      "/roommates?connectionId=" + encodeURIComponent(item.data.connectionId)
    );
  if (item.data?.bookingId)
    return role === "LANDLORD"
      ? "/host/bookings?bookingId=" + encodeURIComponent(item.data.bookingId)
      : role === "ADMIN"
        ? "/admin/bookings/" + encodeURIComponent(item.data.bookingId)
        : "/bookings/" + encodeURIComponent(item.data.bookingId);
  return null;
}
