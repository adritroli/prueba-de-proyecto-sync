import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ProjectSummaryData {
  id: number;
  name: string;
  progress: number;
  tasksCount: number;
}

interface ProjectSummaryWidgetProps {
  data: ProjectSummaryData[];
}

export function ProjectSummaryWidget({ data }: ProjectSummaryWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data?.length) return null;

  return (
    <Card className="col-span-full p-3 space-y-1 rounded-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Resumen de Proyectos</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {data.map((project) => (
            <div key={`project-${project.id}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">{project.name}</p>
                <span className="text-sm text-muted-foreground">
                  {project.tasksCount} tareas
                </span>
              </div>
              <Progress value={Math.round(project.progress)} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
