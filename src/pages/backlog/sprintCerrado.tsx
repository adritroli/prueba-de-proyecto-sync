import DefaultLayout from "@/config/layout";
import { useState, useEffect } from "react";
import { Task, Sprint, TaskPriority } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";

export default function SprintCerrado() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [users, setUsers] = useState<{ id: number; name: string; avatar: string }[]>([]);
  const [statuses, setStatuses] = useState<{
    id: number;
    name: string;
    color: string;
  }[]>([]);
  const [editingTask, setEditingTask] = useState<{
    id: number | null;
    field: "status" | "priority" | "assignee" | null;
  }>({ id: null, field: null });
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    fetchCompletedSprints();
    fetchUsers();
    fetchStatuses();
    fetchActiveSprint();
  }, []);

  const fetchCompletedSprints = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints/completed");
      if (!response.ok) {
        throw new Error("Error al obtener los sprints completados");
      }
      const data = await response.json();
      setSprints(data.sprints || []);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching completed sprints:", error);
      toast.error("Error al cargar los sprints completados");
      setSprints([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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
      setStatuses(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setStatuses([]);
    }
  };

  const fetchActiveSprint = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints/active");
      const data = await response.json();
      setActiveSprint(data.sprint);
    } catch (error) {
      console.error("Error fetching active sprint:", error);
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

      const updateData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        story_points: task.story_points,
        assignee: task.assignee,
        sprint_id: task.sprint_id,
        tags: task.tags || [],
        status_id: task.status_id,
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

      await fetch(`http://localhost:5000/api/task/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      fetchCompletedSprints();
      setEditingTask({ id: null, field: null });
    } catch (error) {
      console.error(`Error updating task ${field}:`, error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleMoveToBacklog = async () => {
    try {
      await fetch(`http://localhost:5000/api/tasks/move-to-backlog`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskIds: Array.from(selectedTasks)
        })
      });
      
      toast.success("Tareas movidas al backlog exitosamente");
      fetchCompletedSprints();
      setSelectedTasks(new Set());
    } catch (error) {
      console.error("Error moving tasks to backlog:", error);
      toast.error("Error al mover las tareas");
    }
  };

  const handleMoveToActiveSprint = async () => {
    if (!activeSprint) {
      toast.error("No hay sprint activo");
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/tasks/assign-to-sprint`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskIds: Array.from(selectedTasks),
          sprintId: activeSprint.id
        })
      });
      
      toast.success("Tareas movidas al sprint activo exitosamente");
      fetchCompletedSprints();
      setSelectedTasks(new Set());
    } catch (error) {
      console.error("Error moving tasks to active sprint:", error);
      toast.error("Error al mover las tareas");
    }
  };

  const filteredTasks = (sprintId: number) => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || task.status_name === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const belongsToSprint = task.sprint_id === sprintId;

      return matchesSearch && matchesStatus && matchesPriority && belongsToSprint;
    });
  };

  if (loading) {
    return <DefaultLayout>Cargando...</DefaultLayout>;
  }

  return (
    <DefaultLayout>
      <div>
        <div className="flex justify-between items-center mb-4 p-2">
          <h1 className="text-2xl font-bold">Sprints Completados</h1>
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

          {selectedTasks.size > 0 && (
            <div className="flex gap-2">
              <Button onClick={handleMoveToBacklog}>
                Mover al Backlog ({selectedTasks.size})
              </Button>
              {activeSprint && (
                <Button onClick={handleMoveToActiveSprint}>
                  Mover a Sprint Activo ({selectedTasks.size})
                </Button>
              )}
            </div>
          )}
        </div>

        {sprints.map((sprint) => (
          <Card key={sprint.id} className="mb-4 py-0 pr-2">
            <Accordion type="single" className="px-2" collapsible>
              <AccordionItem value={`sprint-${sprint.id}`}>
                <AccordionTrigger>
                  <div className="flex flex-row justify-between items-center w-full px-2">
                    <div className="flex flex-row gap-4 items-center">
                      <p className="font-semibold">{sprint.name}</p>
                      <div className="flex flex-row gap-2">
                        <span className="text-sm text-muted-foreground">
                          Inicio: {new Date(sprint.start_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Fin: {new Date(sprint.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {filteredTasks(sprint.id).length} tareas
                      </Badge>
                    </div>
                    <Badge className="bg-blue-500">Completado</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Checkbox
                              checked={selectedTasks.size === filteredTasks(sprint.id).length}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedTasks);
                                if (checked) {
                                  filteredTasks(sprint.id).forEach(t => newSelected.add(t.id));
                                } else {
                                  filteredTasks(sprint.id).forEach(t => newSelected.delete(t.id));
                                }
                                setSelectedTasks(newSelected);
                              }}
                            />
                          </TableHead>
                          <TableHead>Clave</TableHead>
                          <TableHead>Title & Descriptions</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Prioridad</TableHead>
                          <TableHead>Puntos</TableHead>
                          <TableHead>Asignado</TableHead>
                          <TableHead>Ultima Modificacion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks(sprint.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No hay tareas que coincidan con los filtros
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTasks(sprint.id).map((task) => (
                            <TableRow key={task.id}>
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
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: task.project_color }}
                                  />
                                  {task.task_key}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                <div className="flex flex-col">
                                  <p>{task.title}</p>
                                  {task.description}
                                </div>
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
                                    className={`cursor-pointer hover:opacity-80 ${
                                      task.priority === "urgent"
                                        ? "bg-red-500"
                                        : task.priority === "high"
                                        ? "bg-orange-500"
                                        : task.priority === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-blue-500"
                                    }`}
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
                                      <SelectTrigger className="w-[150px]">
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
                                                    src={
                                                      user.avatar ||
                                                      `/avatars/${user.id}.png`
                                                    }
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
                                            src={`/avatars/${task.assignee}.png`}
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
                                      <span className="text-sm text-muted-foreground">
                                        Sin asignar
                                      </span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{task.updated_at}</TableCell>
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
        ))}

        {sprints.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay sprints completados</p>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/tasks")}
            >
              Ir al Backlog
            </Button>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
