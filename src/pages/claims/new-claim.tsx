import { useState, useEffect } from "react";
import DefaultLayout from "@/config/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NewClaimForm {
  title: string;
  description: string;
  priority: string;
  category: string;
  project_id: number;
}

interface Project {
  id: number;
  name: string;
  code: string;
}

export default function NewClaimPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<NewClaimForm>({
    title: "",
    description: "",
    priority: "",
    category: "",
    project_id: 0,
  });

  useEffect(() => {
    // Cargar proyectos al montar el componente
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/projects");
        if (!response.ok) throw new Error('Error fetching projects');
        const data = await response.json();
        // Asegurarse de que data es un array
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Error al cargar proyectos");
        setProjects([]); // Inicializar como array vacío en caso de error
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          project_id: formData.project_id,
          created_by: userData.id,
          type: "claim",
          status_id: 1, // ID del estado "backlog"
          tags: [formData.category], // Guardar la categoría como tag
        }),
      });

      if (!response.ok) throw new Error("Error al crear el reclamo");

      toast.success("Reclamo creado exitosamente");
      navigate("/tasks");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el reclamo");
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Nuevo Reclamo/Incidencia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="project">Proyecto</Label>
                <Select
                  value={formData.project_id ? formData.project_id.toString() : ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, project_id: parseInt(value) })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(projects) && projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay proyectos disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Describe brevemente el problema"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción detallada</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Explica en detalle el problema que estás experimentando"
                  className="min-h-[150px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Error/Bug</SelectItem>
                      <SelectItem value="feature">Nueva Funcionalidad</SelectItem>
                      <SelectItem value="support">Soporte</SelectItem>
                      <SelectItem value="documentation">Documentación</SelectItem>
                      <SelectItem value="enhancement">Mejora</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Reclamo</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
