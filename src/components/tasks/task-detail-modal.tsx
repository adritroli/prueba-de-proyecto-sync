import { Task } from "@/types/tasks";
import { Link } from "react-router-dom";
import TaskDetailsContent from "./task-details-content";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import "@/styles/drawerDetalles.css";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] flex flex-col drawer-detalles p-0"
      >
        <SheetHeader className="p-3 border-b">
          <SheetTitle className="text-left flex items-center gap-2 text-xl">
            <Link
              to={`/task/${task.task_key}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {task.task_key}
            </Link>
            <span className="font-medium">{task.title}</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-3">
          <TaskDetailsContent task={task} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
