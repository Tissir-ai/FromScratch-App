"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Users, Calendar, Folder, MoreHorizontal, Edit2, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Project } from "@/types/project.type"
import { OwnerBadge } from "./OwnerBadge"
import { formatDate } from "@/lib/date-utils"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"

interface ProjectCardProps {
  project: Project
  isOwner: boolean
  onViewDetails: (project: Project) => void
  onOpen: (project: Project) => void
  onSettings: (project: Project) => void
  onDelete: (id: string) => Promise<void>
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

export function ProjectCard({ project, isOwner, onViewDetails, onOpen, onSettings, onDelete }: ProjectCardProps & { onOpen: (project: Project) => void; onDelete: (id: string) => Promise<void> }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")

  useEffect(() => {
    if (showDeleteConfirm) setDeleteConfirmName("")
  }, [showDeleteConfirm])

  const handleConfirmDelete = async () => {
    if (deleteConfirmName !== project.name) return
    setDeleting(true)
    try {
      await onDelete(project.id)
      setShowDeleteConfirm(false)
      setDeleteConfirmName("")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-lg hover:-translate-y-0.5 rounded-xl border bg-card overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary font-semibold">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight line-clamp-1">{project.name}</div>
            <div className="text-xs text-muted-foreground">{project.description && project.description}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <OwnerBadge isOwner={isOwner} />

          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="more"
                className="p-1 rounded-md hover:bg-muted/60"
                title="More actions"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button> 
            </PopoverTrigger>

            <PopoverContent className="w-40">
              <div className="flex flex-col">
                <button
                  className="text-sm text-left px-2 py-2 hover:bg-muted rounded-md"
                  onClick={() => {
                    onOpen(project)
                    setMenuOpen(false)
                  }}
                >
                  Open project
                </button>

               

                <button
                  className="text-sm text-left px-2 py-2 hover:bg-muted rounded-md"
                  onClick={() => {
                    onViewDetails(project)
                    setMenuOpen(false)
                  }}
                >
                  View details
                </button>
                <button
                  className="text-sm text-left px-2 py-2 hover:bg-muted rounded-md"
                  onClick={() => {
                    onSettings(project)
                    setMenuOpen(false)
                  }}
                >
                  Settings
                </button>
                <Separator className="my-1" />

                {isOwner ? (
                  <button
                    className="text-sm text-left px-2 py-2 hover:bg-muted rounded-md text-red-600"
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setMenuOpen(false)
                    }}
                  >
                    Delete project
                  </button>
                ) : (
                  <div className="text-sm px-2 py-2 text-muted-foreground">Only owner can delete</div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <CardContent className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-3 text-sm text-muted-foreground">
          {project.full_description ? (
            <p className="line-clamp-3">{project.full_description}</p>
          ): (
            <p className="italic text-xs">No description provided.</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {(project.members || []).slice(0, 3).map((m, idx) => (
                  <div
                    key={idx}
                    title={`${m.name}${m.role_name ? ` — ${m.role_name}` : ""}`}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-muted/40 border border-muted"
                  >
                    {initials(m.name)}
                  </div>
                ))}

                {project.members && project.members.length > 3 && (
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-muted/30 border border-muted text-muted-foreground">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Updated {formatDate(project.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">  
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete project</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">Are you sure you want to delete the project "{project.name}"? This action cannot be undone.</div>

              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Type <span className="font-mono text-primary">"{project.name}"</span> to confirm:</p>
                <Input value={deleteConfirmName} onChange={(e) => setDeleteConfirmName(e.target.value)} placeholder={project.name} />
              </div>

              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button size="sm" className=" text-white flex items-center gap-2" onClick={handleConfirmDelete} disabled={deleting || deleteConfirmName !== project.name}>{deleting ? (<><RefreshCw className="animate-spin h-4 w-4"/>Deleting...</>) : 'Delete'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          <Button
            onClick={() => onViewDetails(project)}
            variant="ghost"
            size="sm"
            className="w-full justify-between border rounded-md"
          >
            <span className="text-sm">View details</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
           <Button
            onClick={() => onOpen(project)}
            variant="default"
            size="sm"
            className="w-full justify-center gap-2"
          >
            <span className="text-sm">Open</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
