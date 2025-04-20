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
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Nombre</p>
              <p>
                {user.name} {user.last_name}
              </p>
            </div>
            <div>
              <p className="font-semibold">Usuario</p>
              <p>{user.username}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-semibold">Estado</p>
              <p>{user.user_status}</p>
            </div>
            <div>
              <p className="font-semibold">Rol</p>
              <p>{user.name_rol}</p>
            </div>
            <div>
              <p className="font-semibold">Equipo</p>
              <p>{user.team_name}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
