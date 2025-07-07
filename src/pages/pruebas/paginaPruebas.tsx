import DefaultLayout from "@/config/layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DashboardConfig } from "@/types/dashboard";
import { SprintWidget } from "@/components/dashboard/sprint-widget";
import { ProjectSummaryWidget } from "@/components/dashboard/project-summary-widget";

const WIDGET_LABELS: Record<string, string> = {
  activeSprint: "Sprint Activo",
  projectSummary: "Resumen de Proyectos",
  tasksByStatus: "Estado de Tareas",
  teamPerformance: "Rendimiento del Equipo",
  topPerformers: "Top Performers",
  userStats: "Estadísticas de Usuario",
  recentActivity: "Actividad Reciente",
  mainStats: "Estadísticas Principales",
};

interface SprintData {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  teamMembers: number;
  blockedTasks: number;
  velocity: number;
  daysRemaining: number;
}

interface ProjectData {
  id: number;
  name: string;
  progress: number;
  tasksCount: number;
}

export default function PaginaPruebas() {
  const [config, setConfig] = useState<DashboardConfig>({
    userId: 1,
    layout: "grid",
    widgets: [
      { id: "1", type: "activeSprint", position: 0, visible: true },
      { id: "2", type: "projectSummary", position: 1, visible: true },
      { id: "3", type: "tasksByStatus", position: 2, visible: true },
      { id: "4", type: "teamPerformance", position: 3, visible: true },
      { id: "5", type: "topPerformers", position: 4, visible: true },
      { id: "6", type: "userStats", position: 5, visible: true },
      { id: "7", type: "recentActivity", position: 6, visible: true },
      { id: "8", type: "mainStats", position: 7, visible: true },
    ],
  });
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectData[]>([]);

  useEffect(() => {
    loadConfig();
    loadSprintData();
    loadProjectsData();
  }, []);

  const loadConfig = async () => {
    try {
      console.log("Iniciando carga de configuración...");
      const response = await fetch(
        "http://localhost:5000/api/dashboard/config",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Error al cargar configuración");

      const data = await response.json();
      console.log("Configuración recibida:", data);
      setConfig(data);
    } catch (error) {
      console.error("Error detallado en loadConfig:", error);
      toast.error("Error al cargar la configuración");
    }
  };

  const loadSprintData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sprints/active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 404) {
        setSprintData(null);
        return;
      }

      if (!response.ok) throw new Error("Error al cargar datos del sprint");

      const data = await response.json();
      console.log("Sprint data:", data);
      setSprintData(data);
    } catch (error) {
      console.error("Error cargando datos del sprint:", error);
      toast.error("Error al cargar información del sprint");
    }
  };

  const loadProjectsData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/projects/summary",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al cargar datos de proyectos");

      const data = await response.json();
      setProjectsData(data);
    } catch (error) {
      console.error("Error cargando datos de proyectos:", error);
      toast.error("Error al cargar información de proyectos");
    }
  };

  const saveConfig = async (newConfig: DashboardConfig) => {
    try {
      console.log("Intentando guardar configuración:", newConfig);
      const response = await fetch(
        "http://localhost:5000/api/dashboard/config",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newConfig),
        }
      );

      if (!response.ok) throw new Error("Error al guardar configuración");

      setConfig(newConfig);
      toast.success("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Error al guardar la configuración");
    }
  };

  const toggleWidget = async (widgetId: string) => {
    const newConfig = {
      ...config,
      widgets: config.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
    };
    await saveConfig(newConfig);
  };

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Prueba de Configuración de Widgets
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings2 className="h-4 w-4 mr-2" />
                Configurar Widgets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Widgets Disponibles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {config.widgets.map((widget) => (
                <DropdownMenuCheckboxItem
                  key={widget.id}
                  checked={widget.visible}
                  onCheckedChange={() => toggleWidget(widget.id)}
                >
                  {WIDGET_LABELS[widget.type] || widget.type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.widgets
            .filter((widget) => widget.visible)
            .map((widget) => {
              if (widget.type === "activeSprint") {
                return <SprintWidget key={widget.id} data={sprintData} />;
              }
              if (widget.type === "projectSummary") {
                return (
                  <ProjectSummaryWidget key={widget.id} data={projectsData} />
                );
              }
              return (
                <div
                  key={widget.id}
                  className="p-4 border rounded-lg shadow-sm"
                >
                  <h3 className="font-medium">
                    {WIDGET_LABELS[widget.type] || widget.type}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Posición: {widget.position}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </DefaultLayout>
  );
}
