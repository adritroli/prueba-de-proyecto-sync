import { PasswordEntry } from "@/types/password";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Trash, Pencil, Star, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  if (!password) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold flex items-center justify-between">
            <span>{password.title}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(password.id)}
              >
                <Star
                  className={`h-4 w-4 ${
                    password.favorite ? "fill-yellow-400" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <div className="flex items-center justify-between">
              <span>{password.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(password.username, "Usuario")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contraseña</Label>
            <div className="flex items-center justify-between">
              <span>{showPassword ? password.password : "••••••••"}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(password.password, "Contraseña")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {password.url && (
            <div className="space-y-2">
              <Label>URL</Label>
              <div className="flex items-center justify-between">
                <span className="text-blue-500 hover:underline">
                  <a
                    href={password.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {password.url}
                  </a>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(password.url!, "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {password.notes && (
            <div className="space-y-2">
              <Label>Notas</Label>
              <p className="text-sm text-muted-foreground">{password.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Metadatos</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Creado:</span>
                <span className="ml-2">
                  {password.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Actualizado:</span>
                <span className="ml-2">
                  {password.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => onDelete(password.id)}>
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
