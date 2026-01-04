"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { createRole, updateRole, type RoleWithUsers, type Permission } from "@/services/role.service";
import { AVAILABLE_PERMISSIONS } from "./types";
import { useToast } from "@/hooks/use-toast";

interface RoleEditorDialogProps {
  open: boolean;
  projectId: string;
  role: RoleWithUsers | null; // null = create mode
  onClose: (saved: boolean) => void;
}

// Group permissions by category for better UX
const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "Project",
    permissions: ["manage_project", "view_dashboard", "view_overview"],
  },
  {
    label: "Diagrams",
    permissions: ["view_diagrams", "create_diagrams", "edit_diagrams", "delete_diagrams"],
  },
  {
    label: "Tasks",
    permissions: ["view_tasks", "create_tasks", "edit_tasks", "delete_tasks"],
  },
  {
    label: "Requirements",
    permissions: ["view_requirements", "create_requirements", "edit_requirements", "delete_requirements"],
  },
  {
    label: "Reports",
    permissions: ["view_reports", "download_reports"],
  },
  {
    label: "Logs",
    permissions: ["view_logs", "create_logs", "edit_logs", "delete_logs"],
  },
];

export default function RoleEditorDialog({
  open,
  projectId,
  role,
  onClose,
}: RoleEditorDialogProps) {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const isEditing = !!role;

  // Initialize form when dialog opens or role changes
  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setSelectedPermissions(new Set(role.permissions));
      } else {
        setName("");
        setSelectedPermissions(new Set());
      }
    }
  }, [open, role]);

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPermissions(new Set(AVAILABLE_PERMISSIONS as unknown as Permission[]));
  };

  const clearAll = () => {
    setSelectedPermissions(new Set());
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const perms = Array.from(selectedPermissions);

      if (isEditing && role) {
        await updateRole(projectId, role.id, { name: name.trim(), permissions: perms });
        toast({
          title: "Success",
          description: `Role "${name}" updated`,
        });
      } else {
        await createRole(projectId, name.trim(), perms);
        toast({
          title: "Success",
          description: `Role "${name}" created`,
        });
      }

      onClose(true);
    } catch (error: any) {
      console.error("Failed to save role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the role name and permissions."
              : "Define a new role with specific permissions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Developer, Designer, QA"
            />
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Permissions ({selectedPermissions.size} selected)</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[280px] border rounded-md p-3">
              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                        >
                          <Checkbox
                            checked={selectedPermissions.has(perm)}
                            onCheckedChange={() => togglePermission(perm)}
                          />
                          <span className="capitalize">
                            {perm.replace(/_/g, " ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Role"
            ) : (
              "Create Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
