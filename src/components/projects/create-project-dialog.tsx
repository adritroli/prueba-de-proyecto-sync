import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
}: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    code: "", // Agregar campo code
    name: "",
    description: "",
    team_id: "",
    manager_id: "",
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchTeamsAndUsers();
    }
  }, [open]);

  const fetchTeamsAndUsers = async () => {
    const [teamsRes, usersRes] = await Promise.all([
      fetch("http://localhost:5000/api/teams"),
      fetch("http://localhost:5000/api/users"),
    ]);
    const teamsData = await teamsRes.json();
    const usersData = await usersRes.json();
    setTeams(teamsData);
    setUsers(usersData.data);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code) {
        // Si no se ingresó un código, generarlo a partir del nombre
        const generatedCode = formData.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase();
        setFormData((prev) => ({ ...prev, code: generatedCode }));
      }

      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code, // Incluir el código en el body
          name: formData.name,
          description: formData.description,
          team_id: parseInt(formData.team_id),
          manager_id: parseInt(formData.manager_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "DUPLICATE_CODE") {
          // Si el código está duplicado, agregar un número al final
          const newCode = `${formData.code}${Math.floor(Math.random() * 100)}`;
          setFormData((prev) => ({ ...prev, code: newCode }));
          throw new Error("Código duplicado. Intente con: " + newCode);
        }
        throw new Error(errorData.message);
      }

      onCreateProject();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Código del Proyecto</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="Ej: PROJ1, DEV, BE"
              maxLength={10}
            />
            <p className="text-sm text-muted-foreground">
              Si no se ingresa un código, se generará automáticamente
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Proyecto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Equipo</Label>
            <Select
              value={formData.team_id}
              onValueChange={(v) => setFormData({ ...formData, team_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Project Manager</Label>
            <Select
              value={formData.manager_id}
              onValueChange={(v) => setFormData({ ...formData, manager_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar manager" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Crear Proyecto</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
