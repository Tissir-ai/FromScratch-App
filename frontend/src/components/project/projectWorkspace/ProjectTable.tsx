"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Users, Calendar } from "lucide-react"
import { useState } from "react"
import type { Project } from "@/types/project.type"
import { OwnerBadge } from "./OwnerBadge"
import { formatDate } from "@/lib/date-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, MoreHorizontal, Edit2, RefreshCw } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"

interface ProjectTableProps {
  projects: Project[]
  currentUserId: string
  onViewDetails: (project: Project) => void
  onOpen: (project: Project) => void
  onDelete: (id: string) => Promise<void>
  onSettings?: (project: Project) => void
}

export function ProjectTable({ projects, currentUserId, onViewDetails, onOpen, onSettings,onDelete }: ProjectTableProps & { onDelete: (id: string) => Promise<void> }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")

  const projectToDelete = projects.find((p) => p.id === deletingId) || null

  useEffect(() => {
    // Clear input whenever a different project is selected to delete
    setDeleteConfirmName("")
  }, [deletingId])

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    setDeleting(true)
    try {
      await onDelete(deletingId)
      setDeletingId(null)
      setDeleteConfirmName("")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="w-1/4">Project Name</TableHead>
            <TableHead className="w-1/6">Owner</TableHead>
            <TableHead className="w-1/6">Members</TableHead>
            <TableHead className="w-1/6">Last Updated</TableHead>
            <TableHead className="w-1/6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const isOwner = project.owner.id === currentUserId
            return (
              <TableRow key={project.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <OwnerBadge isOwner={isOwner} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{project.owner.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{project.members?.length || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(project.updated_at)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button onClick={() => onOpen(project)} variant="default" size="sm">
                      Open
                    </Button>
                    <Button
                      onClick={() => onViewDetails(project)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-1 rounded-md hover:bg-muted/60">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-40">
                        <div className="flex flex-col">
                          <button
                            className="text-sm text-left px-2 py-2 hover:bg-muted rounded-md"
                            onClick={() => { (onSettings ?? onOpen)(project); }}
                          >
                            Settings
                          </button>

                          <Separator className="my-1" />

                          {isOwner ? (
                            <button
                              className="text-sm text-left px-2 py-2 hover:bg-muted rounded-md text-red-600"
                              onClick={() => setDeletingId(project.id)}
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog for table */}
      <Dialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
          </DialogHeader>
          <div className="flex items-start">
            <div className="text-sm text-muted-foreground">Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.</div>
          </div>

          <div className="mt-3">
             <p className="text-sm text-muted-foreground mb-2">Type <span className="font-mono text-primary">"{projectToDelete?.name}"</span> to confirm:</p>
            <Input value={deleteConfirmName} onChange={(e) => setDeleteConfirmName(e.target.value)} placeholder={projectToDelete?.name ?? ""} />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button size="sm" className=" text-white flex items-center gap-2" onClick={handleConfirmDelete} disabled={deleting || deleteConfirmName !== projectToDelete?.name}>{deleting ? (<><RefreshCw className="animate-spin h-4 w-4"/>Deleting...</>) : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  )
}
