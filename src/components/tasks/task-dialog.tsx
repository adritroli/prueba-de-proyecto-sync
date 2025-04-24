import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Task, TaskPriority } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  users: Array<{ id: number; name: string }>;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  users,
}: TaskDialogProps) {
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    story_points: 1,
    assignee: undefined as number | undefined,
    tags: [] as string[],
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (task) {
      setFormData({
        project_id: task.project_id?.toString() || "",
        title: task.title,
        description: task.description,
        priority: task.priority,
        story_points: task.story_points,
        assignee: task.assignee ?? undefined,
        tags: task.tags || [],
      });
    }
    fetchProjects();
  }, [task]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/projects");
      const data = await response.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.project_id) {
      alert("Debe seleccionar un proyecto");
      return;
    }
    // Obtener el ID del usuario desde el estado global o localStorage
    const userId = localStorage.getItem('userId'); // o usar tu manejador de estado

    await onSave({ 
      ...formData, 
      project_id: parseInt(formData.project_id),
      userId: parseInt(userId || '1') // Asegúrate de manejar el caso donde no hay userId
    });
    onOpenChange(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Proyecto</Label>
            <Select
              value={formData.project_id}
              onValueChange={(v) => setFormData({ ...formData, project_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
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
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Agregar tag..."
              />
              <Button type="button" onClick={handleAddTag}>
                Agregar
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tags: formData.tags.filter((t) => t !== tag),
                    })
                  }
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) =>
                  setFormData({ ...formData, priority: v as TaskPriority })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Story Points</Label>
              <Input
                type="number"
                value={formData.story_points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    story_points: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Asignado a</Label>
            <Select
              value={formData.assignee?.toString()}
              onValueChange={(v) =>
                setFormData({ ...formData, assignee: parseInt(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario" />
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
          <Button onClick={handleSubmit}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
