import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DashboardConfig } from "@/types/dashboard";
import { Card } from "@/components/ui/card";

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

interface ConfigMenuProps {
  config: DashboardConfig;
  onToggleWidget: (widgetId: string) => void;
}

export function ConfigMenu({ config, onToggleWidget }: ConfigMenuProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Configurar Widgets
            </Button>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <Card className="p-4 w-[300px]">
              <h4 className="font-medium mb-4">Widgets Disponibles</h4>
              <div className="space-y-4">
                {config.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium">
                        {WIDGET_LABELS[widget.type] || widget.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Posición: {widget.position + 1}
                      </div>
                    </div>
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => onToggleWidget(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
