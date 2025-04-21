import DefaultLayout from "@/config/layout";
import { useState, useEffect } from "react";
import { Task, TaskStatus, Sprint } from "@/types/tasks";
import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import "@/styles/kanban.css"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Asignado" },
  { id: "in_progress", title: "En Progreso" },
  { id: "review", title: "En Review" },
  { id: "done", title: "Completado" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [statusMap, setStatusMap] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const activeSprint = sprints.find((sprint) => sprint.status === "active");

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchSprints();
    fetchTaskStatuses();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log("Fetching tasks...");
      const response = await fetch("http://localhost:5000/api/task");
      const data = await response.json();
      console.log("Tasks received:", data);
      setTasks(data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Error al cargar las tareas");
      setTasks([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:5000/api/users");
    const data = await response.json();
    setUsers(data.data);
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints");
      const data = await response.json();
      setSprints(data);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchTaskStatuses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/task-status");
      const data = await response.json();
      const map: { [key: string]: number } = {};
      data.forEach((status: { id: number; name: string }) => {
        map[status.name] = status.id;
      });
      setStatusMap(map);
    } catch (error) {
      console.error("Error fetching task statuses:", error);
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || task.project_id?.toString() === selectedProject;
    const matchesUser = selectedUser === "all" || task.assignee?.toString() === selectedUser;
    
    return matchesSearch && matchesProject && matchesUser;
  });

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    element.classList.add("bg-muted");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove("bg-muted");
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    element.classList.remove("bg-muted");

    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id.toString() === taskId);
    console.log("Dropping task:", taskId, "to status:", newStatus);

    if (!task || task.status_name === newStatus) return;

    try {
      // Optimistic update
      setTasks(
        tasks.map((t) =>
          t.id.toString() === taskId ? { ...t, status_name: newStatus } : t
        )
      );

      console.log("Updating task status with ID:", statusMap[newStatus]);
      const response = await fetch(
        `http://localhost:5000/api/task/${taskId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_id: statusMap[newStatus] }),
        }
      );

      if (!response.ok) throw new Error();
      console.log("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      setTasks(
        tasks.map((t) =>
          t.id.toString() === taskId
            ? { ...t, status_name: task.status_name }
            : t
        )
      );
      toast.error("Error al actualizar el estado de la tarea");
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

      if (!response.ok) throw new Error();

      fetchTasks();
      toast.success(selectedTask ? "Tarea actualizada" : "Tarea creada");
    } catch (error) {
      toast.error(
        selectedTask
          ? "Error al actualizar la tarea"
          : "Error al crear la tarea"
      );
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Cargando tablero...</p>
        </div>
      </DefaultLayout>
    );
  }

  const displayUsers = users.slice(0, 4);
  const remainingUsers = users.slice(4);

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold">Board Tasks</h1>
          {activeSprint && (
          <div className="text-sm text-muted-foreground">
            Sprint Activo: {activeSprint.name}
          </div>
        )}
        </div>
     
       
      </div>

      <div>
        <Card className="mb-4 p-4 flex flex-row gap-4 items-center tarjeta-filtros-kanban">
          <div className="relative flex flex-row gap-3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {displayUsers.map((user) => (
                <Avatar
                  key={user.id}
                  className={`h-8 w-8 border-2 border-background cursor-pointer hover:scale-105 transition-transform ${
                    selectedUser === user.id.toString() ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedUser(
                    selectedUser === user.id.toString() ? "all" : user.id.toString()
                  )}
                >
                  <AvatarImage src={user.avatar || `/avatars/${user.id}.png`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {remainingUsers.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Avatar
                      className="h-8 w-8 border-2 border-background cursor-pointer hover:scale-105 transition-transform"
                    >
                      <AvatarFallback>
                        <MoreHorizontal className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="flex flex-col gap-1">
                      {remainingUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer ${
                            selectedUser === user.id.toString() ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedUser(
                            selectedUser === user.id.toString() ? "all" : user.id.toString()
                          )}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || `/avatars/${user.id}.png`} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
          </div>
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      </div>

      <div className="grid grid-cols-5 gap-3 h-[calc(100vh-200px)]">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col overflow-y-auto h-full scrollbar-thin">
            <div className="bg-muted p-2 rounded-t-md flex justify-between items-center">
              <h3 className="font-medium">{column.title}</h3>
              <span className="text-xs text-muted-foreground">
                {filteredTasks.filter(task => task.status_name === column.id).length}
              </span>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className="flex-1 overflow-auto bg-muted/50 p-2 rounded-b-md transition-colors prueba-scrollbar"
            >
              {filteredTasks
                .filter(task => task.status_name === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => {
                      setSelectedTask(task);
                      setCreateTaskOpen(true);
                    }}
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <TaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        task={selectedTask}
        onSave={handleSaveTask}
        users={users}
      />
    </DefaultLayout>
  );
}
