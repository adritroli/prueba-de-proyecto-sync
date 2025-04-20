import DefaultLayout from "@/config/layout";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ReclamosPage() {
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    story_points: 1,
    assignee: undefined as number | undefined,
    tags: [] as string[],
  });
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);
  const [tagInput, setTagInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/task");
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/projects");
      const data = await response.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
      toast.error("Debe seleccionar un proyecto");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/tasks-newtask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          project_id: parseInt(formData.project_id),
          type: "claim",
        }),
      });

      if (!response.ok) throw new Error("Error al crear el reclamo");

      toast.success("Reclamo creado exitosamente");
      // Limpiar formulario
      setFormData({
        project_id: "",
        title: "",
        description: "",
        priority: "medium",
        story_points: 1,
        assignee: undefined,
        tags: [],
      });
      // Recargar lista de reclamos
      fetchTasks();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el reclamo");
    }
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
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Crear Nuevo Reclamo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
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
              <div className="flex justify-end gap-2">
                <Button type="submit">Guardar Reclamo</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Reclamos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {tasks.filter(task => task.type === 'claim').map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                    <Badge variant={task.priority}>{task.priority}</Badge>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {task.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}

