"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Layout, Save } from "lucide-react";

interface ProjectDetailsCardProps {
  projectName: string;
  projectDescription: string;
  saving: boolean;
  onChangeName: (name: string) => void;
  onChangeDescription: (desc: string) => void;
  onSave: () => void;
}

export default function ProjectDetailsCard({
  projectName,
  projectDescription,
  saving,
  onChangeName,
  onChangeDescription,
  onSave,
}: ProjectDetailsCardProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layout className="h-4 w-4 text-primary" /> Project Details
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Name and describe your project. This appears across the workspace.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
        <label className="text-sm text-muted-foreground mt-2">Project name</label>
        <div className="space-y-2">
          <Input
            value={projectName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Enter project name"
          />
          <p className="text-xs text-muted-foreground">A clear, concise name helps collaborators identify the project.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
        <label className="text-sm text-muted-foreground mt-2">Description</label>
        <div className="space-y-2">
          <Textarea
            value={projectDescription}
            onChange={(e) => onChangeDescription(e.target.value)}
            rows={3}
            placeholder="Describe the project"
          />
          <p className="text-xs text-muted-foreground">Write a short description to set context for your team.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
