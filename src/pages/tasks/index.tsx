import { AdvancedFilter } from "@/components/filters/advanced-filter";
import type { FilterConfig } from "@/components/filters/advanced-filter";

export default function TasksPage() {
  // ...existing code...

  const handleFilterChange = async (filters: FilterConfig) => {
    try {
      // Construir query params
      const params = new URLSearchParams();

      if (filters.dateRange?.from) {
        params.append("dateFrom", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.append("dateTo", filters.dateRange.to.toISOString());
      }

      filters.priority?.forEach((p) => params.append("priority", p));
      filters.status?.forEach((s) => params.append("status", s));
      filters.assignee?.forEach((a) => params.append("assignee", a.toString()));

      if (filters.storyPoints?.min) {
        params.append("storyPointsMin", filters.storyPoints.min.toString());
      }
      if (filters.storyPoints?.max) {
        params.append("storyPointsMax", filters.storyPoints.max.toString());
      }

      const response = await fetch(`http://localhost:5000/api/tasks?${params}`);
      const data = await response.json();
      setTasks(data.data);
    } catch (error) {
      console.error("Error al filtrar tareas:", error);
    }
  };

  return (
    <div>
      {/* ...existing code... */}
      <AdvancedFilter
        onFilterChange={handleFilterChange}
        statuses={statuses}
        users={users}
      />
      {/* ...existing code... */}
    </div>
  );
}
