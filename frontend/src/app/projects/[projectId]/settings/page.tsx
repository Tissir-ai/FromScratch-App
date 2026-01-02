"use client";
import React, { useState } from "react";
import PageLayout from "@/components/project/PageLayout";
import ProjectDetailsCard from "@/components/project/settings/ProjectDetailsCard";
import TeamsCard from "@/components/project/settings/TeamsCard";
import MembersCard from "@/components/project/settings/MembersCard";
import SettingsSidebar from "@/components/project/settings/SettingsSidebar";
import { Member, Team, Role } from "@/components/project/settings/types";
import {mockTeams, mockMembers} from "@/components/project/settings/mockData";
interface SettingsPageProps { params: { projectId: string } | Promise<{ projectId: string }> }

export default function SettingsPage({ params }: SettingsPageProps) {
  // Always call React.use() unconditionally to maintain hooks order
  const resolved = React.use(
    typeof (params as any)?.then === "function"
      ? (params as Promise<{ projectId: string }>)
      : Promise.resolve(params as { projectId: string })
  );
  const projectId = resolved.projectId;
  // Project details
  const [projectName, setProjectName] = useState("Amazing Project");
  const [projectDescription, setProjectDescription] = useState(
    "A short description of the project goals and scope."
  );
  const [savingProject, setSavingProject] = useState(false);
  const [activeSection, setActiveSection] = useState<"project" | "teams" | "members">("project");
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const createTeam = (name: string) => {
    const team: Team = {
      id: crypto.randomUUID(),
      name,
      pageAccess: [],
      memberIds: [],
    };
    setTeams((prev) => [...prev, team]);
  };

  const toggleTeamPage = (teamId: string, page: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const had = t.pageAccess.includes(page);
        const nextAccess = had
          ? t.pageAccess.filter((p) => p !== page)
          : [...t.pageAccess, page];
        // If removing access, also remove this page from all members' permissions of this team
        if (had) {
          setMembers((prevM) =>
            prevM.map((m) =>
              m.teamId === teamId
                ? {
                    ...m,
                    permissions: {
                      read: m.permissions.read.filter((p) => p !== page),
                      write: m.permissions.write.filter((p) => p !== page),
                    },
                  }
                : m
            )
          );
        }
        return { ...t, pageAccess: nextAccess };
      })
    );
  };

  const removeTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setMembers((prev) =>
      prev.map((m) => (m.teamId === teamId ? { ...m, teamId: undefined } : m))
    );
  };

  const addMember = (input: Omit<Member, "id">) => {
    const member: Member = {
      ...input,
      permissions: input.permissions ?? { read: [], write: [] },
      id: crypto.randomUUID(),
    };
    setMembers((prev) => [...prev, member]);
    if (member.teamId) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === member.teamId
            ? { ...t, memberIds: [...t.memberIds, member.id] }
            : t
        )
      );
    }
  };

  const changeMemberRole = (memberId: string, role: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
  };

  const assignMemberTeam = (memberId: string, teamId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        if (!teamId) {
          // Becoming Guest: clear permissions
          return { ...m, teamId: undefined, permissions: { read: [], write: [] } };
        }
        const team = teams.find((t) => t.id === teamId);
        const allowed = team?.pageAccess ?? [];
        return {
          ...m,
          teamId,
          permissions: {
            read: m.permissions.read.filter((p) => allowed.includes(p)),
            write: m.permissions.write.filter((p) => allowed.includes(p)),
          },
        };
      })
    );
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId && !t.memberIds.includes(memberId)
          ? { ...t, memberIds: [...t.memberIds, memberId] }
          : t
      )
    );
  };

  const toggleMemberPermission = (
    memberId: string,
    kind: "read" | "write",
    page: string
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        // Only allow toggling for pages in the member's team pageAccess
        const team = m.teamId ? teams.find((t) => t.id === m.teamId) : undefined;
        if (!team || !team.pageAccess.includes(page)) return m;
        const current = m.permissions[kind];
        const next = current.includes(page)
          ? current.filter((p) => p !== page)
          : [...current, page];
        return { ...m, permissions: { ...m.permissions, [kind]: next } };
      })
    );
  };

  const saveProjectDetails = async () => {
    setSavingProject(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingProject(false);
  };

  return (
  <PageLayout title="Settings" projectId={projectId}>
      <div className="px-6 py-6  mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <aside className="hidden md:block sticky top-20 self-start">
            <SettingsSidebar active={activeSection} onSelect={setActiveSection} />
          </aside>
          <main className="space-y-6">
            {activeSection === "project" && (
              <ProjectDetailsCard
                projectName={projectName}
                projectDescription={projectDescription}
                saving={savingProject}
                onChangeName={setProjectName}
                onChangeDescription={setProjectDescription}
                onSave={saveProjectDetails}
              />
            )}

            {activeSection === "teams" && (
              <TeamsCard
                teams={teams}
                members={members}
                onCreateTeam={createTeam}
                onRemoveTeam={removeTeam}
                onToggleTeamPage={toggleTeamPage}
                onToggleMemberPermission={toggleMemberPermission}
                onAddMember={addMember}
                onAssignMemberTeam={assignMemberTeam}
              />
            )}

            {activeSection === "members" && (
              <MembersCard
                members={members}
                teams={teams}
                onChangeMemberRole={changeMemberRole}
                onAssignMemberTeam={assignMemberTeam}
              />
            )}
          </main>
        </div>
      </div>
    </PageLayout>
  );
}