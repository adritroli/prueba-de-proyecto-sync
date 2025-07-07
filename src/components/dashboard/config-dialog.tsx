import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DashboardConfig } from "@/types/dashboard";
import { useState } from "react";

const AVAILABLE_WIDGETS = [
  { id: "1", type: "activeSprint", label: "Sprint Activo" },
  { id: "2", type: "projectSummary", label: "Resumen de Proyectos" },
  { id: "3", type: "tasksByStatus", label: "Estado de Tareas" },
  { id: "4", type: "teamPerformance", label: "Rendimiento de Equipo" },
  { id: "5", type: "topPerformers", label: "Top Performers" },
  { id: "6", type: "userStats", label: "Estadísticas de Usuario" },
  { id: "7", type: "recentActivity", label: "Actividad Reciente" },
  { id: "8", type: "mainStats", label: "Estadísticas Principales" },
];

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DashboardConfig;
  onSave: (config: DashboardConfig) => void;
}

export function DashboardConfigDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: ConfigDialogProps) {
  const [currentConfig, setCurrentConfig] = useState<DashboardConfig>(config);

  const toggleWidget = (widgetId: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
    }));
  };

  const handleSave = () => {
    onSave(currentConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {AVAILABLE_WIDGETS.map((widget) => (
            <div key={widget.id} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">{widget.label}</span>
                <span className="text-sm text-muted-foreground">
                  {widget.type}
                </span>
              </div>
              <Switch
                checked={
                  currentConfig.widgets.find((w) => w.id === widget.id)
                    ?.visible ?? false
                }
                onCheckedChange={() => toggleWidget(widget.id)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
