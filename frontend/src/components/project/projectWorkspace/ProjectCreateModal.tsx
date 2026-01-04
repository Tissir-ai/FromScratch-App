"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wand2, Rocket, FolderPlus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectCreateModalProps {
  onCreate: (payload: { name: string; description?: string }) => Promise<void>
  onGenerate: (idea: string) => Promise<void>
}

export function ProjectCreateModal({ onCreate, onGenerate }: ProjectCreateModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("blank")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [idea, setIdea] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const MAX_PROMPT = 1000

  const { toast } = useToast()

  const reset = () => {
    setName("")
    setDescription("")
    setIdea("")
    setActiveTab("blank")
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      setIsSubmitting(true)
      await onCreate({ name: name.trim(), description: description.trim() || undefined })
      setOpen(false)
      reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerate = async () => {
    const len = idea.trim().length
    if (len === 0) {
      toast({ title: "Empty prompt", description: "Please provide instructions for the AI.", variant: "destructive" })
      return
    } 
    if (len <= 30) {
      toast({ title: "Too short", description: `Please provide a longer prompt (at least 1001 characters). Current: ${len}.`, variant: "destructive" })
      return
    }
    if (len > MAX_PROMPT) {
      toast({ title: "Too long", description: `Please shorten your prompt to at most ${MAX_PROMPT} characters. Current: ${len}.`, variant: "destructive" })
      return
    }
    try {
      setIsSubmitting(true)
      await onGenerate(idea.trim())
      setOpen(false)
      reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset() }}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Rocket className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Create a project</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Quickly create a blank project or ask AI to generate a project scaffold for you.</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="grid grid-cols-2 w-full rounded-md bg-muted/30 p-1">
            <TabsTrigger value="blank" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Blank
            </TabsTrigger>
            <TabsTrigger value="fromscratch" className="gap-2">
              <Wand2 className="h-4 w-4" />
              FromScratch.ai
            </TabsTrigger>
          </TabsList>

          <div className="w-full grid grid-cols-1 gap-6 mt-4">
            <TabsContent value="blank" className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Project name <span className="text-rose-500">*</span></label>
                <Input className="w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Payments Revamp" />
                <p className="text-xs text-muted-foreground">A short, descriptive name. This can be changed later.</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea className="w-full" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary of the project (optional)" rows={4} />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">Manual</Badge>
                  Create an empty project.
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={isSubmitting}>Cancel</Button>
                  <Button size="sm" onClick={handleCreate} disabled={isSubmitting || !name.trim()} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4" />
                        Creating...
                      </>
                    ) : (
                      "Create project"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fromscratch" className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Tell the AI what to build</label>
                <Textarea className="w-full" value={idea} onChange={(e) => setIdea(e.target.value.slice(0, MAX_PROMPT))} placeholder="Goals, constraints, and context for the AI to generate a project blueprint." rows={6} />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Example: "Create a payments microservice with Stripe, tests, and CI"</p>
                    <div className={"text-xs " + (idea.trim().length >= 30 ? "text-emerald-600" : "text-rose-600")}>
                      {idea.trim().length} / {MAX_PROMPT} characters {idea.trim().length >= 30 ? "(ready)" : `(need ${30 - idea.trim().length} more)`}
                    </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="gap-1">
                    <Wand2 className="h-3 w-3" /> AI assisted
                  </Badge>
                  The AI will generate backlog, diagrams, and requirements.
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setOpen(false); reset(); }} disabled={isSubmitting}>Cancel</Button>
                  <Button size="sm" onClick={handleGenerate} disabled={isSubmitting || idea.trim().length <= 30} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      "Generate project"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
