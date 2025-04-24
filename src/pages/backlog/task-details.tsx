import DefaultLayout from "@/config/layout"; // Fix DefaultLayout import
import { useEffect, useState } from "react";
import { Task } from "@/types/tasks";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import EditorQuill from "@/components/editorQuill";
import {
  Search,
  Plus,
  MessageSquarePlus,
  Pencil,
  Trash2,
  X,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/taskDetails.css";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  comment: string;
  created_at: string;
}

interface LinkedTask {
  task_key: string;
  title: string;
  name: string;
  badge_color: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface SLAData {
  accumulated_time: number;
  total_time: number;
  status: "active" | "inactive";
  start_time: string | null;
  end_time: string | null;
}

export default function TaskDetailsPage() {
  const { taskKey } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingField, setEditingField] = useState<"creator" | "assignee" | null>(null);
  const [slaData, setSLAData] = useState<SLAData | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const getAvatarUrl = (user: any) => {
    if (!user) return "/avatars/default.png";
    return user.avatar || `/avatars/${user.id}.png`;
  };

  const getSLAStatusDisplay = () => {
    if (!slaData) return {
      badge: <Badge variant="secondary">Sin iniciar</Badge>,
      time: "0h 0m"
    };

    switch (slaData.status) {
      case "active":
        return {
          badge: <Badge variant="secondary" className="bg-green-100 text-green-800">En progreso</Badge>,
          time: formatTime(slaData.total_time)
        };
      default:
        return {
          badge: <Badge variant="secondary">Pendiente</Badge>,
          time: "0h 0m"
        };
    }
  };

  useEffect(() => {
    fetchTaskDetails();
    fetchComments();
    fetchLinkedTasks();
    fetchUsers();
    if (taskKey) {
      fetchSLAData();
    }

    const intervalId = setInterval(() => {
      if (task?.status_name === "in_progress") {
        fetchSLAData();
      }
    }, 60000); // Actualizar cada minuto si está en progreso

    return () => clearInterval(intervalId);
  }, [taskKey, task?.status_name]);

  const formatTime = (minutes: number) => {
    if (!minutes) return "0h 0m";
    // Redondear a 2 decimales y convertir a número entero
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    // Actualizar el tiempo cada minuto si está activo
    let intervalId: NodeJS.Timeout;

    if (slaData?.status === "active") {
      setElapsedTime(slaData.total_time);
      intervalId = setInterval(() => {
        setElapsedTime(prev => Math.round(prev + 1)); // Incrementar un minuto entero
      }, 60000); // Actualizar cada minuto
    } else if (slaData) {
      setElapsedTime(Math.round(slaData.total_time));
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [slaData]);

  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/task/${taskKey}`);
      const data = await response.json();
      setTask(data);
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Error al cargar la tarea");
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/task/${taskKey}/comments`
      );
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchLinkedTasks = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/task/${taskKey}/linked`
      );
      const data = await response.json();
      setLinkedTasks(data);
    } catch (error) {
      console.error("Error fetching linked tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSLAData = async () => {
    try {
      console.log("Fetching SLA data for task:", taskKey);
      const response = await fetch(`http://localhost:5000/api/task/${taskKey}/sla`);
      const data = await response.json();
      console.log("SLA data received:", data);
      setSLAData(data || {
        start_time: null,
        end_time: null,
        accumulated_time: 0,
        total_time: 0,
        status: "inactive"
      });
    } catch (error) {
      console.error("Error fetching SLA data:", error);
      setSLAData({
        start_time: null,
        end_time: null,
        accumulated_time: 0,
        total_time: 0,
        status: "inactive"
      });
    }
  };

  const searchTasks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/search?q=${query}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching tasks:", error);
    }
  };

  const handleLinkTask = async (targetTaskKey: string) => {
    try {
      await fetch(`http://localhost:5000/api/task/${taskKey}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTaskKey }),
      });
      toast.success("Tarea enlazada correctamente");
      fetchLinkedTasks();
    } catch (error) {
      console.error("Error linking task:", error);
      toast.error("Error al enlazar la tarea");
    }
  };

  const handleUnlinkTask = async (linkedTaskKey: string) => {
    try {
      await fetch(
        `http://localhost:5000/api/task/${taskKey}/unlink/${linkedTaskKey}`,
        {
          method: "DELETE",
        }
      );
      toast.success("Tarea desenlazada correctamente");
      fetchLinkedTasks();
    } catch (error) {
      console.error("Error unlinking task:", error);
      toast.error("Error al desenlazar la tarea");
    }
  };

  const handleAddComment = async (commentContent: string) => {
    if (!commentContent.trim()) return;

    try {
      await fetch(`http://localhost:5000/api/task/${taskKey}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentContent }),
      });

      fetchComments();
      toast.success("Comentario agregado");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error al agregar comentario");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await fetch(
        `http://localhost:5000/api/task/${taskKey}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );
      toast.success("Comentario eliminado");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error al eliminar el comentario");
    }
  };

  const handleEditComment = async (commentId: number, newContent: string) => {
    try {
      await fetch(
        `http://localhost:5000/api/task/${taskKey}/comments/${commentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: newContent }),
        }
      );
      toast.success("Comentario actualizado");
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Error al actualizar el comentario");
    }
  };

  const handleUpdateUser = async (field: "creator" | "assignee", userId: string | number) => {
    try {
      await fetch(`http://localhost:5000/api/task/${taskKey}/update-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          userId: userId === "unassigned" ? null : Number(userId),
        }),
      });
      fetchTaskDetails();
      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar el usuario");
    }
    setEditingField(null);
  };

  if (!task) {
    return <DefaultLayout>Cargando...</DefaultLayout>;
  }

  return (
    <DefaultLayout>
      <div className="w-full flex flex-row gap-3">
        <div className="w-full">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="w-full">
                <h1 className="text-3xl font-bold mb-2">
                  <span className="text-muted-foreground mr-2">
                    {task.task_key}
                  </span>
                </h1>
                <Card className="w-full tarjeta-titulo">
                  <h1 className="text-2xl font-bold pl-3 pr-3  ">
                    {task.title}
                  </h1>
                </Card>
              </div>
            </div>

            <Card className="tarjeta-descripcion">
              <h2 className="text-xl font-semibold ">Descripción</h2>
              <p className="">{task.description}</p>
              <div className="flex gap-2 items-center">
                <Badge>{task.project_code}</Badge>
                <Badge variant="outline">{task.status_name}</Badge>
                <Badge className="bg-blue-500">{task.priority}</Badge>
                <Badge variant="secondary">
                  {task.story_points} story points
                </Badge>
              </div>
            </Card>

            <Card className="h-full tarjeta-enlazar-tareas">
              <div className="">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex flex-row justify-between items-center mb-2 mt-1 ">
                      <h2 className="text-md font-semibold ">Anclar Issues</h2>
                      <Button className="w-6 h-6 rounded-full  hover:bg-green-500">
                        <Plus className="h-4 w-4 " />
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enlazar Tarea</DialogTitle>
                      <DialogDescription>
                        Busque y seleccione una tarea para enlazar
                      </DialogDescription>
                    </DialogHeader>
                    <Command>
                      <CommandInput
                        placeholder="Buscar tarea..."
                        onValueChange={searchTasks}
                      />
                      <CommandList>
                        <CommandEmpty>No se encontraron tareas.</CommandEmpty>
                        <CommandGroup>
                          {searchResults.map((task) => (
                            <CommandItem
                              key={task.task_key}
                              onSelect={() => handleLinkTask(task.task_key)}
                            >
                              <span>{task.task_key}</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {task.title}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2">
                  {linkedTasks.map((linkedTask) => (
                    <Card
                      key={linkedTask.task_key}
                      className="tarjeta-tarea-enlazada"
                    >
                      <div className="flex flex-row w-full justify-between items-center">
                        <div className="flex flex-row gap-2 items-center">
                          <Link
                            to={`/task/${linkedTask.task_key}`}
                            className="font-medium transition-colors"
                          >
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor:
                                  linkedTask.badge_color || "#4B5563",
                                color: "white",
                              }}
                            >
                              {linkedTask.task_key}
                            </Badge>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {linkedTask.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{linkedTask.name}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-500"
                            onClick={() =>
                              handleUnlinkTask(linkedTask.task_key)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>

            <div className="mb-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Comments issue</h2>
                <Button
                  onClick={() => setShowEditor(!showEditor)}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Comentar tarea
                </Button>
              </div>

              {showEditor && (
                <div className="mb-4">
                  <EditorQuill
                    onSave={(content) => {
                      handleAddComment(content);
                      setShowEditor(false);
                    }}
                    placeholder="Escribe un comentario..."
                  />
                </div>
              )}

              <div className="space-y-3 ">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-4 px-1 py-1 bg-muted rounded-md"
                  >
                    <div className="flex-1 comment-container">
                      <div className="flex flex-row items-center pl-2 pt-1 gap-2">
                        <Avatar>
                          <AvatarImage src={comment.user_avatar} />
                          <AvatarFallback>
                            {comment.user_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">
                          {comment.user_name}
                        </span>
                      </div>
                      <div
                        className="comment-content text-sm pt-3 pl-5"
                        dangerouslySetInnerHTML={{ __html: comment.comment }}
                      />
                      <div className="comment-footer">
                        <div className="comment-actions">
                          <span
                            className="comment-action"
                            onClick={() => {
                              const newContent = prompt(
                                "Editar comentario:",
                                comment.comment
                              );
                              if (newContent)
                                handleEditComment(comment.id, newContent);
                            }}
                          >
                            Editar
                          </span>
                          <span
                            className="comment-action delete"
                            onClick={() => {
                              if (
                                confirm(
                                  "¿Estás seguro de eliminar este comentario?"
                                )
                              ) {
                                handleDeleteComment(comment.id);
                              }
                            }}
                          >
                            Eliminar
                          </span>
                        </div>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-80">
          <Card className="h-full p-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-col p-0">
                <div className="mt-2 p-2 rounded-lg border">
                <Label className="pt-1 pb-2">SLA</Label>
                  <div className="flex items-center justify-between gap-2">
                    <Clock
                      className={
                        slaData?.status === "active"
                          ? "h-4 w-4 text-green-500"
                          : "h-4 w-4 text-gray-500"
                      }
                    />
                    <div className="flex flex-col justify-between gap-1">
                      <Badge
                        variant="secondary"
                        className={
                          slaData?.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }
                      >
                        {slaData?.status === "active"
                          ? "En progreso"
                          : "Inactivo"}{" "}
                        - {formatTime(elapsedTime)}
                      </Badge>
                    </div>
                  </div>
                  {slaData?.start_time && (
                    <div className="text-sm text-muted-foreground flex justify-between gap-2 mt-2">
                      <div className="flex flex-row justify-between items-center gap-1">
                        <span className="font-medium">Inicio actual:</span>
                        {new Date(slaData.start_time).toLocaleString()}
                      </div>
                      {slaData.end_time && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Último fin:</span>
                          {new Date(slaData.end_time).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Informador</Label>
                {editingField === "creator" ? (
                  <Select
                    value={String(task.created_by)}
                    onValueChange={(value) =>
                      handleUpdateUser("creator", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={getAvatarUrl(user)} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => setEditingField("creator")}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getAvatarUrl({
                          id: task.created_by,
                          avatar: task.creator_avatar,
                        })}
                      />
                      <AvatarFallback>{task.creator_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span>{task.creator_name}</span>
                  </div>
                )}
              </div>

              <div>
                <Label>Asignado a</Label>
                {editingField === "assignee" ? (
                  <Select
                    value={task.assignee ? String(task.assignee) : "unassigned"}
                    onValueChange={(value) =>
                      handleUpdateUser("assignee", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={getAvatarUrl(user)} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => setEditingField("assignee")}
                  >
                    {task.assignee ? (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={getAvatarUrl({
                              id: task.assignee,
                              avatar: task.assignee_avatar,
                            })}
                          />
                          <AvatarFallback>
                            {task.assignee_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{task.assignee_name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
