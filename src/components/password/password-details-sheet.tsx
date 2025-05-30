import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PasswordEntry } from "@/types/password";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff, Save, Trash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharePasswordDialog } from "@/components/password/share-password-dialog";

interface PasswordDetailsSheetProps {
  password: PasswordEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdate?: (id: string, data: Partial<PasswordEntry>) => void;
  onShare?: (id: string) => void;
}

export function PasswordDetailsSheet({
  password,
  open,
  onOpenChange,
  onDelete,
  onToggleFavorite,
  onUpdate,
  onShare,
}: PasswordDetailsSheetProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<PasswordEntry>>({});
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Verificar si el usuario es el creador de la contraseña
  const isOwner =
    !password?.share_type || password?.share_type === "shared_by_me";

  const handleSave = () => {
    if (password && onUpdate) {
      onUpdate(password.id, editedData);
      setIsEditing(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalles de la contraseña</SheetTitle>
          </SheetHeader>
          {password && (
            <div className="space-y-4 mt-4">
              {password.share_type === "shared_with_me" && (
                <div className="bg-muted p-2 rounded text-sm">
                  Esta contraseña fue compartida contigo. Solo puedes verla.
                </div>
              )}

              {/* Campos de la contraseña */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={
                      isEditing
                        ? editedData.title || password.title
                        : password.title
                    }
                    onChange={(e) =>
                      setEditedData({ ...editedData, title: e.target.value })
                    }
                    disabled={!isOwner || !isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario</label>
                  <Input
                    value={
                      isEditing
                        ? editedData.username || password.username
                        : password.username
                    }
                    onChange={(e) =>
                      setEditedData({ ...editedData, username: e.target.value })
                    }
                    disabled={!isOwner || !isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    value={
                      isEditing ? editedData.url || password.url : password.url
                    }
                    onChange={(e) =>
                      setEditedData({ ...editedData, url: e.target.value })
                    }
                    disabled={!isOwner || !isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraseña</label>
                  <div className="flex gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password.password}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas</label>
                  <Input
                    value={
                      isEditing
                        ? editedData.notes || password.notes
                        : password.notes
                    }
                    onChange={(e) =>
                      setEditedData({ ...editedData, notes: e.target.value })
                    }
                    disabled={!isOwner || !isEditing}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4">
                {isOwner && (
                  <>
                    {isEditing ? (
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => setIsEditing(true)}>
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowShareDialog(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Compartir
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => onDelete(password.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {password && (
        <SharePasswordDialog
          passwordId={password.id}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
        />
      )}
    </>
  );
}
