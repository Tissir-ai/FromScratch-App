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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { X, Trash2, Save, UserPlus } from "lucide-react";
import { getUserById, searchUsers } from "@/services/user.service";

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

export function TaskDetailsModal({ projectId, open, task, onClose, onSave, onDelete }: TaskDetailsModalProps) {
  const [draft, setDraft] = useState<TaskItem | null>(task);
  const [tagInput, setTagInput] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<UserRef[]>([] as UserRef[]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setDraft(task), [task]);
  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open]);

  // Handle user search
  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (!userSearchQuery.trim()) {
        setSearchedUsers([]);
        return;
      }

      try {
        setUserSearchLoading(true);
        const users = await searchUsers(userSearchQuery, projectId);
        setSearchedUsers(users);
      } catch (error) {
        console.error('Failed to search users:', error);
        setSearchedUsers([]);
      } finally {
        setUserSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, projectId]);

  if (!draft) return null;

  const update = <K extends keyof TaskItem>(key: K, val: TaskItem[K]) => {
    setDraft(prev => prev ? { ...prev, [key]: val, updatedAt: new Date().toISOString() } : prev);
  };

  const addTag = () => {
    const clean = tagInput.trim();
    if (!clean) return;
    const current = draft.tags || [];
    if (!current.includes(clean)) update("tags", [...current, clean]);
    setTagInput("");
  };

  const removeTag = (t: string) => {
    update("tags", (draft.tags || []).filter(x => x !== t));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (draft) onSave(draft);
      onClose();
    }
  };

  const statusColor = (s: Status) => {
    switch (s) {
      case "backlog": return "bg-muted text-muted-foreground";
      case "todo": return "bg-blue-500/15 text-blue-600";
      case "in-progress": return "bg-amber-500/15 text-amber-600";
      case "review": return "bg-purple-500/15 text-purple-600";
      case "done": return "bg-green-500/15 text-green-600";
      default: return "bg-muted";
    }
  };

  const priorityColor = (p: Priority) => {
    switch (p) {
      case "low": return "bg-muted text-muted-foreground";
      case "medium": return "bg-sky-500/15 text-sky-600";
      case "high": return "bg-orange-500/15 text-orange-600";
      case "critical": return "bg-red-500/15 text-red-600";
      default: return "bg-muted";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-3xl" onKeyDown={handleKeyDown}>
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            Edit Task
            <Badge className={cn("text-[10px]", statusColor(draft.status))}>{draft.status}</Badge>
            <Badge className={cn("text-[10px]", priorityColor(draft.priority))}>{draft.priority}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">Refine details, adjust status & priority. Press Ctrl+Enter to save.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-5 pb-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Title</label>
              <Input ref={titleRef} value={draft.title} onChange={e => update("title", e.target.value)} placeholder="Concise summary" />
            </div>
                      {/* Meta Grid */}
            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Status</label>
                <Select value={draft.status} onValueChange={val => update("status", val as Status)}>
                  <SelectTrigger className="h-8 text-xs" aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Priority</label>
                <Select value={draft.priority} onValueChange={val => update("priority", val as Priority)}>
                  <SelectTrigger className="h-8 text-xs" aria-label="Priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Assignee</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-8 text-xs"
                      onClick={() => {
                        if (!userSearchOpen) {
                          setUserSearchOpen(true);
                          setUserSearchQuery("");
                          setSearchedUsers([]);
                        }
                      }}
                    >
                      {draft.assignee ? draft.assignee.name : "Search user by email or name"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="p-2">
                      <Input
                        placeholder="Search user by email or name"
                        className="text-xs h-8"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <ScrollArea className="h-48">
                      {userSearchLoading ? (
                        <div className="p-2 text-sm text-muted-foreground">Searching...</div>
                      ) : userSearchQuery && searchedUsers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No users found</div>
                      ) : userSearchQuery && searchedUsers.length > 0 ? (
                        <div className="border-t">
                          {searchedUsers.map(a => {
                            return (
                              <Button
                          key={a.id}
                                variant="ghost"
                                className={cn("w-full justify-start text-xs p-2 h-auto", draft.assignee?.id === a.id && "bg-primary/10")}
                                onClick={() => {
                                  update("assignee", a);
                                  setUserSearchQuery("");
                                  setSearchedUsers([]);
                                  setUserSearchOpen(false);
                                }}
                              >
                                <div className="flex flex-col items-start">
                                  <span>{a.name}</span>
                                  {a.email && <span className="text-[10px] text-muted-foreground">{a.email}</span>}
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">Start typing to search users</div>
                      )}
                      {draft.assignee && (
                        <div className="border-t mt-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-xs text-muted-foreground p-2 h-auto"
                            onClick={() => {
                              update("assignee", undefined);
                              setUserSearchOpen(false);
                            }}
                          >
                            <span className="flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              Unassign
                            </span>
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  {draft.assignee ? (
                    <span>Assigned to {draft.assignee.name}{draft.assignee.email && ` (${draft.assignee.email})`}</span>
                  ) : (
                    <span className="flex items-center gap-1"><UserPlus className="h-3 w-3" /> Unassigned</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Story Points</label>
                <Input type="number" className="h-8 text-xs" value={draft.points ?? ''} onChange={e => update("points", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 3" />
              </div>
            </div>
            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium flex justify-between"><span>Description</span><span className="text-[10px] text-muted-foreground">Markdown supported soon</span></label>
              <Textarea value={draft.description || ""} onChange={e => update("description", e.target.value)} rows={6} placeholder="Context, acceptance criteria, links…" />
            </div>
            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Tags</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {(draft.tags || []).map(t => (
                  <Badge key={t} variant="secondary" className="text-[10px] flex items-center gap-1">
                    <span>{t}</span>
                    <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(t)} className="rounded hover:bg-muted p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!draft.tags || draft.tags.length === 0) && (
                  <span className="text-[10px] text-muted-foreground">No tags</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="h-8 text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-8 text-xs">Add</Button>
              </div>
            </div>
            {/* System Meta */}
            <div className="text-[11px] text-muted-foreground grid md:grid-cols-3 gap-2">
              <span>Created: {new Date(draft.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(draft.updatedAt).toLocaleString()}</span>
              <span>ID: {draft.id}</span>
            </div>
   
  
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-2 border-t mt-2">
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="gap-1">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => { if (draft) onSave(draft); onClose(); }} className="gap-1">
            <Save className="h-3 w-3" /> Save
          </Button>
        </div>
        {/* Delete Confirmation */}
        {onDelete && (
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task permanently?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  This action cannot be undone. The task will be removed from all views.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-xs"
                  onClick={() => { onDelete(draft.id); setDeleteOpen(false); onClose(); }}
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
