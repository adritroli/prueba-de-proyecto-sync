import DefaultLayout from "@/config/layout";
import { useState, useEffect } from "react";
import { PasswordEntry, PasswordGeneratorOptions } from "@/types/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  EyeOff,
  Copy,
  Star,
  Trash,
  Plus,
  RefreshCw,
  FolderPlus,
  Archive,
  Trash2,
  Inbox,
  Folder, // Agregar esta importación
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PasswordDetailsSheet } from "@/components/password/password-details-sheet";

export default function PaginaPruebas() {
  // Añadir nuevo estado para selección múltiple
  const [selectedPasswords, setSelectedPasswords] = useState<string[]>([]);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [generatorOptions, setGeneratorOptions] =
    useState<PasswordGeneratorOptions>({
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
  const [newEntry, setNewEntry] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    folder_id: "none", // Cambiado de "" a "none"
    favorite: false,
  });
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [newFolderInput, setNewFolderInput] = useState(false);
  const [selectedPassword, setSelectedPassword] =
    useState<PasswordEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredPasswords = passwords.filter((password) => {
    switch (selectedFolder) {
      case "favorites":
        return password.favorite;
      case "trash":
        return password.deleted;
      case "all":
        return !password.deleted;
      default:
        return password.folder_id === selectedFolder && !password.deleted;
    }
  });

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (generatorOptions.includeUppercase) chars += uppercase;
    if (generatorOptions.includeLowercase) chars += lowercase;
    if (generatorOptions.includeNumbers) chars += numbers;
    if (generatorOptions.includeSymbols) chars += symbols;

    let password = "";
    for (let i = 0; i < generatorOptions.length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    setNewEntry({ ...newEntry, password });
  };

  useEffect(() => {
    fetchPasswords();
    fetchFolders();
  }, [selectedFolder]);

  const fetchPasswords = async () => {
    try {
      let url = "http://localhost:5000/api/passwords";

      // Agregar el parámetro folder_id para los filtros especiales
      if (selectedFolder === "favorites") {
        url += "?folder_id=favorites";
      } else if (selectedFolder === "trash") {
        url += "?folder_id=trash";
      } else if (selectedFolder !== "all") {
        url += `?folder_id=${selectedFolder}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Asume que tienes el token guardado
        },
      });
      const data = await response.json();
      setPasswords(data);
    } catch (error) {
      console.error("Error fetching passwords:", error);
      toast.error("Error al cargar las contraseñas");
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/passwords/folders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Error al cargar las carpetas");
    }
  };

  const addPassword = async () => {
    if (!newEntry.title || !newEntry.username || !newEntry.password) {
      toast.error("Por favor complete los campos requeridos");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...newEntry,
          folder_id: newEntry.folder_id === "none" ? null : newEntry.folder_id,
        }),
      });

      if (!response.ok) throw new Error("Error al crear la contraseña");

      setNewEntry({
        title: "",
        username: "",
        password: "",
        url: "",
        notes: "",
        folder_id: "none", // Cambiado de "" a "none"
        favorite: false,
      });

      fetchPasswords();
      toast.success("Contraseña guardada exitosamente");
    } catch (error) {
      console.error("Error creating password:", error);
      toast.error("Error al guardar la contraseña");
    }
  };

  const addFolder = async (name: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/passwords/folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la carpeta");
      }

      const data = await response.json();
      setFolders((prev) => [...prev, { id: data.id, name: data.name }]);
      setNewFolderInput(false);
      toast.success("Carpeta creada exitosamente");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear la carpeta"
      );
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/passwords/${id}/favorite`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchPasswords();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Error al actualizar favorito");
    }
  };

  const deletePassword = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/passwords/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchPasswords();
      toast.success("Contraseña eliminada");
    } catch (error) {
      console.error("Error deleting password:", error);
      toast.error("Error al eliminar la contraseña");
    }
  };

  const restorePassword = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/passwords/${id}/restore`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchPasswords();
      toast.success("Contraseña restaurada");
    } catch (error) {
      console.error("Error restoring password:", error);
      toast.error("Error al restaurar la contraseña");
    }
  };

  const restoreSelectedPasswords = async () => {
    try {
      await fetch(`http://localhost:5000/api/passwords/restore-multiple`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ids: selectedPasswords }),
      });

      fetchPasswords();
      setSelectedPasswords([]);
      toast.success("Contraseñas restauradas exitosamente");
    } catch (error) {
      console.error("Error restoring passwords:", error);
      toast.error("Error al restaurar las contraseñas");
    }
  };

  // Modificar el contenido de la tabla cuando selectedFolder es "trash"
  {
    selectedFolder === "trash" && filteredPasswords.length > 0 && (
      <div className="mb-4">
        <Button
          onClick={restoreSelectedPasswords}
          disabled={selectedPasswords.length === 0}
          variant="outline"
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Restaurar seleccionadas ({selectedPasswords.length})
        </Button>
      </div>
    );
  }

  // Modificar la celda de acciones en la tabla
  <TableCell className="text-right">
    <div className="flex justify-end gap-2">
      {selectedFolder === "trash" ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => restorePassword(entry.id)}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Restaurar
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedPassword(entry);
            setDetailsOpen(true);
          }}
        >
          Ver detalles
        </Button>
      )}
    </div>
  </TableCell>;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPasswords(filteredPasswords.map((p) => p.id));
    } else {
      setSelectedPasswords([]);
    }
  };

  const handleSelectPassword = (id: string) => {
    setSelectedPasswords((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const assignFolderToSelected = async (folderId: string) => {
    try {
      await Promise.all(
        selectedPasswords.map((passwordId) =>
          fetch(`http://localhost:5000/api/passwords/${passwordId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              folder_id: folderId === "none" ? null : folderId,
            }),
          })
        )
      );

      fetchPasswords();
      setSelectedPasswords([]);
      toast.success("Carpetas actualizadas exitosamente");
    } catch (error) {
      console.error("Error updating folders:", error);
      toast.error("Error al actualizar las carpetas");
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestor de Contraseñas</h1>
          <p className="text-muted-foreground">
            Gestiona tus contraseñas de forma segura
          </p>
        </div>

        <Tabs defaultValue="passwords" className="space-y-4">
          <TabsList>
            <TabsTrigger value="passwords">Mis Contraseñas</TabsTrigger>
            <TabsTrigger value="add">Agregar Nueva</TabsTrigger>
            <TabsTrigger value="generator">Generador</TabsTrigger>
          </TabsList>

          <TabsContent value="passwords">
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[600px] rounded-lg border"
            >
              {/* Sidebar */}
              <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <div className="flex flex-col h-full p-4 space-y-4">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder("all")}
                    >
                      <Inbox className="mr-2 h-4 w-4" />
                      Todas
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder("favorites")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Favoritos
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Carpetas</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => setNewFolderInput(true)}
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newFolderInput && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nombre de la carpeta"
                          className="h-8"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value) {
                              addFolder(e.currentTarget.value);
                            }
                          }}
                          autoFocus
                          onBlur={(e) => {
                            if (e.target.value) {
                              addFolder(e.target.value);
                            } else {
                              setNewFolderInput(false);
                            }
                          }}
                        />
                      </div>
                    )}
                    {folders.map((folder) => (
                      <Button
                        key={folder.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {folder.name}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-auto space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder("archived")}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archivadas
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder("trash")}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Papelera
                    </Button>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Contenido principal */}
              <ResizablePanel defaultSize={75}>
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedPasswords.length ===
                              filteredPasswords.length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPasswords(
                                  filteredPasswords.map((p) => p.id)
                                );
                              } else {
                                setSelectedPasswords([]);
                              }
                            }}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Favorito</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPasswords.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPasswords.includes(entry.id)}
                              onCheckedChange={() =>
                                handleSelectPassword(entry.id)
                              }
                              aria-label={`Select ${entry.title}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.title}
                          </TableCell>
                          <TableCell>{entry.username}</TableCell>
                          <TableCell>
                            {entry.url && (
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {entry.url}
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(entry.id)}
                              className={
                                entry.favorite ? "text-yellow-400" : ""
                              }
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  entry.favorite ? "fill-yellow-400" : ""
                                }`}
                              />
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {selectedFolder === "trash" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => restorePassword(entry.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Restaurar
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPassword(entry);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  Ver detalles
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>

          <TabsContent value="add">
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newEntry.title}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={newEntry.username}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, username: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type={showPassword.new ? "text" : "password"}
                      value={newEntry.password}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, password: e.target.value })
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                    >
                      {showPassword.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" onClick={generatePassword}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newEntry.url}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, url: e.target.value })
                    }
                  />
                </div>
                {/* Agregar campo de notas */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, notes: e.target.value })
                    }
                    placeholder="Notas adicionales sobre esta contraseña..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folder">Carpeta</Label>
                  <Select
                    value={newEntry.folder_id}
                    onValueChange={(value) =>
                      setNewEntry({ ...newEntry, folder_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar carpeta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin carpeta</SelectItem>{" "}
                      {/* Cambiado de value="" a "none" */}
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="block">Favorito</Label>
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${
                      newEntry.favorite ? "bg-primary/10" : ""
                    }`}
                    onClick={() =>
                      setNewEntry({ ...newEntry, favorite: !newEntry.favorite })
                    }
                  >
                    <Star
                      className={`h-4 w-4 mr-2 ${
                        newEntry.favorite ? "fill-yellow-400" : ""
                      }`}
                    />
                    {newEntry.favorite ? "Favorito" : "Marcar como favorito"}
                  </Button>
                </div>
              </div>
              <Button onClick={addPassword} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Agregar Contraseña
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="generator">
            <Card className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="length">Longitud</Label>
                  <Input
                    id="length"
                    type="number"
                    min="4"
                    max="32"
                    value={generatorOptions.length}
                    onChange={(e) =>
                      setGeneratorOptions({
                        ...generatorOptions,
                        length: parseInt(e.target.value),
                      })
                    }
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="uppercase"
                      checked={generatorOptions.includeUppercase}
                      onCheckedChange={(checked) =>
                        setGeneratorOptions({
                          ...generatorOptions,
                          includeUppercase: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="uppercase">Incluir mayúsculas</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="lowercase"
                      checked={generatorOptions.includeLowercase}
                      onCheckedChange={(checked) =>
                        setGeneratorOptions({
                          ...generatorOptions,
                          includeLowercase: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="lowercase">Incluir minúsculas</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="numbers"
                      checked={generatorOptions.includeNumbers}
                      onCheckedChange={(checked) =>
                        setGeneratorOptions({
                          ...generatorOptions,
                          includeNumbers: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="numbers">Incluir números</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="symbols"
                      checked={generatorOptions.includeSymbols}
                      onCheckedChange={(checked) =>
                        setGeneratorOptions({
                          ...generatorOptions,
                          includeSymbols: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="symbols">Incluir símbolos</Label>
                  </div>
                </div>
                <Button onClick={generatePassword} className="w-full">
                  Generar Contraseña
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Agregar botón de acción en masa */}
        {selectedPasswords.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {selectedPasswords.length} elementos seleccionados
              </span>
              <Select onValueChange={assignFolderToSelected}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Mover a carpeta..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin carpeta</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <PasswordDetailsSheet
          password={selectedPassword}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onDelete={deletePassword}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </DefaultLayout>
  );
}
