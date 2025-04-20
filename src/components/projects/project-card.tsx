import { Project } from "@/types/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = project.tasks_count
    ? ((project.completed_tasks || 0) / project.tasks_count) * 100
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Código: {project.code}
            </p>
          </div>
          <Badge
            variant={project.status === "active" ? "default" : "secondary"}
            className={
              project.status === "active"
                ? "bg-green-500"
                : project.status === "completed"
                ? "bg-blue-500"
                : "bg-yellow-500"
            }
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {project.description}
        </p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tareas: {project.tasks_count || 0}</span>
            <span>Equipo: {project.team_name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
