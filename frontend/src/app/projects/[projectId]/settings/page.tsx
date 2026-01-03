"use client";
import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/project/PageLayout";
import ProjectDetailsCard from "@/components/project/settings/ProjectDetailsCard";
import MembersCard from "@/components/project/settings/MembersCard";
import RolesCard from "@/components/project/settings/RolesCard";
import SettingsSidebar, { Section } from "@/components/project/settings/SettingsSidebar";
import { Member, Team, RoleLabel, NewMemberInput } from "@/components/project/settings/types";
import {mockTeams, mockMembers} from "@/components/project/settings/mockData";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProjectById, updateProject } from "@/services/project.service";
interface SettingsPageProps { params: { projectId: string } | Promise<{ projectId: string }> }

export default function SettingsPage({ params }: SettingsPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  // Project details
  const [projectName, setProjectName] = useState("Amazing Project");
  const [projectDescription, setProjectDescription] = useState("A short description of the project goals and scope.");
  const [projectFullDescription, setProjectFullDescription] = useState("");
  const [initialProjectName, setInitialProjectName] = useState("Amazing Project");
  const [initialProjectDescription, setInitialProjectDescription] = useState("A short description of the project goals and scope.");
  const [initialProjectFullDescription, setInitialProjectFullDescription] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const sectionFromQuery: Section = useMemo(() => {
    if (searchParams?.has("roles")) return "roles";
    if (searchParams?.has("access")) return "access";
    return "project";
  }, [searchParams]);

  const [activeSection, setActiveSection] = useState<Section>(sectionFromQuery);

  useEffect(() => {
    setActiveSection(sectionFromQuery);
  }, [sectionFromQuery]);

  const navigateToSection = (section: Section) => {
    const base = `/projects/${projectId}/settings`;
    const suffix = section === "roles" ? "?roles" : section === "access" ? "?access" : "";
    router.replace(`${base}${suffix}`);
    setActiveSection(section);
  };

  const saveProjectDetails = async () => {
    setSavingProject(true);
    try {
      await updateProject(projectId, {
        name: projectName,
        description: projectDescription,
        full_description: projectFullDescription,
      });
      setInitialProjectName(projectName);
      setInitialProjectDescription(projectDescription);
      setInitialProjectFullDescription(projectFullDescription);
    } catch (e) {
      console.error("Failed to save project", e);
    } finally {
      setSavingProject(false);
    }
  };

  const cancelProjectChanges = () => {
    setProjectName(initialProjectName);
    setProjectDescription(initialProjectDescription);
    setProjectFullDescription(initialProjectFullDescription);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const proj = await fetchProjectById(projectId);
        const name = proj.name ?? "";
        const desc = proj.description ?? "";
        const fullDesc = proj.full_description ?? "";
        setProjectName(name);
        setProjectDescription(desc);
        setProjectFullDescription(fullDesc);
        setInitialProjectName(name);
        setInitialProjectDescription(desc);
        setInitialProjectFullDescription(fullDesc);
      } catch (e) {
        console.error("Failed to load project", e);
      }
    };
    if (projectId) load();
  }, [projectId]);

  const hasProjectChanges = useMemo(
    () =>
      projectName !== initialProjectName ||
      projectDescription !== initialProjectDescription ||
      projectFullDescription !== initialProjectFullDescription,
    [projectName, initialProjectName, projectDescription, initialProjectDescription, projectFullDescription, initialProjectFullDescription]
  );

  return (
  <PageLayout title="Settings" projectId={projectId}>
      <div className="px-6 py-6  mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <aside className="hidden md:block sticky top-20 self-start">
            <SettingsSidebar active={activeSection} onSelect={navigateToSection} />
          </aside>
          <main className="space-y-6">
            {activeSection === "project" && (
              <ProjectDetailsCard
                projectName={projectName}
                projectDescription={projectDescription}
                projectFullDescription={projectFullDescription}
                hasChanges={hasProjectChanges}
                saving={savingProject}
                onChangeName={setProjectName}
                onChangeDescription={setProjectDescription}
                onChangeFullDescription={setProjectFullDescription}
                onSave={saveProjectDetails}
                onCancel={cancelProjectChanges}
              />
            )}

            {activeSection === "roles" && (
              <RolesCard projectId={projectId} />
            )}

            {activeSection === "access" && (
              <MembersCard projectId={projectId} />
            )}
          </main>
        </div>
      </div>
    </PageLayout>
  );
}