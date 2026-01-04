"use client";
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { fetchRoles, deleteRole, type RoleWithUsers } from "@/services/role.service";
import { useToast } from "@/hooks/use-toast";
import RoleEditorDialog from "@/components/project/settings/RoleEditorDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RolesCardProps {
  projectId: string;
}

export default function RolesCard({ projectId }: RolesCardProps) {
  const [roles, setRoles] = useState<RoleWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithUsers | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithUsers | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await fetchRoles(projectId);
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadRoles();
    }
  }, [projectId]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, query]);

  const handleCreateRole = () => {
    setEditingRole(null);
    setEditorOpen(true);
  };

  const handleEditRole = (role: RoleWithUsers) => {
    setEditingRole(role);
    setEditorOpen(true);
  };

  const handleDeleteClick = (role: RoleWithUsers) => {
    if (role.users.length > 0) {
      toast({
        title: "Cannot delete role",
        description: `This role is assigned to ${role.users.length} user(s). Reassign them first.`,
        variant: "destructive",
      });
      return;
    }
    setRoleToDelete(role);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      setDeleting(true);
      await deleteRole(projectId, roleToDelete.id);
      toast({
        title: "Success",
        description: `Role "${roleToDelete.name}" deleted`,
      });
      await loadRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setRoleToDelete(null);
    }
  };

  const handleEditorClose = (saved: boolean) => {
    setEditorOpen(false);
    setEditingRole(null);
    if (saved) {
      loadRoles();
    }
  };

  if (loading) {
    return (
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Roles & Permissions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage roles with custom permissions. Owner role cannot be modified.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles..."
              className="h-8 w-48 md:w-64"
            />
            <Button size="sm" onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-1" /> New Role
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((role) => (
            <div key={role.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium leading-tight capitalize">
                    {role.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {role.permissions.length} permissions
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {role.users.length} user{role.users.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRole(role)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(role)}
                    className="text-destructive hover:text-destructive"
                    disabled={role.users.length > 0}
                    title={
                      role.users.length > 0
                        ? "Cannot delete: role has assigned users"
                        : "Delete role"
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* Permission preview */}
              <div className="flex flex-wrap gap-1 mt-2">
                {role.permissions.slice(0, 5).map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs capitalize">
                    {perm.replace(/_/g, " ")}
                  </Badge>
                ))}
                {role.permissions.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.permissions.length - 5} more
                  </Badge>
                )}
              </div>
              <div>
                {/* Assigned users preview + copy role name */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center flex-wrap gap-2">
                  {role.users.length > 0 ? (
                    role.users.map((user) => (
                    <div
                      key={user.id}
                      title={user.name}
                       onClick={async () => {
                    try {
                    await navigator.clipboard.writeText(user.name);
                    toast({
                      title: "Copied",
                      description: `User name "${user.name}" copied to clipboard`,
                    });
                    } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to copy role name",
                      variant: "destructive",
                    });
                    }
                  }}
                      className="cursor-pointer inline-flex items-center justify-center h-8 min-w-[33px] px-2 rounded-full bg-primary text-white text-xs font-medium"
                    >
                      {user.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                    </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No users assigned</span>
                  )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {query ? "No roles match your search." : "No custom roles yet."}
            </p>
          )}
        </div>
      </Card>

      {/* Role Editor Dialog */}
      <RoleEditorDialog
        open={editorOpen}
        projectId={projectId}
        role={editingRole}
        onClose={handleEditorClose}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
