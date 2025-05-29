import { useState, useEffect } from "react";
import { Task } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Plus, X } from "lucide-react";
import { Clock } from "lucide-react";
import EditorQuill from "@/components/editorQuill";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

interface SLAData {
  accumulated_time: number;
  total_time: number;
  status: "active" | "inactive";
  start_time: string | null;
  end_time: string | null;
}

export default function TaskDetailsContent({ task }: { task: Task }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [slaData, setSLAData] = useState<SLAData | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchResults, setSearchResults] = useState<Task[]>([]);

  useEffect(() => {
    fetchComments();
    fetchLinkedTasks();
    fetchSLAData();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/task/${task.task_key}/comments`
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
        `http://localhost:5000/api/task/${task.task_key}/linked`
      );
      const data = await response.json();
      setLinkedTasks(data);
    } catch (error) {
      console.error("Error fetching linked tasks:", error);
    }
  };

  const fetchSLAData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/task/${task.task_key}/sla`
      );
      const data = await response.json();
      setSLAData(
        data || {
          start_time: null,
          end_time: null,
          accumulated_time: 0,
          total_time: 0,
          status: "inactive",
        }
      );
      setElapsedTime(data?.total_time || 0);
    } catch (error) {
      console.error("Error fetching SLA data:", error);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      await fetch(`http://localhost:5000/api/task/${task.task_key}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: content }),
      });
      fetchComments();
      setShowEditor(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLinkTask = async (targetTaskKey: string) => {
    try {
      await fetch(`http://localhost:5000/api/task/${task.task_key}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTaskKey }),
      });
      fetchLinkedTasks();
    } catch (error) {
      console.error("Error linking task:", error);
    }
  };

  const handleUnlinkTask = async (linkedTaskKey: string) => {
    try {
      await fetch(
        `http://localhost:5000/api/task/${task.task_key}/unlink/${linkedTaskKey}`,
        { method: "DELETE" }
      );
      fetchLinkedTasks();
    } catch (error) {
      console.error("Error unlinking task:", error);
    }
  };

  // Actualizar el SLA cada minuto si está activo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (slaData?.status === "active") {
      setElapsedTime(slaData.total_time);
      intervalId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [slaData]);

  const formatTime = (minutes: number) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-row gap-2">
      <div className="space-y-2 flex flex-col content-drawer w-4/5">
        {/* Eliminar el título ya que ahora está en el header del drawer */}
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            <div className="flex flex-col gap-2 justify-center items-center">
              <Label>Estado</Label>
              <Badge className={getStatusColor(task.status_name)}>
                {task.status_name}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <Label>Prioridad</Label>
              <Badge>{task.priority}</Badge>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <Label>Sprint</Label>
              <Badge variant="outline">
                {task.sprint_name || "Sin sprint"}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <Label>Puntos</Label>
              <Badge variant="outline">{task.story_points || 0}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Descripción</Label>
              <p className="mt-2 text-sm">{task.description}</p>
            </div>
          </div>
        </Card>

        {/* SLA Stats */}
        {/* <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-lg">SLA</Label>
              <Clock
                className={
                  slaData?.status === "active"
                    ? "text-green-500"
                    : "text-gray-500"
                }
              />
            </div>
            <Badge
              variant="secondary"
              className={
                slaData?.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100"
              }
            >
              {slaData?.status === "active" ? "En progreso" : "Inactivo"} -{" "}
              {formatTime(elapsedTime)}
            </Badge>
          </div>
          {slaData?.start_time && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Inicio: {new Date(slaData.start_time).toLocaleString()}</p>
              {slaData.end_time && (
                <p>Último fin: {new Date(slaData.end_time).toLocaleString()}</p>
              )}
            </div>
          )}
        </Card> */}

        {/* Tareas Ancladas */}
        <Card className="p-2">
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Tareas Ancladas</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
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
                  <CommandInput placeholder="Buscar tarea..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron tareas.</CommandEmpty>
                    <CommandGroup>
                      {searchResults.map((searchTask) => (
                        <CommandItem key={searchTask.id}>
                          <span>{searchTask.task_key}</span>
                          <span className="ml-2 text-muted-foreground">
                            {searchTask.title}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {linkedTasks.map((linkedTask) => (
              <Card key={linkedTask.task_key} className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: linkedTask.badge_color,
                        color: "white",
                      }}
                    >
                      {linkedTask.task_key}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {linkedTask.title}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Comentarios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comentarios</h3>
            <Button
              variant="outline"
              onClick={() => setShowEditor(!showEditor)}
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Comentar
            </Button>
          </div>

          {showEditor && (
            <Card className="p-4">
              <EditorQuill
                onSave={(content) => {
                  // Manejar guardado de comentario
                  setShowEditor(false);
                }}
                placeholder="Escribe un comentario..."
              />
            </Card>
          )}

          <div className="space-y-2">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-center gap-2 mb-0">
                  <Avatar>
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback>{comment.user_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className="pl-10 mt-0 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                />
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* tarjeta lateral izquierda */}
      <div className="flex-1">
        <Card className="w-full h-full p-4 ">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-lg">SLA</Label>
              <Clock
                className={
                  slaData?.status === "active"
                    ? "text-green-500"
                    : "text-gray-500"
                }
              />
            </div>
            <Badge
              variant="secondary"
              className={
                slaData?.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-500"
              }
            >
              {slaData?.status === "active" ? "En progreso" : "Inactivo"} -{" "}
              {formatTime(elapsedTime)}
            </Badge>
          </div>
          {slaData?.start_time && (
            <div className=" text-sm text-muted-foreground">
              <p>Inicio: {new Date(slaData.start_time).toLocaleString()}</p>
              {slaData.end_time && (
                <p>Último fin: {new Date(slaData.end_time).toLocaleString()}</p>
              )}
            </div>
          )}

          <div className="space-y-2 flex ">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Informador</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-8 w-8">
                    {/* Replace 'creator_avatar' with the correct property or remove src if not available */}
                    <AvatarImage src={task.creator?.avatar || ""} />
                    <AvatarFallback>{task.creator_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{task.creator_name}</span>
                </div>
              </div>
              <div>
                <Label>Asignado </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.assignee_avatar} />
                    <AvatarFallback>{task.assignee_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{task.assignee_name || "Sin asignar"}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
