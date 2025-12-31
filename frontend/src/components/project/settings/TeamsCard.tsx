"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, X } from "lucide-react";
import { AVAILABLE_PAGES, Team, Member, NewMemberInput, ROLES } from "./types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TeamsCardProps {
  teams: Team[];
  members: Member[];
  onCreateTeam: (name: string) => void;
  onRemoveTeam: (teamId: string) => void;
  onToggleTeamPage: (teamId: string, page: string) => void;
  onToggleMemberPermission: (
    memberId: string,
    kind: "read" | "write",
    page: string
  ) => void;
  onAddMember: (member: NewMemberInput) => void;
  onAssignMemberTeam: (memberId: string, teamId: string) => void;
}

export default function TeamsCard({
  teams,
  members,
  onCreateTeam,
  onRemoveTeam,
  onToggleTeamPage,
  onToggleMemberPermission,
  onAddMember,
  onAssignMemberTeam,
}: TeamsCardProps) {
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [pageFilter, setPageFilter] = useState("");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  // Unified manage dialog
  const [manageOpen, setManageOpen] = useState(false);
  const [manageTeamId, setManageTeamId] = useState<string | null>(null);
  const [manageTab, setManageTab] = useState<"members" | "pages" | "permissions">("members");
  const [membersQuery, setMembersQuery] = useState("");
  // Add-member modal state (GitHub-like invite)
  const [addOpen, setAddOpen] = useState(false);
  const [addTeamId, setAddTeamId] = useState<string | null>(null);
  const [addQuery, setAddQuery] = useState("");
  const [addSelectedId, setAddSelectedId] = useState<string | null>(null);

  // pageFilter is used within the Manage pages dialog

  const handleCreate = () => {
    if (!newTeamName.trim()) return;
    onCreateTeam(newTeamName.trim());
    setNewTeamName("");
    setShowTeamForm(false);
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Teams
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Teams control which pages are visible (page access). Members in a team can be granted read or write per page. Users without a team are treated as guests.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowTeamForm((v) => !v)}
          className="gap-1"
        >
          {showTeamForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showTeamForm ? "Cancel" : "New Team"}
        </Button>
      </div>
      {showTeamForm && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Team name"
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={!newTeamName.trim()} className="gap-2">
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
      )}
      <div className="rounded-md border divide-y">
        {teams.map((team) => (
          <div
            key={team.id}
            className={cn(
              "p-4 space-y-3",
              activeTeamId === team.id && "bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="font-medium truncate">{team.name}</h4>
                <p className="text-xs text-muted-foreground">{team.memberIds.length} members • {team.pageAccess.length} pages</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setManageTeamId(team.id); setManageTab("members"); setManageOpen(true); setMembersQuery(""); }}
                  className="text-xs text-primary hover:underline"
                >
                  Manage Team
                </button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemoveTeam(team.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {team.pageAccess.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No pages assigned
                </span>
              )}
              {team.pageAccess.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
            {/* Inline manager removed; handled via dialog below */}
          </div>
        ))}
        {teams.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No teams yet. Create your first team to start organizing access.
          </div>
        )}
      </div>
      {/* Unified Manage dialog with tabs */}
      <Dialog open={manageOpen} onOpenChange={(o) => { if (!o) { setManageOpen(false); setManageTeamId(null); setMembersQuery(""); setPageFilter(""); setManageTab("members"); } }}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {(() => {
                const t = manageTeamId ? teams.find(tt => tt.id === manageTeamId) : undefined;
                return <>Manage {t?.name ?? "team"}</>;
              })()}
            </DialogTitle>
            <DialogDescription>Members, Pages, and Permissions in one place.</DialogDescription>
          </DialogHeader>
          {(() => {
            const team = manageTeamId ? teams.find(t => t.id === manageTeamId) : undefined;
            if (!team) return <p className="text-sm text-muted-foreground">Select a team to manage.</p>;
            const teamMembers = members.filter(m => m.teamId === team.id);
            const TabButton = ({id, label}:{id:"members"|"pages"|"permissions"; label:string}) => (
              <button onClick={()=>setManageTab(id)} className={cn("px-3 py-1.5 text-sm rounded border", manageTab===id?"bg-primary text-primary-foreground border-primary":"hover:bg-muted")}>{label}</button>
            );
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TabButton id="members" label="Members" />
                  <TabButton id="pages" label="Pages" />
                  <TabButton id="permissions" label="Permissions" />
                </div>
                {/* Content */}
                {manageTab === "members" && (
                  <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
                    {/* About */}
                    <div>
                      <div className="rounded-md border p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-semibold text-sm">
                            {initialsFromName(team.name).slice(0,1)}
                          </div>
                          <div>
                            <h4 className="font-medium">{team.name}</h4>
                            <p className="text-xs text-muted-foreground">Team</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h5 className="text-sm font-medium">About</h5>
                          <p className="text-sm text-muted-foreground mt-1">This team has no description</p>
                        </div>
                      </div>
                    </div>
                    {/* Members list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {teamMembers.length} member{teamMembers.length===1?"":"s"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={membersQuery}
                            onChange={(e) => { setMembersQuery(e.target.value); }}
                            placeholder="Find a member..."
                            className="h-8 w-56"
                          />
                          <Button
                            onClick={() => { setAddTeamId(team.id); setAddOpen(true); setAddQuery(""); setAddSelectedId(null); }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                          >
                            Add a member
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-md border divide-y">
                        {teamMembers.length === 0 && (
                          <div className="p-4 text-sm text-muted-foreground">No members in this team yet.</div>
                        )}
                        {teamMembers.map((m) => (
                          <div key={m.id} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                                {m.name.slice(0,1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{m.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{m.role}</span>
                              <Button size="sm" variant="ghost" onClick={() => onAssignMemberTeam(m.id, "")}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {manageTab === "pages" && (
                  (() => {
                    const filtered = AVAILABLE_PAGES.filter(p => p.includes(pageFilter.toLowerCase()));
                    const grantAll = () => {
                      AVAILABLE_PAGES.forEach(p => { if (!team.pageAccess.includes(p)) onToggleTeamPage(team.id, p); });
                    };
                    const clearAll = () => {
                      team.pageAccess.forEach(p => onToggleTeamPage(team.id, p));
                    };
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={pageFilter}
                            onChange={(e) => setPageFilter(e.target.value)}
                            placeholder="Filter pages"
                            className="h-8 text-xs w-48"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={grantAll}>Grant all</Button>
                            <Button size="sm" variant="ghost" onClick={clearAll}>Clear all</Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                          {filtered.map((p) => {
                            const assigned = team.pageAccess.includes(p);
                            return (
                              <button
                                key={p}
                                onClick={() => onToggleTeamPage(team.id, p)}
                                className={cn(
                                  "text-xs px-2 py-2 rounded border text-left",
                                  assigned ? "bg-primary/10 border-primary/40" : "hover:bg-muted"
                                )}
                              >
                                {assigned ? "✓" : "+"} {p}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                )}
                {manageTab === "permissions" && (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {teamMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members in this team yet.</p>
                    ) : (
                      teamMembers.map((m) => (
                        <div key={m.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="truncate"><span className="font-medium">{m.name}</span> <span className="text-muted-foreground">({m.email})</span></div>
                            <div className="text-muted-foreground">
                              {m.permissions.read.filter(p => team.pageAccess.includes(p)).length} Read • {m.permissions.write.filter(p => team.pageAccess.includes(p)).length} Write
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {team.pageAccess.length === 0 ? (
                              <p className="text-[11px] text-muted-foreground">No pages assigned to this team.</p>
                            ) : (
                              team.pageAccess.map((p) => (
                                <PermissionRow
                                  key={m.id + p}
                                  page={p}
                                  read={m.permissions.read.includes(p)}
                                  write={m.permissions.write.includes(p)}
                                  onToggleRead={() => onToggleMemberPermission(m.id, "read", p)}
                                  onToggleWrite={() => onToggleMemberPermission(m.id, "write", p)}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setManageOpen(false); setManageTeamId(null); setMembersQuery(""); setPageFilter(""); setManageTab("members"); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add member modal within unified dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setAddOpen(false); setAddTeamId(null); setAddQuery(""); setAddSelectedId(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {(() => {
                const t = addTeamId ? teams.find(tt => tt.id === addTeamId) : undefined;
                return <>Add member to {t?.name ?? "team"}</>;
              })()}
            </DialogTitle>
            <DialogDescription>Search by username, full name or email address</DialogDescription>
          </DialogHeader>
          {(() => {
            const t = addTeamId ? teams.find(tt => tt.id === addTeamId) : undefined;
            if (!t) return <p className="text-sm text-muted-foreground">Select a team first.</p>;
            const pool = members.filter(m => m.teamId !== t.id);
            const q = addQuery.trim().toLowerCase();
            const matches = q ? pool.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)).slice(0, 8) : [];
            return (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    value={addQuery}
                    onChange={(e) => { setAddQuery(e.target.value); setAddSelectedId(null); }}
                    placeholder="Search members..."
                    className="h-10"
                  />
                </div>
                {matches.length > 0 && (
                  <div className="rounded-md border p-2 max-h-56 overflow-y-auto">
                    {matches.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setAddSelectedId(m.id)}
                        className={cn("w-full text-left text-sm px-2 py-1 rounded", addSelectedId===m.id?"bg-primary/10":"hover:bg-muted")}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium">
                            {initialsFromName(m.name || m.email, true)}
                          </div>
                          <div className="truncate">
                            <span className="font-medium">{m.name}</span> <span className="text-muted-foreground">{m.email}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setAddTeamId(null); setAddQuery(""); setAddSelectedId(null); }}>Cancel</Button>
            <Button
              onClick={() => { if (addSelectedId && addTeamId) { onAssignMemberTeam(addSelectedId, addTeamId); setAddOpen(false); setAddTeamId(null); setAddQuery(""); setAddSelectedId(null); } }}
              disabled={!addSelectedId || !addTeamId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}

function PermissionRow({ page, read, write, onToggleRead, onToggleWrite }: { page: string; read: boolean; write: boolean; onToggleRead: () => void; onToggleWrite: () => void }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-muted-foreground">{page}</span>
      <div className="flex gap-2">
        <button onClick={onToggleRead} className={cn("px-2 py-0.5 rounded border", read ? "bg-primary/10 border-primary/40" : "hover:bg-muted")}>{read ? "✓" : "+"} Read</button>
        <button onClick={onToggleWrite} className={cn("px-2 py-0.5 rounded border", write ? "bg-primary/10 border-primary/40" : "hover:bg-muted")}>{write ? "✓" : "+"} Write</button>
      </div>
    </div>
  );
}

function initialsFromName(full: string, twoLetters = false): string {
  const base = (full || "").toString().trim();
  if (!base) return "";
  // If it's an email, take the part before '@'
  const name = base.includes("@") ? base.split("@")[0].replace(/\./g, " ") : base;
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const initials = twoLetters ? (first + last) : first;
  return initials.toUpperCase();
}
