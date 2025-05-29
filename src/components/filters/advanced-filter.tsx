import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Filter, SlidersHorizontal, X } from "lucide-react";

interface FilterConfig {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  priority?: string[];
  status?: string[];
  assignee?: number[];
  storyPoints?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  type?: string[];
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterConfig) => void;
  statuses: { id: string; name: string }[];
  users: { id: number; name: string }[];
}

export function AdvancedFilter({
  onFilterChange,
  statuses,
  users,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterConfig>({});
  const [open, setOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterConfig>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.priority?.length) count++;
    if (filters.status?.length) count++;
    if (filters.assignee?.length) count++;
    if (filters.storyPoints?.min || filters.storyPoints?.max) count++;
    if (filters.tags?.length) count++;
    if (filters.type?.length) count++;
    return count;
  };

  return (
    <div>
      <Button
        variant="outline"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filtros Avanzados
        {getActiveFiltersCount() > 0 && (
          <Badge className="ml-2 bg-primary">{getActiveFiltersCount()}</Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[580px] ">
          <DialogHeader>
            <DialogTitle>Filtros Avanzados</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh] pr-4 pl-3">
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Activos</h4>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters({});
                      onFilterChange({});
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
              <Separator />

              {/* Filtros por fecha */}
              <div className="grid gap-2">
                <Label>Rango de fechas</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Desde</Label>
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.from}
                      onSelect={(date) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, from: date },
                        })
                      }
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hasta</Label>
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.to}
                      onSelect={(date) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, to: date },
                        })
                      }
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros por estado */}
              <div className="grid gap-2">
                <Label>Estados</Label>
                <Select
                  value={filters.status?.[0]}
                  onValueChange={(value) => updateFilters({ status: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros por prioridad */}
              <div className="grid gap-2">
                <Label>Prioridad</Label>
                <Select
                  value={filters.priority?.[0]}
                  onValueChange={(value) =>
                    updateFilters({ priority: [value] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros por story points */}
              <div className="grid gap-2">
                <Label>Story Points</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.storyPoints?.min || ""}
                    onChange={(e) =>
                      updateFilters({
                        storyPoints: {
                          ...filters.storyPoints,
                          min: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.storyPoints?.max || ""}
                    onChange={(e) =>
                      updateFilters({
                        storyPoints: {
                          ...filters.storyPoints,
                          max: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Filtros por asignado */}
              <div className="grid gap-2">
                <Label>Asignado a</Label>
                <Select
                  value={filters.assignee?.[0]?.toString()}
                  onValueChange={(value) =>
                    updateFilters({ assignee: [parseInt(value)] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    onFilterChange(filters);
                    setOpen(false);
                  }}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
