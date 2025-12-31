"use client";
import { TaskItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskItem;
  onOpen: (task: TaskItem) => void;
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-600",
  high: "bg-amber-500/10 text-amber-600",
  critical: "bg-red-500/10 text-red-600",
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
      }}
      onClick={() => onOpen(task)}
      className={cn(
        "group rounded-md border p-3 cursor-pointer bg-background/70 backdrop-blur-sm hover:shadow-sm transition-shadow space-y-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-snug line-clamp-2">{task.title}</h4>
        <Badge className={cn("text-[10px]", priorityColors[task.priority])}>{task.priority}</Badge>
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 4).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{t}</span>
          ))}
          {task.tags.length > 4 && <span className="text-[10px] text-muted-foreground">+{task.tags.length - 4}</span>}
        </div>
      )}
      {task.assignee && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium">
            {task.assignee.name.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase()}
          </div>
          <span className="truncate max-w-[110px]">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}
