import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TaskStatsChartProps {
  data: Array<{
    month: string;
    completadas: number;
    pendientes: number;
    urgentes: number;
  }>;
}

export function TaskStatsChart({ data }: TaskStatsChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">
        Evolución de Tareas por Mes
      </h2>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="completadas"
              stroke="#22c55e"
              name="Completadas"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="pendientes"
              stroke="#eab308"
              name="Pendientes"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="urgentes"
              stroke="#ef4444"
              name="Urgentes"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
