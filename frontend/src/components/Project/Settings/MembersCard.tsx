"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TeamModal from "@/components/Project/TeamModal";
import { Shield } from "lucide-react";
import { Member, Role, Team } from "./types";
import { Button } from "@/components/ui/button";

interface MembersCardProps {
  members: Member[];
  teams: Team[];
  onChangeMemberRole: (memberId: string, role: Role) => void;
  onAssignMemberTeam: (memberId: string, teamId: string) => void;
}

export default function MembersCard({
  members,
  teams,
  onChangeMemberRole,
  onAssignMemberTeam,
}: MembersCardProps) {
  const [query, setQuery] = useState("");
const [inviteOpen, setInviteOpen] = useState(false);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, query]);

  const permsMember = null;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Members & Roles
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Search the roster, assign roles, and move members between teams. Page permissions are managed from the Teams section.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members"
            className="h-8 w-40 md:w-64"
          />
        </div>
        <div className="flex items-center gap-2">
         <Button    
            variant="outline"
            className="h-8 ml-2"
            onClick={() => setInviteOpen(true)}
            >Invite Members
          </Button>
        </div>
      </div>

      {/* Invite to collaborate dialog */}
        <TeamModal 
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      <div className="space-y-3">
        {filtered.map((member) => {
          const team = teams.find((t) => t.id === member.teamId);
          const isGuest = !member.teamId;
          return (
            <div key={member.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">
                    {member.name} <span className="text-xs text-muted-foreground">({member.email})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role: {member.role} {team ? <>• Team: {team.name}</> : <>• Guest</>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={member.teamId || ""}
                    onChange={(e) => onAssignMemberTeam(member.id, e.target.value)}
                    className="text-[10px] px-2 py-1 rounded border bg-background"
                  >
                    <option value="">No Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {team ? (
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {member.permissions.read.filter((p) => team.pageAccess.includes(p)).length} Read • {member.permissions.write.filter((p) => team.pageAccess.includes(p)).length} Write
                  </p>
                  <span className="text-[11px] text-muted-foreground">Edit in Teams → Manage permissions</span>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">Guest users have no team and minimal access.</p>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No members found.</p>
        )}
      </div>
    </Card>
  );
}

