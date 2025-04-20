import DefaultLayout from "@/config/layout";
import { IoCloseSharp } from "react-icons/io5";
import { FiX } from "react-icons/fi";

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
import { Task, Sprint, TaskPriority } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [statuses, setStatuses] = useState<
    { id: number; name: string; color: string }[]
  >([]);
  const [editingTask, setEditingTask] = useState<{
    id: number | null;
    field: "status" | "priority" | "assignee" | null;
  }>({ id: null, field: null });

  const getAvatarUrl = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.avatar || `/avatars/${userId}.png`;
  };

  useEffect(() => {
    fetchActiveSprint();
    fetchUsers();
    fetchStatuses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/task-status");
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

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

  const handleCompleteSprint = async () => {
    try {
      await fetch(`http://localhost:5000/api/sprints/${sprint?.id}/complete`, {
        method: "PUT",
      });
      window.location.href = "/sprintCerrado";
    } catch (error) {
      console.error("Error completing sprint:", error);
    }
  };

  const handleUpdateTask = async (
    taskId: number,
    field: string,
    value: string | number | null
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updateData: {
        title: string;
        description: string;
        priority: TaskPriority;
        story_points: number;
        assignee: number | null | undefined;
        sprint_id: number | null | undefined;
        tags: string[];
        status_id?: number;
      } = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        story_points: task.story_points,
        assignee: task.assignee,
        sprint_id: task.sprint_id,
        tags: task.tags || [],
      };

      switch (field) {
        case "status_id":
          updateData.status_id = value as number;
          break;
        case "priority":
          updateData.priority = value as TaskPriority;
          break;
        case "assignee":
          updateData.assignee = value as number | null;
          break;
      }

      await fetch(`http://localhost:5000/api/task/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      fetchActiveSprint();
      setEditingTask({ id: null, field: null });
    } catch (error) {
      console.error(`Error updating task ${field}:`, error);
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
                    <Badge variant="secondary">
                      {tasks.filter((t) => t.sprint_id === sprint.id).length}
                    </Badge>
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
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }
                    >
                      {sprint.status === "active"
                        ? "Activo"
                        : sprint.status === "completed"
                        ? "Completado"
                        : "Planificado"}
                    </Badge>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center justify-center w-6 h-6 cursor-pointer rounded hover:bg-muted">
                            <PiDotsThreeOutlineFill />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Acciones Sprint</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleCompleteSprint}>
                            Completar Sprint
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 m-0 w-full">
                <div className="mt-4">
                  <Table className="tabla-sprint">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clave</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead>Asignado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No hay tareas que coincidan con los filtros
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">
                              {task.task_key}
                            </TableCell>
                            <TableCell className="font-medium">
                              {task.title}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {task.description}
                            </TableCell>
                            <TableCell>
                              {editingTask.id === task.id &&
                              editingTask.field === "status" ? (
                                <div className="flex items-center gap-2">
                                  <Select
                                    defaultValue={String(task.status_id)}
                                    onValueChange={(value) =>
                                      handleUpdateTask(
                                        task.id,
                                        "status_id",
                                        parseInt(value)
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statuses.map((status) => (
                                        <SelectItem
                                          key={status.id}
                                          value={String(status.id)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{
                                                backgroundColor: status.color,
                                              }}
                                            ></div>
                                            {status.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FiX
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() =>
                                      setEditingTask({ id: null, field: null })
                                    }
                                  />
                                </div>
                              ) : (
                                <Badge
                                  style={{ backgroundColor: task.status_color }}
                                  className="cursor-pointer hover:opacity-80"
                                  onClick={() =>
                                    setEditingTask({
                                      id: task.id,
                                      field: "status",
                                    })
                                  }
                                >
                                  {task.status_name}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingTask.id === task.id &&
                              editingTask.field === "priority" ? (
                                <div className="flex items-center gap-2">
                                  <Select
                                    defaultValue={task.priority}
                                    onValueChange={(value) =>
                                      handleUpdateTask(
                                        task.id,
                                        "priority",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Baja</SelectItem>
                                      <SelectItem value="medium">
                                        Media
                                      </SelectItem>
                                      <SelectItem value="high">Alta</SelectItem>
                                      <SelectItem value="urgent">
                                        Urgente
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FiX
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() =>
                                      setEditingTask({ id: null, field: null })
                                    }
                                  />
                                </div>
                              ) : (
                                <Badge
                                  className={`${priorityColors[task.priority]} cursor-pointer hover:opacity-80`}
                                  onClick={() =>
                                    setEditingTask({
                                      id: task.id,
                                      field: "priority",
                                    })
                                  }
                                >
                                  {task.priority}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{task.story_points}</TableCell>
                            <TableCell>
                              {editingTask.id === task.id &&
                              editingTask.field === "assignee" ? (
                                <div className="flex items-center gap-2">
                                  <Select
                                    defaultValue={
                                      task.assignee
                                        ? String(task.assignee)
                                        : "_none"
                                    }
                                    onValueChange={(value) =>
                                      handleUpdateTask(
                                        task.id,
                                        "assignee",
                                        value === "_none"
                                          ? null
                                          : parseInt(value)
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="_none">
                                        Sin asignar
                                      </SelectItem>
                                      {Array.isArray(users) &&
                                        users.map((user) => (
                                          <SelectItem
                                            key={user.id}
                                            value={String(user.id)}
                                          >
                                            <div className="flex items-center gap-2">
                                              <Avatar className="h-6 w-6">
                                                <AvatarImage
                                                  src={getAvatarUrl(user.id)}
                                                />
                                                <AvatarFallback>
                                                  {user.name[0]}
                                                </AvatarFallback>
                                              </Avatar>
                                              {user.name}
                                            </div>
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <FiX
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() =>
                                      setEditingTask({ id: null, field: null })
                                    }
                                  />
                                </div>
                              ) : (
                                <div
                                  className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                                  onClick={() =>
                                    setEditingTask({
                                      id: task.id,
                                      field: "assignee",
                                    })
                                  }
                                >
                                  {task.assignee ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={getAvatarUrl(task.assignee)}
                                        />
                                        <AvatarFallback>
                                          {task.assignee_name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {task.assignee_name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      Sin asignar
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await fetch(
                                      `http://localhost:5000/api/tasks/${task.id}/remove-from-sprint`,
                                      {
                                        method: "PUT",
                                      }
                                    );
                                    fetchActiveSprint();
                                  } catch (error) {
                                    console.error(
                                      "Error removing task from sprint:",
                                      error
                                    );
                                  }
                                }}
                              >
                                <IoCloseSharp className="text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </DefaultLayout>
  );
}
