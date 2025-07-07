import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "@/styles/notificaciones.css"; // Asegúrate de tener este archivo para estilos personalizados
import { IoTrashBin } from "react-icons/io5";
import { BiSelectMultiple } from "react-icons/bi";

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
    const res = await fetch(
      `http://localhost:5000/api/notifications/${userId}`
    );
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
    await fetch(`http://localhost:5000/api/notifications/read/${id}`, {
      method: "PUT",
    });
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await fetch(`http://localhost:5000/api/notifications/read-all/${userId}`, {
      method: "PUT",
    });
    fetchNotifications();
  };

  const clearAll = async () => {
    await fetch(`http://localhost:5000/api/notifications/clear-all/${userId}`, {
      method: "DELETE",
    });
    fetchNotifications();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="trigger-notificaciones">
        <Button variant="ghost" className="relative">
          <Bell />
          {unread > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1 span-notificaciones">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-auto menu-notificaciones">
        <div className="flex flex-col prueba">
          <div className="p-2 font-bold flex justify-between items-center gap-2 w-96">
            <span>Notificaciones</span>
            <div className="flex gap-1">
              <Button
                className="btn-noti"
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                disabled={notifications.length === 0}
              >
                <BiSelectMultiple />
              </Button>
              <Button
                className="btn-noti"
                size="sm"
                variant="destructive"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <IoTrashBin />
              </Button>
            </div>
          </div>
          {notifications.length === 0 && (
            <div className="p-2 text-muted-foreground">Sin notificaciones</div>
          )}
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-2 mb-1  cursor-pointer tarjeta-notificaciones ${
                !n.is_read ? "  bg-muted" : ""
              }`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
