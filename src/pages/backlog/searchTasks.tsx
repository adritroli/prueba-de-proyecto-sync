import DefaultLayout from "@/config/layout";
import { useState, useEffect } from "react";
import { Task } from "@/types/tasks";
import { FiX } from "react-icons/fi";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import { SearchFilters } from "@/components/filters/search-filters";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ArrowUpDown } from "lucide-react";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";

export default function SearchTaskPage() {
  // Inicializar todos los estados con valores por defecto
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statuses, setStatuses] = useState<
    { id: number; name: string; color: string }[]
  >([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [filters, setFilters] = useState<{
    [key: string]: any;
    sprint?: number[];
  }>({});
  const [editingTask, setEditingTask] = useState<{
    id: number | null;
    field: "status" | "priority" | "assignee" | null;
  }>({ id: null, field: null });

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);

  const [sorting, setSorting] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({ field: "", direction: "asc" });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const getAvatarUrl = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.avatar || `/avatars/${userId}.png`;
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const fetchSprints = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints");
      const data = await response.json();
      setSprints(data || []);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");

      if (search) params.set("search", search);

      // Agregar filtros de fecha
      if (selectedDates.from) {
        params.set("dateFrom", selectedDates.from.toISOString());
      }
      if (selectedDates.to) {
        params.set("dateTo", selectedDates.to.toISOString());
      }

      // Agregar filtros de sprint
      selectedSprints.forEach((sprintId) =>
        params.append("sprint_id", sprintId)
      );

      // Agregar filtros múltiples
      selectedStatuses.forEach((statusId) => params.append("status", statusId));
      selectedPriorities.forEach((priority) =>
        params.append("priority", priority)
      );
      selectedAssignees.forEach((assigneeId) =>
        params.append("assignee", assigneeId)
      );
      selectedProjects.forEach((projectId) =>
        params.append("project", projectId)
      );

      // Add other filters except arrays
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "sprint" && value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });
      // Handle sprint array filter
      if (filters.sprint?.length) {
        filters.sprint.forEach((id: number) =>
          params.append("sprint_id", id.toString())
        );
      }

      const response = await fetch(`http://localhost:5000/api/task?${params}`);
      const data = await response.json();

      if (data && data.data) {
        setTasks(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setTasks([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (
    taskId: number,
    field: string,
    value: any
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
        status_id: task.status_id,
        project_id: task.project_id,
        tags: task.tags || [],
      };

      switch (field) {
        case "status_id":
          updateData.status_id = value;
          break;
        case "priority":
          updateData.priority = value;
          break;
        case "assignee":
          updateData.assignee = value;
          break;
      }

      await fetch(`http://localhost:5000/api/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      fetchTasks();
      setEditingTask({ id: null, field: null });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset page when filters change
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedAssignees([]);
    setSelectedProjects([]);
    setSelectedSprints([]);
    setSelectedDates({ from: undefined, to: undefined });
    setSearch("");
    setPage(1);
  };

  const sortTasks = (tasksToSort: Task[]) => {
    if (!sorting.field) return tasksToSort;

    return [...tasksToSort].sort((a, b) => {
      let aValue = a[sorting.field as keyof Task];
      let bValue = b[sorting.field as keyof Task];

      // Manejar casos especiales
      if (sorting.field === "status_name") {
        aValue = a.status_name || "";
        bValue = b.status_name || "";
      } else if (sorting.field === "assignee_name") {
        aValue = a.assignee_name || "";
        bValue = b.assignee_name || "";
      } else if (sorting.field === "sprint_name") {
        aValue = a.sprint_name || "";
        bValue = b.sprint_name || "";
      }

      if (sorting.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  };

  const toggleSort = (field: string) => {
    setSorting((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  // Asegurarse de que se carguen los datos necesarios al inicio
  useEffect(() => {
    Promise.all([
      fetchStatuses(),
      fetchUsers(),
      fetchProjects(),
      fetchSprints(),
    ]).then(() => {
      fetchTasks();
    });
  }, []);

  // Efecto separado para actualizaciones basadas en filtros y búsqueda
  useEffect(() => {
    if (!loading) {
      fetchTasks();
    }
  }, [
    search,
    page,
    selectedStatuses,
    selectedPriorities,
    selectedAssignees,
    selectedProjects,
    selectedSprints,
    selectedDates,
  ]);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Buscador de Tareas</h1>
          <p className="text-muted-foreground">
            Busca y filtra todas las tareas del sistema
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas por título, descripción o ID..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            {/* Filtro de Estado */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  {selectedStatuses.length
                    ? `${selectedStatuses.length} estados seleccionados`
                    : "Estados"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar estado..." />
                  <CommandEmpty>No se encontraron estados</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => (
                      <CommandItem
                        key={status.id}
                        onSelect={() => {
                          setSelectedStatuses((current) => {
                            const value = status.id.toString();
                            return current.includes(value)
                              ? current.filter((id) => id !== value)
                              : [...current, value];
                          });
                          setPage(1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedStatuses.includes(status.id.toString())
                                ? "bg-primary border-primary"
                                : "border-muted"
                            }`}
                          >
                            {selectedStatuses.includes(
                              status.id.toString()
                            ) && (
                              <span className="text-primary-foreground text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                          <span>{status.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Filtro de Prioridad */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  {selectedPriorities.length
                    ? `${selectedPriorities.length} prioridades seleccionadas`
                    : "Prioridades"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandGroup>
                    {["low", "medium", "high", "urgent"].map((priority) => (
                      <CommandItem
                        key={priority}
                        onSelect={() => {
                          setSelectedPriorities((current) => {
                            return current.includes(priority)
                              ? current.filter((p) => p !== priority)
                              : [...current, priority];
                          });
                          setPage(1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedPriorities.includes(priority)
                                ? "bg-primary border-primary"
                                : "border-muted"
                            }`}
                          >
                            {selectedPriorities.includes(priority) && (
                              <span className="text-primary-foreground text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Filtro de Asignados */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  {selectedAssignees.length
                    ? `${selectedAssignees.length} asignados seleccionados`
                    : "Asignados"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar usuario..." />
                  <CommandEmpty>No se encontraron usuarios</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          setSelectedAssignees((current) => {
                            const value = user.id.toString();
                            return current.includes(value)
                              ? current.filter((id) => id !== value)
                              : [...current, value];
                          });
                          setPage(1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedAssignees.includes(user.id.toString())
                                ? "bg-primary border-primary"
                                : "border-muted"
                            }`}
                          >
                            {selectedAssignees.includes(user.id.toString()) && (
                              <span className="text-primary-foreground text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarUrl(user.id)} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Filtro de Proyectos */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  {selectedProjects.length
                    ? `${selectedProjects.length} proyectos seleccionados`
                    : "Proyectos"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar proyecto..." />
                  <CommandEmpty>No se encontraron proyectos</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        onSelect={() => {
                          setSelectedProjects((current) => {
                            const value = project.id.toString();
                            return current.includes(value)
                              ? current.filter((id) => id !== value)
                              : [...current, value];
                          });
                          setPage(1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedProjects.includes(project.id.toString())
                                ? "bg-primary border-primary"
                                : "border-muted"
                            }`}
                          >
                            {selectedProjects.includes(
                              project.id.toString()
                            ) && (
                              <span className="text-primary-foreground text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                          {project.name}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Sprint Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  {selectedSprints.length
                    ? `${selectedSprints.length} sprints seleccionados`
                    : "Sprints"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar sprint..." />
                  <CommandGroup>
                    {sprints.map((sprint) => (
                      <CommandItem
                        key={sprint.id}
                        onSelect={() => {
                          setSelectedSprints((current) => {
                            const value = sprint.id.toString();
                            return current.includes(value)
                              ? current.filter((id) => id !== value)
                              : [...current, value];
                          });
                          setPage(1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedSprints.includes(sprint.id.toString())
                                ? "bg-primary border-primary"
                                : "border-muted"
                            }`}
                          >
                            {selectedSprints.includes(sprint.id.toString()) && (
                              <span className="text-primary-foreground text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                          {sprint.name}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDates.from ? (
                    selectedDates.to ? (
                      <>
                        {format(selectedDates.from, "P")} -{" "}
                        {format(selectedDates.to, "P")}
                      </>
                    ) : (
                      format(selectedDates.from, "P")
                    )
                  ) : (
                    "Rango de fechas"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {(selectedStatuses.length > 0 ||
              selectedPriorities.length > 0 ||
              selectedAssignees.length > 0 ||
              selectedProjects.length > 0 ||
              selectedSprints.length > 0 ||
              selectedDates.from ||
              selectedDates.to ||
              search) && (
              <Button variant="ghost" className="h-8" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => toggleSort("task_key")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Clave <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("title")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Título <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("status_name")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Estado <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("priority")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Prioridad <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("story_points")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Puntos <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("assignee_name")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Asignado <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("sprint_name")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Sprint <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("created_at")}
                  className="cursor-pointer hover:bg-muted"
                >
                  Fecha Creación <ArrowUpDown className="inline h-4 w-4 ml-1" />
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
                sortTasks(tasks).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.project_code}-{task.task_number}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: task.status_color }}>
                        {task.status_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{task.story_points}</TableCell>
                    <TableCell>
                      {editingTask.id === task.id &&
                      editingTask.field === "assignee" ? (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={
                              task.assignee ? String(task.assignee) : "_none"
                            }
                            onValueChange={(value) =>
                              handleUpdateTask(
                                task.id,
                                "assignee",
                                value === "_none" ? null : parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Sin asignar</SelectItem>
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
                      {task.sprint_name ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {task.sprint_name}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={
                              task.sprint_status === "active"
                                ? "bg-green-500/10 text-green-500"
                                : task.sprint_status === "completed"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }
                          >
                            {task.sprint_status === "active"
                              ? "Activo"
                              : task.sprint_status === "completed"
                              ? "Completado"
                              : "Planificado"}
                          </Badge>
                        </div>
                      ) : (
                        <Select
                          value={task.sprint_id?.toString() || "_none"}
                          onValueChange={(value) =>
                            handleUpdateTask(
                              task.id,
                              "sprint_id",
                              value !== "_none" ? parseInt(value) : null
                            )
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
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {tasks.length} tareas de {totalPages * 20} en total
          </div>
          <div className="flex items-center space-x-2">
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
        </div>

        <TaskDetailModal
          task={selectedTask}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
      </div>
    </DefaultLayout>
  );
}
