"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TeamModal from "@/components/project/TeamModal";
import { Shield, Trash2, Loader2 } from "lucide-react";
import { Member } from "./types";
import { Button } from "@/components/ui/button";
import { fetchRoles, type RoleWithUsers } from "@/services/role.service";
import { searchUsersSettings, assignUserRole, removeUserFromProject } from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface MembersCardProps {
  projectId: string;
}

export default function MembersCard({ projectId }: MembersCardProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{
    member: Member;
    roleId: string;
    roleName: string;
  } | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, rolesData] = await Promise.all([
        searchUsersSettings(projectId),
        fetchRoles(projectId),
      ]);
      setMembers(membersData as unknown as Member[]);
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to fetch members/roles:", error);
      toast({
        title: "Error",
        description: "Failed to load members and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false) ||
        (m.role?.toLowerCase().includes(q) ?? false)
    );
  }, [members, query]);

  const handleRoleChangeRequest = (member: Member, roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    setRoleChangeConfirm({
      member,
      roleId,
      roleName: role?.name ?? "this role",
    });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeConfirm) return;
    const { member, roleId, roleName } = roleChangeConfirm;
    try {
      await assignUserRole(projectId, member.id, roleId);
      toast({
        title: "Success",
        description: `${member.name}'s role changed to ${roleName}`,
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to assign role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setRoleChangeConfirm(null);
    }
  };

  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      setDeletingMember(memberToDelete.id);
      await removeUserFromProject(projectId, memberToDelete.id);
      toast({
        title: "Success",
        description: `${memberToDelete.name} removed from project`,
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member from project",
        variant: "destructive",
      });
    } finally {
      setDeletingMember(null);
      setMemberToDelete(null);
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
              <Shield className="h-4 w-4 text-primary" /> Manage Access
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Search members, update roles, and remove users from this project.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, or role..."
              className="h-8 w-48 md:w-64"
            />
            <Button
              variant="outline"
              className="h-8"
              onClick={() => setInviteOpen(true)}
            >
              Invite Members
            </Button>
          </div>
        </div>

        {/* Invite to collaborate dialog */}
        <TeamModal
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          projectId={projectId}
        />

        <div className="space-y-3">
          {filtered.map((member) => {
            const currentRoleId = member.role_id || roles.find((r) => r.name.toLowerCase() === member.role?.toLowerCase())?.id || "";
            const isDeleting = deletingMember === member.id;
            return (
              <div key={member.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium leading-tight">
                      {member.name} 
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role: {member.role}
                    </p>
                  </div>
                  {member.role.toLowerCase() === "owner" ? (
                    <span className="text-sm font-medium text-muted-foreground">
                      Owner
                    </span>
                  ) : (
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentRoleId}
                      onValueChange={(roleId) => handleRoleChangeRequest(member, roleId)}
                    >
                      <SelectTrigger className="h-8 w-[160px] text-xs">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id} className="text-xs">
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteMember(member)}
                      disabled={isDeleting}
                      title="Remove member"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No members found.
            </p>
          )}
        </div>
      </Card>

      {/* Role change confirmation dialog */}
      <AlertDialog
        open={!!roleChangeConfirm}
        onOpenChange={() => setRoleChangeConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Member Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {roleChangeConfirm?.member.name}'s role to {roleChangeConfirm?.roleName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToDelete?.name}</strong> from
              this project? This action cannot be undone and they will lose all access
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingMember !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deletingMember !== null}
            >
              {deletingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

