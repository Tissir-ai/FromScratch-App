"use client";
import { useMemo, useState, useEffect } from "react";
import { COLUMNS, TaskItem, Status } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./TaskCard";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { Plus, Loader2 } from "lucide-react";
import { listTasks, createTask, updateTask, deleteTask, loadTasksmembers } from "@/services/task.service";
import type { TaskUserSelector } from "@/types/task.type";

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [tasks, query]);

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
      setTasks(tasksData);
      setAssignees(assigneesData);
    } catch (error) {
      console.error("Failed to load tasks or assignees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (status: Status, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    
    const task = tasks.find(t => t.id === id);
    if (task && task.status !== status) {
      try {
        const updated = await updateTask(projectId, id, { ...task, status });
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    }
  };

  const handleSaveTask = async (task: TaskItem) => {
    try {
      if (task.id) {
        // Update existing task
        const updated = await updateTask(projectId, task.id, task);
        setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      } else {
        // Create new task
        const created = await createTask(projectId, task);
        setTasks(prev => [created, ...prev]);
      }
      setModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(projectId, id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const openDetails = (task: TaskItem) => {
    setSelected(task);
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
      due_date: new Date(),
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
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
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
