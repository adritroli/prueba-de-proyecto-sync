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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {currentConfig.widgets.map((widget) => (
            <div key={widget.id} className="flex items-center justify-between">
              <span>{widget.type}</span>
              <Switch
                checked={widget.visible}
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
