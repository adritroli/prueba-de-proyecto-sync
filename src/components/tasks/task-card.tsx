import { Task } from "@/types/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, CircleDot, Triangle } from "lucide-react";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface TaskCardProps {
  task: Task & { 
    project_badge_color?: string;
    assignee_name?: string;
  };
}

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const priorityIcons = {
  urgent: <AlertCircle className="h-4 w-4 text-red-500" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-500 " />,
  medium: <Triangle className="h-4 w-4 text-yellow-500" />,
  low: <CircleDot className="h-4 w-4 text-blue-500" />,
};

export function TaskCard({ task }: TaskCardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const getAvatarUrl = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.avatar || `/avatars/${userId}.png`;
  };

  return (
    <Card
      className="tarjeta-kanban mb-2 cursor-pointer hover:shadow-md transition-shadow py-3"
      onClick={() => navigate(`/task/${task.task_key}`)}
    >
      <CardHeader className="px-3">
        <div className="flex flex-row justify-between r">
          <div>
            <CardTitle className="text-xs font-medium">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: task.project_badge_color || "#4B5563",
                  color: "white",
                }}
                className=""
              >
                {task.task_key}
              </Badge>
            </CardTitle>
            <div className="text-sm pt-1">{task.title}</div>
          </div>
          <div className="tooltip-container">
            {priorityIcons[task.priority]}
            <span className="tooltip-text">{task.priority}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex w-full items-center justify-between">
            <div>
              <Badge variant="secondary">{task.story_points} pts</Badge>
            </div>
            <div>
              {task.assignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={getAvatarUrl(task.assignee)} />
                    <AvatarFallback>{task.assignee_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
