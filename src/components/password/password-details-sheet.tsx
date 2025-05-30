import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PasswordEntry } from "@/types/password";
import { Eye, EyeOff, Copy, Star, Trash, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface PasswordDetailsSheetProps {
  password: PasswordEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function PasswordDetailsSheet({
  password,
  open,
  onOpenChange,
  onDelete,
  onToggleFavorite,
}: PasswordDetailsSheetProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPassword, setEditedPassword] = useState<Partial<PasswordEntry>>(
    {}
  );

  useEffect(() => {
    if (password) {
      setEditedPassword(password);
    }
  }, [password]);

  const handleSave = async () => {
    if (!password) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/passwords/${password.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(editedPassword),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar");

      toast.success("Contraseña actualizada");
      setIsEditing(false);
      // Recargar la lista de contraseñas
      window.dispatchEvent(new CustomEvent("passwordsUpdated"));
    } catch (error) {
      toast.error("Error al actualizar la contraseña");
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "No disponible";
    try {
      return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  if (!password) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center mt-2">
            {isEditing ? (
              <Input
                value={editedPassword.title}
                onChange={(e) =>
                  setEditedPassword((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full"
              />
            ) : (
              <span>{password?.title}</span>
            )}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className={password.favorite ? "text-yellow-400" : ""}
                onClick={() => onToggleFavorite(password.id)}
              >
                <Star className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500"
                onClick={() => {
                  onDelete(password.id);
                  onOpenChange(false);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Usuario</h3>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={editedPassword.username}
                  onChange={(e) =>
                    setEditedPassword((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="flex-1"
                />
              ) : (
                <div className="flex-1 p-2 bg-muted rounded-md">
                  {password?.username}
                </div>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(password.username)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Contraseña</h3>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  type={showPassword ? "text" : "password"}
                  value={editedPassword.password}
                  onChange={(e) =>
                    setEditedPassword((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="flex-1"
                />
              ) : (
                <div className="flex-1 p-2 bg-muted rounded-md font-mono">
                  {showPassword ? password?.password : "••••••••"}
                </div>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(password.password)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">URL</h3>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={editedPassword.url}
                  onChange={(e) =>
                    setEditedPassword((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  className="flex-1"
                />
              ) : (
                <div className="flex-1 p-2 bg-muted rounded-md">
                  {password?.url && (
                    <a
                      href={password.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {password.url}
                    </a>
                  )}
                </div>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(password.url || "")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notas</h3>
            {isEditing ? (
              <Textarea
                value={editedPassword.notes}
                onChange={(e) =>
                  setEditedPassword((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-2 bg-muted rounded-md whitespace-pre-wrap break-words">
                {password?.notes || "Sin notas"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Detalles</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Creado:</span>{" "}
                {formatDate(password.created_at)}
              </p>
              <p>
                <span className="text-muted-foreground">
                  Última modificación:
                </span>{" "}
                {formatDate(password.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
