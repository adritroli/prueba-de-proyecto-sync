import DefaultLayout from "@/config/layout";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  LayersIcon,
  SparklesIcon,
  MessageSquare,
  PlusCircle,
  CheckCircle,
  GitPullRequest,
  Users,
  Trophy,
  Target,
  Timer,
  BarChart,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const activityIcons: Record<
  | "task_created"
  | "comment_added"
  | "task_completed"
  | "task_linked"
  | "task_urgent",
  JSX.Element
> = {
  task_created: <PlusCircle className="h-5 w-5 text-green-500" />,
  comment_added: <MessageSquare className="h-5 w-5 text-blue-500" />,
  task_completed: <CheckCircle className="h-5 w-5 text-purple-500" />,
  task_linked: <GitPullRequest className="h-5 w-5 text-orange-500" />,
  task_urgent: <AlertCircle className="h-5 w-5 text-red-500" />,
};

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  urgentTasks: number;
  activeUsers: number;
  activeSprint: {
    name: string;
    progress: number;
    endDate: string;
  } | null;
  recentActivity: {
    id: number;
    type: string;
    description: string;
    date: string;
  }[];
  projectSummary: {
    id: number;
    name: string;
    progress: number;
    tasksCount: number;
  }[];
  userStats: {
    totalUsers: number;
    onlineUsers: number;
    activeTeams: number;
  };
  teamPerformance: Array<{
    team_name: string;
    total_tasks: number;
    completed_tasks: number;
    avg_completion_time: number;
  }>;
  topPerformers: Array<{
    name: string;
    avatar: string;
    tasks_completed: number;
    avg_completion_time: number;
  }>;
  avgStoryPoints: number;
  totalStoryPoints: number;
  activeAssignees: number;
  tasksByStatus: Array<{
    status: string;
    color: string;
    count: number;
    total_points: number;
  }>;
  activeSprintDetails: {
    id: number;
    name: string;
    total_tasks: number;
    total_story_points: number;
    completed_tasks: number;
    days_remaining: number;
    start_date: string;
    end_date: string;
  } | null;
  activeSprintTasks: Array<{
    id: number;
    title: string;
    priority: string;
    status_name: string;
    status_color: string;
    story_points: number;
    assignee_name: string;
    assignee_avatar: string;
  }>;
  tasksInSprints: number;
  tasksBacklog: number;
  inProgressTasks: number;
  sprintStats: {
    totalSprints: number;
    completedSprints: number;
    activeSprints: number;
  };
}

interface WidgetVisibility {
  mainStats: boolean;
  userStats: boolean;
  topPerformers: boolean;
  teamPerformance: boolean;
  tasksByStatus: boolean;
  activeSprint: boolean;
  projectSummary: boolean;
  recentActivity: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(
    () => {
      const savedConfig = localStorage.getItem("dashboardWidgets");
      return savedConfig
        ? JSON.parse(savedConfig)
        : {
            mainStats: true,
            userStats: true,
            topPerformers: true,
            teamPerformance: true,
            tasksByStatus: true,
            activeSprint: true,
            projectSummary: true,
            recentActivity: true,
          };
    }
  );

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardWidgets", JSON.stringify(widgetVisibility));
  }, [widgetVisibility]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <DefaultLayout>Cargando...</DefaultLayout>;
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Resumen general del sistema</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Configurar Widgets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.mainStats}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    mainStats: checked,
                  }))
                }
              >
                Estadísticas Principales
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.userStats}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    userStats: checked,
                  }))
                }
              >
                Estadísticas de Usuarios
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.topPerformers}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    topPerformers: checked,
                  }))
                }
              >
                Top Performers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.teamPerformance}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    teamPerformance: checked,
                  }))
                }
              >
                Rendimiento por Equipo
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.tasksByStatus}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    tasksByStatus: checked,
                  }))
                }
              >
                Estado Global de Tareas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.activeSprint}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    activeSprint: checked,
                  }))
                }
              >
                Sprint Activo
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.projectSummary}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    projectSummary: checked,
                  }))
                }
              >
                Resumen de Proyectos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgetVisibility.recentActivity}
                onCheckedChange={(checked) =>
                  setWidgetVisibility((prev) => ({
                    ...prev,
                    recentActivity: checked,
                  }))
                }
              >
                Actividad Reciente
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Estadísticas Principales */}
        {widgetVisibility.mainStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <LayersIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tareas</p>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                  <div className="flex flex-col mt-2 text-xs text-muted-foreground">
                    <span>En Sprints: {stats.tasksInSprints}</span>
                    <span>En Backlog: {stats.tasksBacklog}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(
                      (stats.completedTasks / stats.totalTasks) * 100
                    )}
                    % del total
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                  <div className="flex flex-col mt-2 text-xs text-muted-foreground">
                    <span>En Progreso: {stats.inProgressTasks}</span>
                    <span>
                      Sin Iniciar: {stats.pendingTasks - stats.inProgressTasks}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Urgentes</p>
                  <p className="text-2xl font-bold">{stats.urgentTasks}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round((stats.urgentTasks / stats.totalTasks) * 100)}%
                    del total
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Nuevas estadísticas */}
        {widgetVisibility.userStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Usuarios Online
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {stats.userStats.onlineUsers}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      de {stats.userStats.totalUsers}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-cyan-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Story Points</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {Math.round(stats.avgStoryPoints)}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      promedio por tarea
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Timer className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Asignados Activos
                  </p>
                  <p className="text-2xl font-bold">{stats.activeAssignees}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Top Performers */}
        {widgetVisibility.topPerformers && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.topPerformers.map((performer, index) => (
                <Card key={index} className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <img
                        src={performer.avatar || "/default-avatar.png"}
                        alt={performer.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <Badge className="absolute -top-2 -right-2">
                        {index + 1}
                      </Badge>
                    </div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.tasks_completed} tareas completadas
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Rendimiento por Equipo */}
        {widgetVisibility.teamPerformance && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              Rendimiento por Equipo
            </h2>
            <div className="space-y-4">
              {stats.teamPerformance.map((team, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{team.team_name}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {team.completed_tasks} / {team.total_tasks} tareas
                      </span>
                      <Badge variant="outline">
                        {Math.round(team.avg_completion_time)}h promedio
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={Math.round(
                      (team.completed_tasks / team.total_tasks) * 100
                    )}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Estado Global de Tareas */}
        {widgetVisibility.tasksByStatus && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Estado Global de Tareas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {stats.tasksByStatus.map((status) => (
                <Card key={status.status} className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-medium">
                        {status.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{status.count}</p>
                    <p className="text-sm text-muted-foreground">
                      {status.total_points} pts
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Sprint Activo Detallado */}
        {widgetVisibility.activeSprint && stats.activeSprintDetails && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Sprint Activo: {stats.activeSprintDetails.name}
            </h2>
            <div className="grid gap-6">
              {/* Métricas del Sprint */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Días Restantes
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.activeSprintDetails.days_remaining}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total Tareas</p>
                  <p className="text-2xl font-bold">
                    {stats.activeSprintDetails.total_tasks}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Story Points</p>
                  <p className="text-2xl font-bold">
                    {stats.activeSprintDetails.total_story_points}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">
                    {stats.activeSprintDetails.completed_tasks}
                  </p>
                </Card>
              </div>

              {/* Lista de Tareas del Sprint */}
              <div className="space-y-4">
                <h3 className="font-medium">Tareas del Sprint</h3>
                <div className="grid gap-3">
                  {stats.activeSprintTasks.map((task) => (
                    <Card key={task.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {task.assignee_avatar && (
                            <img
                              src={task.assignee_avatar}
                              alt={task.assignee_name}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {task.assignee_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{ backgroundColor: task.status_color }}
                            className="text-white"
                          >
                            {task.status_name}
                          </Badge>
                          <Badge variant="outline">
                            {task.story_points} pts
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Sprint Activo y Proyectos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sprint Activo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sprint Activo</h2>
            {stats.activeSprint ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{stats.activeSprint.name}</p>
                  <Badge variant="outline">
                    Finaliza:{" "}
                    {new Date(stats.activeSprint.endDate).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{Math.round(stats.activeSprint.progress)}%</span>
                  </div>
                  <Progress value={Math.round(stats.activeSprint.progress)} />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay sprint activo</p>
            )}
          </Card>

          {/* Resumen de Proyectos */}
          {widgetVisibility.projectSummary && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Proyectos</h2>
              <div className="space-y-4">
                {stats.projectSummary.map((project) => (
                  <div key={project.id} className="space-y-2">
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
            </Card>
          )}
        </div>

        {/* Actividad Reciente */}
        {widgetVisibility.recentActivity && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Actividad Reciente</h2>
            <div className="relative">
              {/* Línea vertical del timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

              <div className="space-y-6">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {/* Círculo indicador */}
                    <div className="w-8 h-8 rounded-full bg-background border-2 border-muted flex items-center justify-center relative z-10">
                      {activityIcons[
                        activity.type as keyof typeof activityIcons
                      ] || <SparklesIcon className="h-4 w-4 text-blue-500" />}
                    </div>

                    <div className="flex-1 bg-muted/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium">{activity.description}</p>
                        <time className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString([], {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </DefaultLayout>
  );
}
