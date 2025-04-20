import DefaultLayout from "@/config/layout";
import { IoCloseSharp } from "react-icons/io5";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiDotsThreeOutlineFill } from "react-icons/pi";

import { useState, useEffect } from "react";
import { Task, Sprint } from "@/types/tasks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export default function SprintActivoPage() {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveSprint();
    fetchTaskStatuses();
    fetchUsers();
  }, []);

  const fetchActiveSprint = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints/active");
      const sprintData = await response.json();
      setSprint(sprintData.sprint);
      setTasks(sprintData.tasks);
    } catch (error) {
      console.error("Error fetching active sprint:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStatuses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/task-status");
      const data = await response.json();
      setTaskStatuses(data);
    } catch (error) {
      console.error("Error fetching task statuses:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCompleteSprint = async () => {
    try {
      await fetch(`http://localhost:5000/api/sprints/${sprint?.id}/complete`, {
        method: "PUT",
      });
      window.location.href = "/backlog/sprintCerrado";
    } catch (error) {
      console.error("Error completing sprint:", error);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      await fetch(`http://localhost:5000/api/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchActiveSprint(); // Recargar datos después de la actualización
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status_name === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return <DefaultLayout>Cargando...</DefaultLayout>;
  }

  if (!sprint) {
    return (
      <DefaultLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No hay sprint activo</h1>
          <Button onClick={() => (window.location.href = "/backlog")}>
            Ir al Backlog
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div>
        <div className="flex justify-between items-center mb-4 p-2">
          <h1>Gestion de Sprints</h1>
        </div>
        {/* Agregar filtros antes del Accordion */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="review">En Review</SelectItem>
              <SelectItem value="done">Completado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="py-0 pr-2 tarjeta-sprint ">
          <Accordion type="single" className="acordeon-sprint px-2" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex flex-row justify-between items-center w-full px-2">
                  <div className="flex flex-row gap-4 items-center">
                    <p className="font-semibold">{sprint.name}</p>
                    <div className="flex flex-row gap-2">
                      <span className="text-sm text-muted-foreground">
                        Inicio:{" "}
                        {new Date(sprint.start_date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Fin: {new Date(sprint.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground"> </span>
                      <Badge variant="secondary">
                        {tasks.filter((t) => t.sprint_id === sprint.id).length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 items-center">
                    <Badge
                      variant={
                        sprint.status === "active" ? "default" : "secondary"
                      }
                      className={
                        sprint.status === "active"
                          ? "bg-green-500"
                          : sprint.status === "completed"
                          ? "bg-blue-500"Head>
                          : "bg-yellow-500"
                      }ad>
                    >
                      {sprint.status === "active"
                        ? "Activo"d>Acciones</TableHead>
                        : sprint.status === "completed"
                        ? "Completado"er>
                        : "Planificado"}
                    </Badge>ks.length === 0 ? (
                    <div>
                      <DropdownMenu> py-8">
                        <DropdownMenuTrigger>eas que coincidan con los filtros
                          <div className="flex items-center justify-center w-6 h-6  cursor-pointer">ll>
                            <PiDotsThreeOutlineFill />ableRow>
                          </div>
                        </DropdownMenuTrigger>> (
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Acciones Sprint</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Button onClick={handleCompleteSprint}>
                              Completar SprintoundColor: task.project_badge_color || "#4B5563",
                            </Button>: "white"
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu> {task.task_key}
                    </div>
                  </div>l>
                </div>task.title}</TableCell>
              </AccordionTrigger>className="max-w-[200px] truncate">
              <AccordionContent className="px-0 m-0 w-full">
                <div className="mt-4">
                  <Table className="tabla-sprint">>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>Change={(value) =>
                        <TableHead>Descripción</TableHead>k(task.id, {
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead>Asignado</TableHead>
                        <TableHead>Acciones</TableHead>tTrigger className="w-[140px]">
                      </TableRow>
                    </TableHeader>
                    <TableBody>or: task.status_color }}
                      {filteredTasks.length === 0 ? (
                        <TableRow>sk.status_name}
                          <TableCell colSpan={7} className="text-center py-8">Badge>
                            No hay tareas que coincidan con los filtros  </SelectValue>
                          </TableCell>Trigger>
                        </TableRow>Content>
                      ) : (skStatuses.map((status) => (
                        filteredTasks.map((task) => (
                          <TableRow key={task.id}>={status.id}
                            <TableCell className="font-medium">.toString()}
                              {task.title}
                            </TableCell>le={{ backgroundColor: status.color }}>
                            <TableCell className="max-w-[200px] truncate">
                              {task.description}/Badge>
                            </TableCell>
                            <TableCell>
                              <BadgectContent>
                                style={{ backgroundColor: task.status_color }}
                              >
                                {task.status_name}
                              </Badge>
                            </TableCell>.priority}
                            <TableCell>eChange={(value) =>
                              <Badge className={priorityColors[task.priority]}>andleUpdateTask(task.id, {
                                {task.priority}  priority: value as TaskPriority,
                              </Badge>   })
                            </TableCell>
                            <TableCell>{task.story_points}</TableCell>
                            <TableCell>rigger className="w-[120px]">
                              {task.assignee && (lectValue>
                                <div className="flex items-center gap-2">          <Badge className={priorityColors[task.priority]}>
                                  <Avatar className="h-6 w-6">              {task.priority}
                                    <AvatarImage    </Badge>
                                      src={`/avatars/${task.assignee}.png`}        </SelectValue>
                                    />          </SelectTrigger>
                                    <AvatarFallback>U</AvatarFallback>SelectContent>
                                  </Avatar>      <SelectItem value="low">Baja</SelectItem>
                                  <span className="text-sm">            <SelectItem value="medium">Media</SelectItem>
                                    {task.assignee_name}                   <SelectItem value="high">Alta</SelectItem>
                                  </span>                      <SelectItem value="urgent">Urgente</SelectItem>
                                </div>            </SelectContent>
                              )}                          </Select>
                            </TableCell>                           </TableCell>
                            <TableCell>                            <TableCell>{task.story_points}</TableCell>

















































































}  );    </DefaultLayout>      </div>        </Card>          </Accordion>            </AccordionItem>              </AccordionContent>                </div>                  </Table>                    </TableBody>                      )}                        ))                          </TableRow>                            </TableCell>                              </Button>                                <IoCloseSharp className="text-red-500" />                              >                                }}                                  }                                    );                                      error                                      "Error removing task from sprint:",                                    console.error(                                  } catch (error) {                                    fetchActiveSprint();                                    );                                      }                                        method: "PUT",                                      {                                      `http://localhost:5000/api/tasks/${task.id}/remove-from-sprint`,                                    await fetch(                                  try {                                onClick={async () => {                                size="sm"                                variant="ghost"                              <Button                            <TableCell>                            </TableCell>                              </Select>                                </SelectContent>                                  ))}                                    </SelectItem>                                      </div>                                        {user.name}                                        </Avatar>                                          <AvatarFallback>{user.name[0]}</AvatarFallback>                                          <AvatarImage src={user.avatar} />                                        <Avatar className="h-6 w-6">                                      <div className="flex items-center gap-2">                                    <SelectItem key={user.id} value={user.id.toString()}>                                  {users.map((user) => (                                  <SelectItem value="_none">Sin asignar</SelectItem>                                <SelectContent>                                </SelectTrigger>                                  </SelectValue>                                    )}                                      "Sin asignar"                                    ) : (                                      </div>

















}  );    </DefaultLayout>      </div>        </Card>          </Accordion>            </AccordionItem>              </AccordionContent>                </div>                  </Table>                    </TableBody>                      )}                        ))                          </TableRow>                            </TableCell>                              </Button>                                <IoCloseSharp className="text-red-500" />                              >                                }}                                  }                                    );                                      error                                      "Error removing task from sprint:",                                    console.error(                                  } catch (error) {                                    fetchActiveSprint();                                    );                                      }                                        method: "PUT",                                      {                                      `http://localhost:5000/api/tasks/${task.id}/remove-from-sprint`,                                    await fetch(                                  try {                                onClick={async () => {                                size="sm"                                variant="ghost"                              <Button                            <TableCell>
                              <Select
                                value={task.assignee?.toString() || "_none"}
                                onValueChange={(value) =>
                                  handleUpdateTask(task.id, {
                                    assignee: value === "_none" ? null : parseInt(value),
                                  })
                                }
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue>
                                    {task.assignee ? (
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={`/avatars/${task.assignee}.png`} />
                                          <AvatarFallback>
                                            {task.assignee_name?.[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{task.assignee_name}</span>