"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProjectCreateModal } from "@/components/project/projectWorkspace/ProjectCreateModal"
import { ProjectGenerationModal } from "@/components/project/projectWorkspace/ProjectGenerationModal"
import { useToast } from "@/hooks/use-toast"
import { useProjectGeneration } from "@/hooks/useProjectGeneration"
import type { Project } from "@/types/project.type"
import {
  fetchProjects,
  createProject,
  deleteProject,
} from "@/services/project.service"
import { RefreshCw } from "lucide-react"
import { ProjectNavigation } from "@/components/project/projectWorkspace/ProjectNavigation"
import { ViewToggle } from "@/components/project/projectWorkspace/ViewToggle"
import { ProjectFilter } from "@/components/project/projectWorkspace/ProjectFilter"
import { ProjectCard } from "@/components/project/projectWorkspace/ProjectCard"
import { ProjectTable } from "@/components/project/projectWorkspace/ProjectTable"
import { ProjectDetailsPanel } from "@/components/project/projectWorkspace/ProjectDetailsPanel"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext";

type ViewType = "grid" | "table"

export default function ProjectsPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<ViewType>("grid")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false)
  
  // Use the shared generation hook
  const {
    generationOpen,
    generationIdea,
    generationSteps,
    generationProgress,
    generationError,
    startGeneration,
    cancelGeneration,
  } = useProjectGeneration()
  
  const { user , plan } = useAuth();
  const router = useRouter()

   const checkFeatures = (): boolean => {
      if (plan?.config?.nbrProjects && projects.length >= plan.config.nbrProjects) {
        toast({
          title: "Project limit reached",
          description: `Your current plan allows a maximum of ${plan.config.nbrProjects} projects. Please upgrade your plan to create more projects.`,
          variant: "destructive",
        })
        return false
      }
      return true
    }

  const loadProjects = async () => {
    if (!user) {
      setLoading(false)
      router.push('/auth/signin')
      return
    }
    if (!user) {
      setLoading(false)
      router.push('/auth/signin')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects(user)
      setProjects(data || [])
      setFilteredProjects(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load projects"
      setError(message)
      toast({ title: "Could not load projects", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [user])


  
  const handleCreate = async (payload: { name: string; description?: string }) => {
    if(!checkFeatures()) return;
    if (!user) {
      router.push('/auth/signin')
      return
    }
    try {
      const created = await createProject({
        name: payload.name,
        description: payload.description,
      })
      // Normalize backend _id to frontend id without indexing Project with "_id"
      const normalized = { ...created, id: (created as any)['_id'] ?? created.id }
      console.log("Created project:", normalized)
      toast({ title: "Success", description: "Project created successfully" })
      handleOpenProject(normalized)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const handleGenerate = async (idea: string) => {
    if(!checkFeatures()) return;
    // Use the shared generation hook - it handles auth, validation, and redirect
    await startGeneration(idea)
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setDetailsPanelOpen(true)
  }

  const handleOpenProject = (project: Project) => {
    // Navigate to the project's workspace. Update route as needed.
    router.push(`/projects/${project.id}/overview`)
  }

  const handleOpenSettings = (project: Project) => {
    router.push(`/projects/${project.id}/settings`)
  }

  const handleDeleteProject = async (id: string) => {
    if (!user) return
    try {
      await deleteProject(id, user)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setFilteredProjects((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Project deleted", description: "The project has been removed." })
      // Close details panel if it was open for this project
      if (selectedProject?.id === id) {
        setSelectedProject(null)
        setDetailsPanelOpen(false)
      }
    } catch (err) {
      toast({ title: "Delete failed", description: (err as Error)?.message ?? "Failed to delete project", variant: "destructive" })
    }
  }

  const isOwner = selectedProject ? selectedProject.owner.id === user?.id : false

  const content = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48 w-full" />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Unable to load projects</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button onClick={loadProjects} size="sm" variant="secondary" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (filteredProjects.length === 0) {
      return (
        <Alert>
          <AlertTitle>No projects found</AlertTitle>
          <AlertDescription>
            {projects.length === 0
              ? "Start by creating your first project!"
              : "Try adjusting your filters."}
          </AlertDescription>
        </Alert>
      )
    }

    if (view === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={project.owner.id === user?.id}
              onViewDetails={handleViewDetails}
              onOpen={handleOpenProject}
              onSettings={handleOpenSettings}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )
    }

    return (
      <ProjectTable
        projects={filteredProjects}
        currentUserId={user?.id ?? ""}
        onViewDetails={handleViewDetails}
        onOpen={handleOpenProject}
        onDelete={handleDeleteProject}
        onSettings={handleOpenSettings}
      />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-14 space-y-6">
        <ProjectNavigation />

        {/* Top Bar with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <ProjectFilter
              projects={projects}
              currentUserId={user?.id ?? ""}
              onFilter={setFilteredProjects}
              onReset={() => setFilteredProjects(projects)}
            />
          </div>

          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={setView} />
            <Button size="sm" variant="outline" onClick={loadProjects} disabled={loading} className="gap-2" title="Reload projects">
              <RefreshCw className={`${loading ? 'animate-spin' : ''} h-5 w-5`} />
            </Button>
            <ProjectCreateModal onCreate={handleCreate} onGenerate={handleGenerate} />
          </div>
        </div>
    
        {/* Content */}
        {content()}
      </div>

      {/* Details Panel */}
      <ProjectDetailsPanel
        project={selectedProject}
        isOwner={isOwner}
        open={detailsPanelOpen}
        onOpenChange={setDetailsPanelOpen}
      />
      
      {/* Generation Modal */}
      <ProjectGenerationModal
        open={generationOpen}
        idea={generationIdea}
        steps={generationSteps}
        progress={generationProgress}
        error={generationError}
        onCancel={cancelGeneration}
      />
    </main>
  )
}
