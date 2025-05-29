import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
  users: any[];
  projects: any[];
  statuses: any[];
  sprints: any[]; // Agregar sprints a las props
}

export function SearchFilters({
  onFilterChange,
  users,
  projects,
  statuses,
  sprints,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<{
    dateRange: { from: Date | undefined; to: Date | undefined };
    priority: string[];
    status: string[];
    assignee: string[];
    project: string[];
    sprint: number[]; // Asumiendo que sprint.id es number
  }>({
    dateRange: { from: undefined, to: undefined },
    priority: [],
    status: [],
    assignee: [],
    project: [],
    sprint: [], // Agregar sprint al estado
  });

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "P")} -{" "}
                  {format(filters.dateRange.to, "P")}
                </>
              ) : (
                format(filters.dateRange.from, "P")
              )
            ) : (
              "Rango de fechas"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={filters.dateRange}
            onSelect={(range) => updateFilters("dateRange", range)}
          />
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Select
        onValueChange={(value) =>
          updateFilters("priority", [...filters.priority, value])
        }
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Baja</SelectItem>
          <SelectItem value="medium">Media</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="urgent">Urgente</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        onValueChange={(value) =>
          updateFilters("status", [...filters.status, value])
        }
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={status.id.toString()}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Assignee Filter */}
      <Select
        onValueChange={(value) =>
          updateFilters("assignee", [...filters.assignee, value])
        }
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Asignado a" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Project Filter */}
      <Select
        onValueChange={(value) =>
          updateFilters("project", [...filters.project, value])
        }
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Proyecto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sprint Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8 justify-start">
            {filters.sprint.length > 0 ? (
              <>{filters.sprint.length} sprints seleccionados</>
            ) : (
              "Filtrar por Sprint"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar sprint..." />
            <CommandEmpty>No se encontraron sprints.</CommandEmpty>
            <CommandGroup>
              {sprints.map((sprint) => (
                <CommandItem
                  key={sprint.id}
                  onSelect={() => {
                    const isSelected = filters.sprint.includes(sprint.id);
                    updateFilters(
                      "sprint",
                      isSelected
                        ? filters.sprint.filter((id) => id !== sprint.id)
                        : [...filters.sprint, sprint.id]
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                        filters.sprint.includes(sprint.id)
                          ? "bg-primary border-primary"
                          : "border-muted"
                      }`}
                    >
                      {filters.sprint.includes(sprint.id) && (
                        <span className="text-primary-foreground text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <span>{sprint.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {sprint.status}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 mt-2">
        {filters.priority.map((p) => (
          <Badge
            key={p}
            variant="secondary"
            className="cursor-pointer"
            onClick={() =>
              updateFilters(
                "priority",
                filters.priority.filter((x) => x !== p)
              )
            }
          >
            {p} <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
        {/* Sprint badges */}
        {filters.sprint.map((sprintId) => {
          const sprint = sprints.find((s) => s.id === sprintId);
          return (
            sprint && (
              <Badge
                key={sprintId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  updateFilters(
                    "sprint",
                    filters.sprint.filter((id) => id !== sprintId)
                  )
                }
              >
                {sprint.name} <X className="ml-1 h-3 w-3" />
              </Badge>
            )
          );
        })}

        {/* Clear Filters */}
        {(filters.dateRange.from ||
          filters.dateRange.to ||
          filters.priority.length > 0 ||
          filters.status.length > 0 ||
          filters.assignee.length > 0 ||
          filters.project.length > 0) && (
          <Button
            variant="ghost"
            className="h-8"
            onClick={() => {
              setFilters({
                dateRange: { from: undefined, to: undefined },
                priority: [],
                status: [],
                assignee: [],
                project: [],
                sprint: [],
              });
              onFilterChange({});
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
