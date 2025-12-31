"use client";
import { useMemo, useState } from "react";
import { COLUMNS, TaskItem, Status, UserRef } from "./types";
import { mockUsers, sampleTasks } from "./mokedata";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./TaskCard";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { Plus} from "lucide-react";

function uid() { return Math.random().toString(36).slice(2, 9); }

export function TaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>(sampleTasks);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TaskItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    const map: Record<Status, TaskItem[]> = { backlog: [], todo: [], "in-progress": [], review: [], done: [] };
    for (const t of filtered) map[t.status].push(t);
    return map;
  }, [filtered]);

  const handleDrop = (status: Status, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id") || e.dataTransfer.getData("text/plain");
    if (!id) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const openDetails = (task: TaskItem) => { setSelected(task); setModalOpen(true); };
  const saveTask = (t: TaskItem) => setTasks(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setModalOpen(false);
    }
  };
  const addTask = (status: Status) => {
    const now = new Date().toISOString();
    const newTask: TaskItem = { id: uid(), title: "New Task", description: "", status, priority: "medium", assignee: mockUsers[0], tags: [], points: 1, createdAt: now, updatedAt: now };
    setTasks(prev => [newTask, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Manage Tasks</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search tasks..." value={query} onChange={e=>setQuery(e.target.value)} className="w-64" />
          <Button onClick={()=>{ addTask('backlog'); const created = tasks[0]; setSelected(created); setModalOpen(true); }} className="whitespace-nowrap">Add new task</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">{col.title}</h3>
              <Button size="icon" variant="ghost" onClick={()=>addTask(col.id)}><Plus className="h-4 w-4" /></Button>
            </div>
            <Card className="min-h-[320px] max-h-[70vh] overflow-y-auto p-2" onDragOver={allowDrop} onDrop={(e)=>handleDrop(col.id, e)}>
              <div className="space-y-2">
                {byStatus[col.id].map(t => <TaskCard key={t.id} task={t} onOpen={openDetails} />)}
              </div>
            </Card>
          </div>
        ))}
      </div>
  <TaskDetailsModal open={modalOpen} task={selected} onClose={()=>setModalOpen(false)} onSave={saveTask} assignees={mockUsers} onDelete={deleteTask} />
    </div>
  );
}

export default TaskBoard;
