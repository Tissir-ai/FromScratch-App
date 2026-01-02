"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { TaskItem, Status, Priority, UserRef } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Trash2, Save, UserPlus } from "lucide-react";
import { searchUsers } from "@/services/user.service";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskDetailsModalProps {
  projectId: string;
  open: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  onDelete?: (id: string) => void;
}

const priorities: Priority[] = ["low", "medium", "high", "critical"];
const statuses: Status[] = ["backlog", "todo", "in-progress", "review", "done"];

const normalizeAssigneeForSave = (assignee?: UserRef | null): UserRef | undefined => {
  if (!assignee) return undefined;
  const resolvedId = assignee.id || assignee.info_id || "";
  const resolvedInfoId = assignee.info_id || assignee.id || "";
  return {
    ...assignee,
    id: resolvedId,
    info_id: resolvedInfoId,
  };
};

const normalizeDateField = (value?: Date | string | null) => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

const addOneDay = (date?: Date | null): Date | undefined => {
  if (!date) return undefined;
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
};

export function TaskDetailsModal({ projectId, open, task, onClose, onSave, onDelete }: TaskDetailsModalProps) {
  const [draft, setDraft] = useState<TaskItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserRef[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!task) {
      setDraft(null);
      return;
    }

    setDraft({
      ...task,
      assignee: normalizeAssigneeForSave(task.assignee),
      asign_date: normalizeDateField(task.asign_date),
      due_date: normalizeDateField(task.due_date),
    });
  }, [task]);

  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch all users when popover opens
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!userSearchOpen || allUsers.length > 0) return;
      
      try {
        setUserSearchLoading(true);
        const users = await searchUsers("", projectId);
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAllUsers([]);
      } finally {
        setUserSearchLoading(false);
      }
    };

    fetchAllUsers();
  }, [userSearchOpen, projectId, allUsers.length]);

  // Filter users by name locally
  const filteredUsers = userSearchQuery.trim()
    ? allUsers.filter(user => 
        user.name?.toLowerCase().includes(userSearchQuery.toLowerCase())
      )
    : allUsers;

  if (!draft) return null;

  const isNewTask = !draft.id;

  const update = <K extends keyof TaskItem>(key: K, val: TaskItem[K]) => {
    setDraft(prev => {
      if (!prev) return prev;
      const next: TaskItem = { ...prev, [key]: val, updatedAt: new Date().toISOString() };
      if (key === "assignee") {
        const normalizedAssignee = normalizeAssigneeForSave(val as TaskItem["assignee"]);
        next.assignee = normalizedAssignee;
        next.asign_date = normalizedAssignee ? (prev.asign_date ?? new Date()) : undefined;
      }
      return next;
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSave();
    }
  };

  const handleSave = () => {
    if (!draft) return;
    const normalizedAssignee = normalizeAssigneeForSave(draft.assignee);
    const payload: TaskItem = {
      ...draft,
      assignee: normalizedAssignee,
      asign_date: addOneDay(normalizedAssignee ? (draft.asign_date ?? new Date()) : undefined),
      due_date: addOneDay(draft.due_date),
      updatedAt: new Date().toISOString(),
    };
    onSave(payload);
    onClose();
  };

  const statusColor = (s: Status) => {
    switch (s) {
      case "backlog": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "todo": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "in-progress": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "review": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "done": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-muted";
    }
  };

  const priorityColor = (p: Priority) => {
    switch (p) {
      case "low": return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
      case "medium": return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-muted";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-5xl" onKeyDown={handleKeyDown}>
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            {isNewTask ? "Create Task" : "Edit Task"}
            <Badge className={cn("text-xs font-medium px-2.5 py-1", statusColor(draft.status))}>
              {draft.status}
            </Badge>
            <Badge className={cn("text-xs font-medium px-2.5 py-1", priorityColor(draft.priority))}>
              {draft.priority}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isNewTask 
              ? "Fill in the details to create a new task." 
              : "Update task details. Press Ctrl+Enter to save."}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              ref={titleRef} 
              value={draft.title} 
              onChange={e => update("title", e.target.value)} 
              placeholder="Enter a concise task title" 
              className="text-base h-11"
            />
          </div>

          {/* Meta Grid - 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={draft.status} onValueChange={val => update("status", val as Status)}>
                <SelectTrigger className="h-11" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={draft.priority} onValueChange={val => update("priority", val as Priority)}>
                <SelectTrigger className="h-11" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-start h-11 font-normal"
                    onClick={() => {
                      setUserSearchQuery("");
                    }}
                  >
                    {draft.assignee ? (
                      <span className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                          {draft.assignee.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{draft.assignee.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select assignee</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-3 border-b">
                    <Input
                      placeholder="Search by name..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {userSearchLoading ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">No users found</div>
                    ) : (
                      <div>
                        {filteredUsers.map(a => (
                          <Button
                            key={a.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start p-3 h-auto rounded-none border-b last:border-0",
                              draft.assignee?.id === a.id && "bg-primary/5"
                            )}
                            onClick={() => {
                              update("assignee", { ...a, id: a.id, info_id: a.info_id });
                              setUserSearchQuery("");
                              setUserSearchOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
                                {a.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                <span className="font-medium truncate">{a.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {[a.role, a.team].filter(Boolean).join(" • ")}
                                </span>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {draft.assignee && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-center text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          update("assignee", undefined);
                          setUserSearchOpen(false);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Remove Assignee
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <DatePicker
                date={draft.due_date instanceof Date ? draft.due_date : (draft.due_date ? new Date(draft.due_date) : undefined)}
                onSelect={(date) => update("due_date", date)}
                placeholder="Select due date"
                className="h-11"
                disablePastDates
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={draft.description || ""} 
              onChange={e => update("description", e.target.value)} 
              rows={5} 
              placeholder="Add task details, acceptance criteria, or relevant links..." 
              className="resize-none"
            />
          </div>

          {/* System Meta - only show for existing tasks */}
          {!isNewTask && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4 border-t">
              <span>Created: {new Date(draft.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(draft.updatedAt).toLocaleString()}</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">ID: {draft.id}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {onDelete && !isNewTask && (
              <Button 
                variant="destructive" 
                onClick={() => setDeleteOpen(true)} 
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Task
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2 min-w-[120px]">
              <Save className="h-4 w-4" /> 
              {isNewTask ? "Create Task" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {onDelete && (
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The task "{draft.title}" will be removed from all views.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => { 
                    onDelete(draft.id); 
                    setDeleteOpen(false); 
                    onClose(); 
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
