import DefaultLayout from "@/config/layout";
import { useState, useEffect } from "react";
import { Project } from "@/types/projects";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/projects");
      const data = await response.json();
      // Asegurarnos de que data sea un array
      setProjects(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Gestione los proyectos de su empresa
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex gap-4 items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>Cargando proyectos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateProject={fetchProjects}
      />
    </DefaultLayout>
  );
}
