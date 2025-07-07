import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationsBell({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
    const data: Notification[] = await res.json();
    setNotifications(data);
    setUnread(data.filter((n: Notification) => !n.is_read).length);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // cada 15s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    await fetch(`http://localhost:5000/api/notifications/read/${id}`, { method: "PUT" });
    fetchNotifications();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell />
          {unread > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-auto">
        <div className="p-2 font-bold">Notificaciones</div>
        {notifications.length === 0 && (
          <div className="p-2 text-muted-foreground">Sin notificaciones</div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-2 border-b cursor-pointer ${!n.is_read ? "bg-blue-50" : ""}`}
            onClick={() => markAsRead(n.id)}
          >
            <div className="text-sm">{n.message}</div>
            <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
