import DefaultLayout from "@/config/layout";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, Sprint, TaskPriority } from "@/types/tasks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SprintList } from "@/components/tasks/sprint-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { CreateSprintDialog } from "@/components/tasks/create-sprint-dialog"; // Ensure this path is correct
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedFilter } from "@/components/filters/advanced-filter";

interface PaginatedResponse {
  data: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function TasksPage() {
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [tasks, setTasks] = useState<(Task & { assignee_name?: string })[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterConfig>({});
  const activeSprint = sprints.find((sprint) => sprint.status === "active");

  const fetchTasksAndSprints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      // Agregar filtros avanzados a los parámetros
      if (filters.dateRange?.from) {
        params.append("dateFrom", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.append("dateTo", filters.dateRange.to.toISOString());
      }
      if (filters.priority?.length) {
        filters.priority.forEach((p) => params.append("priority", p));
      }
      if (filters.status?.length) {
        filters.status.forEach((s) => params.append("status", s));
      }
      if (filters.assignee?.length) {
        filters.assignee.forEach((a) =>
          params.append("assignee", a.toString())
        );
      }
      if (filters.storyPoints?.min) {
        params.append("storyPointsMin", filters.storyPoints.min.toString());
      }
      if (filters.storyPoints?.max) {
        params.append("storyPointsMax", filters.storyPoints.max.toString());
      }

      const [tasksRes, sprintsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/task?${params}`),
        fetch("http://localhost:5000/api/sprints"),
      ]);

      const tasksData = await tasksRes.json();
      const sprintsData = await sprintsRes.json();

      console.log("Tasks received:", tasksData);
      console.log("Sprints received:", sprintsData);

      // Filtrar tareas que no están en ningún sprint
      const filteredTasks = tasksData.data.filter(
        (task: Task) => !task.sprint_id
      );

      setTasks(filteredTasks);
      setSprints(sprintsData);
      setTotalPages(tasksData.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndSprints();
  }, [page, search, filters]);

  // Añadir efecto para cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        const data = await response.json();
        setUsers(data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateSprint = async (sprintData: any) => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sprintData),
      });

      if (response.ok) {
        fetchTasksAndSprints();
      }
    } catch (error) {
      console.error("Error creating sprint:", error);
    }
  };

  const handleActivateSprint = async (sprintId: number) => {
    try {
      await fetch(`http://localhost:5000/api/sprints/${sprintId}/activate`, {
        method: "PUT",
      });
      fetchTasksAndSprints();
    } catch (error) {
      console.error("Error activating sprint:", error);
    }
  };

  const handleCompleteSprint = async (sprintId: number) => {
    try {
      await fetch(`http://localhost:5000/api/sprints/${sprintId}/complete`, {
        method: "PUT",
      });
      fetchTasksAndSprints();
    } catch (error) {
      console.error("Error completing sprint:", error);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      const method = selectedTask ? "PUT" : "POST";
      const url = selectedTask
        ? `http://localhost:5000/api/task/${selectedTask.id}`
        : "http://localhost:5000/api/task";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        fetchTasksAndSprints();
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleAssignToSprint = async () => {
    if (!activeSprint || selectedTasks.size === 0) {
      toast.error("No hay sprint activo o no hay tareas seleccionadas");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/assign-to-sprint`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskIds: Array.from(selectedTasks),
            sprintId: activeSprint.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Tareas asignadas al sprint exitosamente");
      fetchTasksAndSprints();
      setSelectedTasks(new Set());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al asignar tareas"
      );
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      // Encontrar la tarea actual en el estado
      const currentTask = tasks.find((t) => t.id === taskId);
      if (!currentTask) {
        throw new Error("Tarea no encontrada");
      }

      // Log para debugging
      console.log("Updating task:", taskId, "with data:", updates);

      const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Mantener los datos existentes y combinar con las actualizaciones
          title: currentTask.title,
          description: currentTask.description,
          priority: updates.priority || currentTask.priority,
          story_points: currentTask.story_points,
          assignee: updates.assignee ?? currentTask.assignee,
          sprint_id: updates.sprint_id ?? currentTask.sprint_id,
          status_id: updates.status_id || currentTask.status_id,
          project_id: currentTask.project_id,
          tags: currentTask.tags || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la tarea");
      }

      await fetchTasksAndSprints();
      toast.success("Tarea actualizada correctamente");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar la tarea"
      );
    }
  };

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Backlog</h1>
          <p className="text-muted-foreground">
            Gestione las tareas y sprints del proyecto
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedTask(undefined);
              setCreateTaskOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
          <Button variant="outline" onClick={() => setCreateSprintOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Sprint
          </Button>
        </div>
      </div>

      <Tabs defaultValue="backlog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
        </TabsList>
        <TabsContent value="backlog" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <AdvancedFilter
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setPage(1);
              }}
              statuses={[
                { id: "backlog", name: "Backlog" },
                { id: "todo", name: "To Do" },
                { id: "in_progress", name: "En Progreso" },
                { id: "review", name: "En Review" },
                { id: "done", name: "Completado" },
              ]}
              users={users}
            />
          </div>

          <div className="flex justify-between mb-4">
            <div className="flex gap-2 items-center">
              {selectedTasks.size > 0 && activeSprint && (
                <Button onClick={handleAssignToSprint}>
                  Asignar al Sprint Activo ({selectedTasks.size})
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Prioridad</TableHead>
                  {/* <TableHead>Puntos</TableHead> */}
                  <TableHead>Sprint</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Asignado</TableHead>
                  {/* <TableHead>Fecha Creación</TableHead> */}
                  <TableHead>
                    <Checkbox
                      checked={selectedTasks.size === tasks.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(new Set(tasks.map((t) => t.id)));
                        } else {
                          setSelectedTasks(new Set());
                        }
                      }}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando tareas...
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron tareas
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        {task.project_code}-{task.task_number}
                      </TableCell>
                      <TableCell>{task.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {task.description}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.priority}
                          onValueChange={(value) =>
                            handleUpdateTask(task.id, {
                              priority: value as TaskPriority,
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>
                              <Badge
                                className={
                                  task.priority === "urgent"
                                    ? "bg-red-500"
                                    : task.priority === "high"
                                    ? "bg-orange-500"
                                    : task.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }
                              >
                                {task.priority}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {/* <TableCell>{task.story_points}</TableCell> */}

                      <TableCell>
                        <Select
                          value={task.sprint_id?.toString() || "_none"}
                          onValueChange={(value) =>
                            handleUpdateTask(task.id, {
                              sprint_id:
                                value !== "_none" ? parseInt(value) : null,
                            })
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Sin sprint" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">Sin sprint</SelectItem>
                            {sprints.map((sprint) => (
                              <SelectItem
                                key={sprint.id}
                                value={sprint.id.toString()}
                              >
                                {sprint.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.assignee?.toString() || "_none"}
                          onValueChange={(value) =>
                            handleUpdateTask(task.id, {
                              assignee:
                                value !== "_none" ? parseInt(value) : null,
                            })
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue>
                              {task.assignee ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={`/avatars/${task.assignee}.png`}
                                    />
                                    <AvatarFallback>
                                      {task.assignee_name?.[0] || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">
                                    {task.assignee_name}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>?</AvatarFallback>
                                  </Avatar>
                                  <span>Sin asignar</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                                <span>Sin asignar</span>
                              </div>
                            </SelectItem>
                            {users.map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={
                                        user.avatar || `/avatars/${user.id}.png`
                                      }
                                    />
                                    <AvatarFallback>
                                      {user.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{user.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {/* <TableCell className="text-sm text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString()}
                      </TableCell> */}
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedTasks);
                            if (checked) {
                              newSelected.add(task.id);
                            } else {
                              newSelected.delete(task.id);
                            }
                            setSelectedTasks(newSelected);
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTask(task);
                                setCreateTaskOpen(true);
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                /* handle delete */
                              }}
                              className="text-red-600"
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <LiaAngleLeftSolid />
            </Button>
            <div className="text-sm">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <LiaAngleRightSolid />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="sprints" className="border rounded-md p-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Cargando sprints...</p>
              </div>
            ) : (
              <SprintList
                sprints={sprints}
                tasks={tasks}
                onActivateSprint={handleActivateSprint}
                onCompleteSprint={handleCompleteSprint}
              />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        task={selectedTask}
        onSave={handleSaveTask}
        users={[]} // Add users data here
      />
      <CreateSprintDialog
        open={createSprintOpen}
        onOpenChange={setCreateSprintOpen}
        onCreateSprint={handleCreateSprint}
      />
    </DefaultLayout>
  );
}
