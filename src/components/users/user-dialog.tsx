import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Nombre</p>
              <p>
                {user?.name} {user?.last_name}
              </p>
            </div>
            <div>
              <p className="font-semibold">Usuario</p>
              <p>{user?.username}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>{user?.email}</p>
            </div>
            <div>
              <p className="font-semibold">Estado</p>
              <p>{user?.user_status}</p>
            </div>
            <div>
              <p className="font-semibold">Rol</p>
              <p>{user?.name_rol}</p>
            </div>
            <div>
              <p className="font-semibold">Equipo</p>
              <p>{user?.team_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Estado de conexión:</span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    user?.connection_status === "online"
                      ? "bg-green-500"
                      : user?.connection_status === "away"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm capitalize">
                  {user?.connection_status || "offline"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Última conexión:</span>
              <span className="text-sm text-muted-foreground">
                {user?.last_connection
                  ? new Date(user.last_connection).toLocaleString()
                  : "Sin registros"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
