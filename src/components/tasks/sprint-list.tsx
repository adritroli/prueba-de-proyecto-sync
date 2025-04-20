import { Sprint, Task } from "@/types/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Pause } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Agregar la definición de priorityColors
const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

interface SprintListProps {
  sprints: Sprint[];
  tasks: Task[];
  onActivateSprint: (sprintId: number) => void;
  onCompleteSprint: (sprintId: number) => void;
}

const getSprintStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <PlayCircle className="h-4 w-4 text-green-500" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <Pause className="h-4 w-4 text-yellow-500" />;
  }
};

const handleRemoveFromSprint = async (taskId: number) => {
  try {
    await fetch(
      `http://localhost:5000/api/tasks/${taskId}/remove-from-sprint`,
      {
        method: "PUT",
      }
    );
    // Recargar los datos después de remover
    window.location.reload();
  } catch (error) {
    console.error("Error removing task from sprint:", error);
  }
};

export function SprintList({
  sprints,
  tasks,
  onActivateSprint,
  onCompleteSprint,
}: SprintListProps) {
  const activeSprint = sprints.find((sprint) => sprint.status === "active");

  return (
    <div className="space-y-6">
      {/* Sprint Activo */}
      {activeSprint && (
        <Card>
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{activeSprint.name}</CardTitle>
                <Badge
                  variant={
                    activeSprint.status === "active" ? "default" : "secondary"
                  }
                >
                  {getSprintStatusIcon(activeSprint.status)}
                  <span className="ml-1">{activeSprint.status}</span>
                </Badge>
              </div>
              <div className="flex gap-2">
                {activeSprint.status === "planned" && (
                  <Button
                    size="sm"
                    onClick={() => onActivateSprint(activeSprint.id)}
                  >
                    Iniciar Sprint
                  </Button>
                )}
                {activeSprint.status === "active" && (
                  <Button
                    size="sm"
                    onClick={() => onCompleteSprint(activeSprint.id)}
                  >
                    Completar Sprint
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {activeSprint.goal}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              <span>
                Inicio: {new Date(activeSprint.start_date).toLocaleDateString()}
              </span>
              <span>
                Fin: {new Date(activeSprint.end_date).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks
                  .filter((task) => task.sprint_id === activeSprint.id)
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: task.status_color }}>
                          {task.status_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.story_points}</TableCell>
                      <TableCell>
                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`/avatars/${task.assignee}.png`}
                              />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {task.assignee_name}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromSprint(task.id)}
                        >
                          Quitar del Sprint
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Otros Sprints */}
      {sprints
        .filter((sprint) => sprint.status !== "active")
        .map((sprint) => {
          const sprintTasks = tasks.filter(
            (task) => task.sprint_id === sprint.id
          );

          return (
            <Card key={sprint.id}>
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{sprint.name}</CardTitle>
                    <Badge
                      variant={
                        sprint.status === "active" ? "default" : "secondary"
                      }
                    >
                      {getSprintStatusIcon(sprint.status)}
                      <span className="ml-1">{sprint.status}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {sprint.status === "planned" && (
                      <Button
                        size="sm"
                        onClick={() => onActivateSprint(sprint.id)}
                      >
                        Iniciar Sprint
                      </Button>
                    )}
                    {sprint.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => onCompleteSprint(sprint.id)}
                      >
                        Completar Sprint
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {sprint.goal}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                  <span>
                    Inicio: {new Date(sprint.start_date).toLocaleDateString()}
                  </span>
                  <span>
                    Fin: {new Date(sprint.end_date).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {sprintTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
