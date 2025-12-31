"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Calendar, FileText, User, ExternalLink, Edit2, Copy, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { Project } from "@/types/project.type"
import { OwnerBadge } from "./OwnerBadge"
import { formatDate } from "@/lib/date-utils"

interface ProjectDetailsPanelProps {
  project: Project | null
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailsPanel({
  project,
  isOwner,
  open,
  onOpenChange,
}: ProjectDetailsPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!project) return null

  const ownerInitials = (name: string) => name.split(" ").map((p) => p[0]?.toUpperCase() ?? "").slice(0,2).join("")
  const memberInitials = ownerInitials

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(project.id)
      setCopied(true)
      toast({ title: "Copied", description: "Project ID copied to clipboard" })
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      toast({ title: "Copy failed", description: "Could not copy project ID", variant: "destructive" })
    }
  }

  const shareLink = async () => {
    const url = `${window.location.origin}/projects/${project.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copied", description: "Project link copied to clipboard" })
    } catch (err) {
      toast({ title: "Share failed", description: "Could not copy link", variant: "destructive" })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold leading-snug">{project.name}</SheetTitle>

               
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{project.description ?? project.owner.name}</p>
              </div>
                {/* Project ID */}
               <div className="flex  items-center">
            <p className="text-xs font-semibold text-muted-foreground mr-1">Project ID :</p>
           <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-muted-foreground break-all">{project.id}</p>
              <Button size="sm" variant="ghost" onClick={copyId}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
                </div>
              </div>
            </div>
          </div>
          
        </SheetHeader>

        <div className="space-y-6 mt-6">
           
          {/* Description */}
          {project.full_description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground">{project.full_description}</p>
            </div>
          )}

          <Separator />

          {/* Owner */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Owner
            </h3>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-muted/40 border border-muted">{ownerInitials(project.owner.name)}</div>
                <div>
                  <p className="text-sm font-medium">{project.owner.name}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>
              {isOwner && (
                <Badge variant="default" className="bg-amber-600">
                  You
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({project.members?.length || 0})
            </h3>

            {project.members && project.members.length > 0 ? (
              <div className="space-y-2">
                {project.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-muted/40 border border-muted">{memberInitials(member.name)}</div>
                      <div>
                        <p className="text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role_name ?? "Member"}</p>
                      </div>
                    </div>
                    {/* potential member actions here */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No members yet</p>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Created</p>
                <p title={new Date(project.created_at ?? "").toLocaleString()}>{formatDate(project.created_at ?? project.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Last Updated</p>
                <p title={new Date(project.updated_at ?? "").toLocaleString()}>{formatDate(project.updated_at ?? project.updatedAt)}</p>
              </div>
            </div>
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  )
}
