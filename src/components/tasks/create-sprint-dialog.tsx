import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

interface CreateSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSprint: (sprintData: any) => Promise<void>;
}

export function CreateSprintDialog({
  open,
  onOpenChange,
  onCreateSprint,
}: CreateSprintDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    goal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primero verificar si hay un sprint activo
      const checkActiveResponse = await fetch(
        "http://localhost:5000/api/sprints/active"
      );
      const activeSprintData = await checkActiveResponse.json();

      if (activeSprintData.sprint) {
        toast.error(
          "No se puede crear un nuevo sprint mientras haya uno activo. Complete o cancele el sprint actual.",
          {
            duration: 5000,
            description: `Sprint activo: ${activeSprintData.sprint.name}`,
          }
        );
        setLoading(false);
        return;
      }

      // Validaciones básicas
      if (!formData.name || !formData.start_date || !formData.end_date) {
        toast.error("Por favor complete todos los campos requeridos");
        setLoading(false);
        return;
      }

      // Ajustar las fechas para comparación
      const startDate = new Date(formData.start_date + "T00:00:00");
      const endDate = new Date(formData.end_date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log("Date validation:", {
        startDate,
        endDate,
        today,
        isStartValid: startDate >= today,
        isEndValid: endDate >= startDate,
      });

      // Verificar que la fecha de inicio no sea anterior a hoy
      if (startDate < today) {
        toast.error("La fecha de inicio no puede ser anterior a hoy");
        setLoading(false);
        return;
      }

      // Verificar que la fecha de fin no sea anterior o igual a la de inicio
      if (endDate < startDate) {
        toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
        setLoading(false);
        return;
      }

      // Preparar datos para envío
      const sprintData = {
        ...formData,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      };

      console.log("Sending sprint data:", sprintData);

      const response = await fetch("http://localhost:5000/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sprintData),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (!response.ok) {
        if (response.status === 400 && data.type === "name_duplicate") {
          toast.error("Ya existe un sprint con ese nombre");
        } else {
          toast.error(data.message || "Error al crear el sprint");
        }
        return;
      }

      onOpenChange(false);
      setFormData({ name: "", start_date: "", end_date: "", goal: "" });
      toast.success("Sprint creado exitosamente");

      // Solo notificar al componente padre para refrescar la lista
      if (onCreateSprint) {
        await onCreateSprint(data);
      }
    } catch (error) {
      console.error("Error creando sprint:", error);
      toast.error("Error al crear el sprint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="sprint-dialog-description">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Sprint</DialogTitle>
          <DialogDescription id="sprint-dialog-description">
            Complete los datos para crear un nuevo sprint. Las fechas deben ser
            posteriores a hoy.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del Sprint *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Sprint 1"
              required
            />
          </div>
          <div>
            <label htmlFor="start_date" className="text-sm font-medium">
              Fecha de Inicio *
            </label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor="end_date" className="text-sm font-medium">
              Fecha de Fin *
            </label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor="goal" className="text-sm font-medium">
              Objetivo del Sprint
            </label>
            <Textarea
              id="goal"
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              placeholder="Describir el objetivo del sprint..."
              className="h-24"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
