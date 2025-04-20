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
} from "lucide-react";

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
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema</p>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <LayersIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tareas</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold">{stats.urgentTasks}</p>
              </div>
            </div>
          </Card>
        </div>

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
                    <span>{stats.activeSprint.progress}%</span>
                  </div>
                  <Progress value={stats.activeSprint.progress} />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay sprint activo</p>
            )}
          </Card>

          {/* Resumen de Proyectos */}
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
                  <Progress value={project.progress} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Actividad Reciente */}
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
      </div>
    </DefaultLayout>
  );
}
