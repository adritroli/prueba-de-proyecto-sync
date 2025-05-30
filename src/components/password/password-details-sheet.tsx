import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PasswordEntry } from "@/types/password";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Save,
  Trash,
  Users,
  Copy,
  Pencil,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharePasswordDialog } from "@/components/password/share-password-dialog";
import { toast } from "sonner";

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

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="p-0 ">
          <Card className="w-full h-full  overflow-y-auto p-4 space-y-2">
            <SheetHeader className="mt-5">
              <div className="flex justify-between items-center">
                <SheetTitle>Detalles de la contraseña</SheetTitle>
                {isOwner && !isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowShareDialog(true)}
                    >
                      <Share2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(password!.id)}
                      className="hover:text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
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
                    <div className="flex gap-2">
                      <Input
                        value={
                          isEditing
                            ? editedData.title || password.title
                            : password.title
                        }
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            title: e.target.value,
                          })
                        }
                        disabled={!isOwner || !isEditing}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10"
                        onClick={() =>
                          handleCopyToClipboard(password.title, "Título")
                        }
                      >
                        <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Usuario</label>
                    <div className="flex gap-2">
                      <Input
                        value={
                          isEditing
                            ? editedData.username || password.username
                            : password.username
                        }
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            username: e.target.value,
                          })
                        }
                        disabled={!isOwner || !isEditing}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10"
                        onClick={() =>
                          handleCopyToClipboard(password.username, "Usuario")
                        }
                      >
                        <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </div>
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
                        variant="ghost"
                        size="icon"
                        className="h-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10"
                        onClick={() =>
                          handleCopyToClipboard(password.password, "Contraseña")
                        }
                      >
                        <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      value={
                        isEditing
                          ? editedData.url || password.url
                          : password.url
                      }
                      onChange={(e) =>
                        setEditedData({ ...editedData, url: e.target.value })
                      }
                      disabled={!isOwner || !isEditing}
                    />
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
                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
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
