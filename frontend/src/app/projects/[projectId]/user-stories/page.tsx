'use client'

import React from "react";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import PageLayout from "@/components/project/PageLayout";
import { useToast } from "@/hooks/use-toast";

interface UserStory {
  id: string;
  title: string;
  description: string;
  asA: string;
  iWant: string;
  soThat: string;
  priority: "Low" | "Medium" | "High";
  status: "Backlog" | "In Progress" | "Done";
}

interface UserStoriesPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>
}

export default function UserStoriesPage({ params }: UserStoriesPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? (React as any).use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stories, setStories] = useState<UserStory[]>([
    {
      id: "1",
      title: "User Authentication",
      description: "Login and signup functionality",
      asA: "registered user",
      iWant: "to securely log into the system",
      soThat: "I can access my personalized dashboard",
      priority: "High",
      status: "In Progress",
    },
    // ... other stories
  ]);

  const [newStory, setNewStory] = useState<Partial<UserStory>>({
    title: "",
    asA: "",
    iWant: "",
    soThat: "",
    priority: "Medium",
    status: "Backlog",
  });

  const handleAddStory = () => {
    if (!newStory.title || !newStory.asA || !newStory.iWant || !newStory.soThat) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const story: UserStory = {
      id: Date.now().toString(),
      title: newStory.title,
      description: `As a ${newStory.asA}, I want ${newStory.iWant}, so that ${newStory.soThat}`,
      asA: newStory.asA,
      iWant: newStory.iWant,
      soThat: newStory.soThat,
      priority: newStory.priority as UserStory["priority"],
      status: newStory.status as UserStory["status"],
    };

    setStories([...stories, story]);
    setNewStory({
      title: "",
      asA: "",
      iWant: "",
      soThat: "",
      priority: "Medium",
      status: "Backlog",
    });
    setIsDialogOpen(false);

    toast({
      title: "User story added",
      description: "Your user story has been created successfully",
    });
  };

  const handleDelete = (id: string) => {
    setStories(stories.filter((s) => s.id !== id));
    toast({
      title: "User story deleted",
      description: "The user story has been removed",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive/20 text-destructive";
      case "Medium":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "In Progress":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
  <PageLayout title="User Stories" projectId={projectId}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">User Stories</h2>
                <p className="text-muted-foreground">Define features from user perspective</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary gap-2">
                  <Plus className="h-4 w-4" />
                  Add Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create User Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Story Title</label>
                    <Input
                      placeholder="e.g., User Authentication"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">As a...</label>
                      <Input
                        placeholder="e.g., registered user"
                        value={newStory.asA}
                        onChange={(e) => setNewStory({ ...newStory, asA: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">I want to...</label>
                      <Textarea
                        placeholder="e.g., securely log into the system"
                        value={newStory.iWant}
                        onChange={(e) => setNewStory({ ...newStory, iWant: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">So that...</label>
                      <Textarea
                        placeholder="e.g., I can access my personalized dashboard"
                        value={newStory.soThat}
                        onChange={(e) => setNewStory({ ...newStory, soThat: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={newStory.priority}
                        onChange={(e) => setNewStory({ ...newStory, priority: e.target.value as UserStory["priority"] })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={newStory.status}
                        onChange={(e) => setNewStory({ ...newStory, status: e.target.value as UserStory["status"] })}
                      >
                        <option value="Backlog">Backlog</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={handleAddStory} className="w-full bg-gradient-primary">
                    Create User Story
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="p-6 hover:shadow-[var(--shadow-elevated)] transition-smooth">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{story.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(story.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">As a </span>
                      <span className="font-medium">{story.asA}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">I want to </span>
                      <span className="font-medium">{story.iWant}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">So that </span>
                      <span className="font-medium">{story.soThat}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(story.priority)}>{story.priority}</Badge>
                    <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}