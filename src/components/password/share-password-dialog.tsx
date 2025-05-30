import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
}

interface SharedUser extends User {
  shared_at: string;
}

interface SharePasswordDialogProps {
  passwordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharePasswordDialog({
  passwordId,
  open,
  onOpenChange,
}: SharePasswordDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchSharedUsers();
    }
  }, [open, passwordId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    }
  };

  const fetchSharedUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/passwords/${passwordId}/shares`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error fetching shared users");
      }
      const data = await response.json();
      setSharedUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shared users:", error);
      setSharedUsers([]);
    }
  };

  const handleShare = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/passwords/${passwordId}/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al compartir la contraseña");
      }

      toast.success("Contraseña compartida exitosamente");
      fetchSharedUsers();
    } catch (error) {
      console.error("Error sharing password:", error);
      toast.error("Error al compartir la contraseña");
    }
  };

  const handleRemoveShare = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/passwords/${passwordId}/shares/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al dejar de compartir");
      }

      toast.success("Se dejó de compartir la contraseña");
      fetchSharedUsers();
    } catch (error) {
      console.error("Error removing share:", error);
      toast.error("Error al dejar de compartir la contraseña");
    }
  };

  // Filtrar usuarios disponibles
  const filteredUsers = users.filter((user) => {
    const isShared = sharedUsers.some((shared) => shared.id === user.id);
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    return !isShared && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compartir Contraseña</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {sharedUsers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Compartido con</h4>
                <Table>
                  <TableBody>
                    {sharedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveShare(user.id)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Usuarios disponibles</h4>
                <Table>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(user.id)}
                          >
                            Compartir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
