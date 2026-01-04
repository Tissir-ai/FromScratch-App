"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Layout, Save, X } from "lucide-react";

interface ProjectDetailsCardProps {
  projectName: string;
  projectDescription: string;
  projectFullDescription: string;
  hasChanges: boolean;
  saving: boolean;
  onChangeName: (name: string) => void;
  onChangeDescription: (desc: string) => void;
  onChangeFullDescription: (desc: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProjectDetailsCard({
  projectName,
  projectDescription,
  projectFullDescription,
  hasChanges,
  saving,
  onChangeName,
  onChangeDescription,
  onChangeFullDescription,
  onSave,
  onCancel,
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
            rows={2}
            placeholder="Describe the project"
          />
          <p className="text-xs text-muted-foreground">Write a short description to set context for your team.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
        <label className="text-sm text-muted-foreground mt-2">Full Description</label>
        <div className="space-y-2">
          <Textarea
            value={projectFullDescription}
            onChange={(e) => onChangeFullDescription(e.target.value)}
            rows={8}
            placeholder="Describe the project"
          />
          <p className="text-xs text-muted-foreground">Write your full description to provide detailed context for your team.</p>
        </div>
      </div>
      {hasChanges && (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving} className="gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}
    </Card>
  );
}
