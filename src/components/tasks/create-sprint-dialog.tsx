import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSprint: (sprintData: any) => void;
}

export function CreateSprintDialog({
  open,
  onOpenChange,
  onCreateSprint,
}: CreateSprintDialogProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [goal, setGoal] = useState("");

  const resetForm = () => {
    setName("");
    setStartDate(undefined);
    setEndDate(undefined);
    setGoal("");
  };

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (endDate < startDate) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          // Convertir las fechas al formato ISO
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          goal,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Sprint creado exitosamente");
      onCreateSprint({
        name,
        start_date: startDate,
        end_date: endDate,
        goal,
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear sprint"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Sprint</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Sprint</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint 1"
            />
          </div>
          <div className="grid gap-2">
            <Label>Fecha de Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {startDate ? format(startDate, "PP") : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label>Fecha de Fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {endDate ? format(endDate, "PP") : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal">Objetivo del Sprint</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe el objetivo principal del sprint..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Crear Sprint</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
