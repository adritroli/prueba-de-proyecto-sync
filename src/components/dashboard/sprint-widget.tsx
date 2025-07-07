import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Timer,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface SprintData {
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

export interface SprintWidgetProps {
  data: SprintData | null;
}

export function SprintWidget({ data }: SprintWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data) return null;

  return (
    <Card className="col-span-full p-3 space-y-0 rounded-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-xl font-semibold">Sprint Activo</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(data.startDate).toLocaleDateString()} -{" "}
                {new Date(data.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={data.daysRemaining < 3 ? "destructive" : "default"}>
            {data.daysRemaining} días restantes
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-0">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Progreso</p>
                <p className="text-xl font-bold">{data.progress}%</p>
              </div>
            </div>
            <Progress value={data.progress} className="mt-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Story Points</p>
                <p className="text-xl font-bold">
                  {data.completedStoryPoints}/{data.totalStoryPoints}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Velocidad</p>
                <p className="text-xl font-bold">{data.velocity} pts/día</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Tareas Bloqueadas
                </p>
                <p className="text-xl font-bold">{data.blockedTasks}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
