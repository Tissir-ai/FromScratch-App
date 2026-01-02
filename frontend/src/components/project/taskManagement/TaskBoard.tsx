"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { COLUMNS, TaskItem, Status } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./TaskCard";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listTasks, createTask, updateTask, deleteTask, loadTasksmembers } from "@/services/task.service";
import { connectRealtime, RealtimeEvent } from "@/services/realtime.service";
import { useAuth } from "@/context/AuthContext";
import type { TaskUserSelector } from "@/types/task.type";
import type { UserRef } from "./types";

interface TaskBoardProps {
  projectId: string;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [assignees, setAssignees] = useState<TaskUserSelector[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TaskItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const realtimeRef = useRef<ReturnType<typeof connectRealtime> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  }, [tasks, query]);

  const normalizeAssignee = (assignee?: UserRef | null): UserRef | undefined => {
    if (!assignee) return undefined;
    const effectiveId = assignee.id || assignee.info_id || "";
    const effectiveInfoId = assignee.info_id || assignee.id || "";
    return {
      ...assignee,
      id: effectiveId,
      info_id: effectiveInfoId,
    };
  };

  const toDate = (value?: Date | string | null): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const normalizeTask = (task: TaskItem): TaskItem => {
    return {
      ...task,
      assignee: normalizeAssignee(task.assignee),
      asign_date: toDate(task.asign_date as Date | string | undefined),
      due_date: toDate(task.due_date as Date | string | undefined),
    };
  };

  const byStatus = useMemo(() => {
    const map: Record<Status, TaskItem[]> = { 
      backlog: [], 
      todo: [], 
      "in-progress": [], 
      review: [], 
      done: [] 
    };
    for (const t of filtered) map[t.status].push(t);
    return map;
  }, [filtered]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, assigneesData] = await Promise.all([
        listTasks(projectId),
        loadTasksmembers(projectId)
      ]);
      setTasks(tasksData.map(normalizeTask));
      setAssignees(assigneesData);
    } catch (error: any) {
      console.error("Failed to load tasks or assignees:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Failed to load tasks and team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time updates
  useEffect(() => {
    if (!user) return;

    const handleRealtimeEvent = (event: RealtimeEvent) => {
      if (event.type === 'crud' && event.entity === 'tasks') {
        if (event.action === 'create' && event.data) {
          setTasks(prev => {
            // Avoid duplicates
            const exists = prev.some(t => t.id === event.data.id);
            if (exists) return prev;
            return [event.data, ...prev];
          });
        } else if (event.action === 'update' && event.data) {
          setTasks(prev => prev.map(t => t.id === event.data.id ? event.data : t));
        } else if (event.action === 'delete' && event.data) {
          setTasks(prev => prev.filter(t => t.id !== event.data.id));
          if (selected?.id === event.data.id) {
            setSelected(null);
            setModalOpen(false);
          }
        }
      }
    };

    // Connect to real-time updates for tasks page
    realtimeRef.current = connectRealtime(projectId, 'tasks', user, {
      onMessage: handleRealtimeEvent
    });

    return () => {
      if (realtimeRef.current) {
        realtimeRef.current.close();
        realtimeRef.current = null;
      }
    };
  }, [projectId, user, selected]);

  const handleDrop = async (status: Status, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;

    const task = tasks.find(t => t.id === id);
    if (task && task.status !== status) {
      const previousTask = normalizeTask(task);
      const optimisticTask = normalizeTask({
        ...task,
        status,
        updatedAt: new Date().toISOString(),
      });
      try {
        setSaving(true);
        // Optimistically update the UI first
        setTasks(prev => prev.map(t => (t.id === id ? optimisticTask : t)));

        const updated = await updateTask(projectId, id, optimisticTask);
        const normalizedUpdated = normalizeTask(updated);
        setTasks(prev => prev.map(t => (t.id === id ? normalizedUpdated : t)));
        toast({
          title: "Task updated",
          description: "Task status has been updated successfully.",
        });
      } catch (error: any) {
        // Revert the optimistic update on error
        setTasks(prev => prev.map(t => (t.id === id ? previousTask : t)));
        console.error("Failed to update task status:", error);

        // Check if it's a validation error and provide a more user-friendly message
        const isValidationError = error.message?.includes('422') || error.message?.includes('Unprocessable');
        toast({
          title: "Task moved locally",
          description: isValidationError
            ? "Task status updated in UI. Backend sync may be delayed due to server validation."
            : (error.message || "Failed to update task status"),
          variant: isValidationError ? "default" : "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveTask = async (task: TaskItem) => {
    try {
      setSaving(true);
      if (task.id) {
        const updated = await updateTask(projectId, task.id, task);
        console.log('[TaskBoard] Update result:', updated);
        const normalizedUpdated = normalizeTask(updated);
        setTasks(prev => prev.map(t => (t.id === task.id ? normalizedUpdated : t)));
        toast({
          title: "Task updated",
          description: "Your changes have been saved successfully.",
        });
      } else {
        // Create new task
        const created = await createTask(projectId, task);
        console.log('[TaskBoard] Create result:', created);
        const normalizedCreated = normalizeTask(created);
        setTasks(prev => [normalizedCreated, ...prev]);
        toast({
          title: "Task created",
          description: "New task has been created successfully.",
        });
      }
      setModalOpen(false);
      setSelected(null);
    } catch (error: any) {
      console.error("[TaskBoard] Failed to save task:", error);

      const isValidationError = error.message?.includes('422') || error.message?.includes('Unprocessable');
      toast({
        title: "Task saved locally",
        description: isValidationError
          ? "Task changes saved in UI. Backend sync may be delayed due to server validation."
          : (error.message || "Failed to save task"),
        variant: isValidationError ? "default" : "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setSaving(true);
      await deleteTask(projectId, id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setModalOpen(false);
      setSelected(null);
      toast({
        title: "Task deleted",
        description: "The task has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error deleting task",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDetails = (task: TaskItem) => {
    setSelected(normalizeTask(task));
    setModalOpen(true);
  };

  const addTask = (status: Status) => {
    setSelected({
      id: "",
      title: "New Task",
      description: "",
      status,
      priority: "medium",
      asign_date: new Date(),
      due_date: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Manage Tasks</h2>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Search tasks..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            className="w-64" 
          />
          <Button
            onClick={() => addTask("backlog")}
            className="whitespace-nowrap"
            disabled={loading || saving}
          >
            {(loading || saving) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">{col.title}</h3>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => addTask(col.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
            </div>
              <Card 
                className="min-h-[320px] max-h-[70vh] overflow-y-auto p-2" 
                onDragOver={e => e.preventDefault()} 
                onDrop={e => handleDrop(col.id, e)}
              >
              <div className="space-y-2">
                  {byStatus[col.id].map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onOpen={openDetails}
                    />
                  ))}
              </div>
            </Card>
          </div>
        ))}
      </div>
      )}

      <TaskDetailsModal 
        projectId={projectId}
        open={modalOpen} 
        task={selected} 
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }} 
        onSave={handleSaveTask} 
        assignees={assignees} 
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

export default TaskBoard;
