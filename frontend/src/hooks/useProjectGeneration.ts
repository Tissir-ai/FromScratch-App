"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import {
  generateFromScratchProject,
  pollRunStatus,
  RunStatus
} from "@/services/project.service"

export interface GenerationStep {
  key: string
  label: string
  status: "pending" | "in-progress" | "completed" | "error"
}

const INITIAL_STEPS: GenerationStep[] = [
  { key: 'init', label: 'Initializing project', status: 'pending' },
  { key: 'requirements', label: 'Analyzing requirements', status: 'pending' },
  { key: 'diagrams', label: 'Generating diagrams', status: 'pending' },
  { key: 'plan', label: 'Creating implementation plan', status: 'pending' },
  { key: 'export', label: 'Finalizing blueprint', status: 'pending' },
]

export interface UseProjectGenerationReturn {
  isGenerating: boolean
  generationOpen: boolean
  generationIdea: string
  generationSteps: GenerationStep[]
  generationProgress: number
  generationError: string | null
  startGeneration: (idea: string) => Promise<void>
  cancelGeneration: () => void
  resetGeneration: () => void
}

export function useProjectGeneration(): UseProjectGenerationReturn {
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationOpen, setGenerationOpen] = useState(false)
  const [generationIdea, setGenerationIdea] = useState("")
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(INITIAL_STEPS)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const updateStep = useCallback((stepKey: string, status: GenerationStep['status']) => {
    setGenerationSteps(prev =>
      prev.map(step =>
        step.key === stepKey ? { ...step, status } : step
      )
    )
  }, [])

  const calculateProgress = useCallback((runStatus: RunStatus): number => {
    const hasRequirements = !!runStatus.content?.requirements
    const hasDiagrams = !!runStatus.content?.diagrams
    const hasPlan = !!runStatus.content?.plan
    const hasExport = !!runStatus.content?.export

    let progress = 10 // Base for init

    if (hasRequirements) progress += 25
    if (hasDiagrams) progress += 25
    if (hasPlan) progress += 25
    if (hasExport) progress += 15

    return Math.min(progress, 100)
  }, [])

  const updateStepsFromStatus = useCallback((runStatus: RunStatus) => {
    // Update completed steps
    if (runStatus.content?.requirements) {
      updateStep('requirements', 'completed')
    }
    if (runStatus.content?.diagrams) {
      updateStep('diagrams', 'completed')
    }
    if (runStatus.content?.plan) {
      updateStep('plan', 'completed')
    }
    if (runStatus.content?.export) {
      updateStep('export', 'completed')
    }

    // Set current step based on what's not yet completed
    if (runStatus.status === 'running') {
      if (!runStatus.content?.requirements) {
        updateStep('requirements', 'in-progress')
      } else if (!runStatus.content?.diagrams) {
        updateStep('diagrams', 'in-progress')
      } else if (!runStatus.content?.plan) {
        updateStep('plan', 'in-progress')
      } else if (!runStatus.content?.export) {
        updateStep('export', 'in-progress')
      }
    }
  }, [updateStep])

  const resetGeneration = useCallback(() => {
    setGenerationSteps(INITIAL_STEPS)
    setGenerationProgress(0)
    setGenerationError(null)
    setGenerationIdea("")
    setIsGenerating(false)
    setGenerationOpen(false)
  }, [])

  const cancelGeneration = useCallback(() => {
    if (!generationError && isGenerating) {
      toast({
        title: "Generation in progress",
        description: "Please wait for the generation to complete",
        variant: "default"
      })
    } else {
      resetGeneration()
    }
  }, [generationError, isGenerating, toast, resetGeneration])

  const startGeneration = useCallback(async (idea: string) => {
    // Check authentication
    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    // Validate idea length
    const trimmedIdea = idea.trim()
    if (trimmedIdea.length < 30) {
      toast({
        title: "Too short",
        description: "Please provide at least 30 characters.",
        variant: "destructive"
      })
      return
    }

    if (trimmedIdea.length > 1000) {
      toast({
        title: "Too long",
        description: "Please shorten your prompt to at most 1000 characters.",
        variant: "destructive"
      })
      return
    }

    // Reset and start generation
    setGenerationIdea(trimmedIdea)
    setGenerationSteps(INITIAL_STEPS)
    setGenerationProgress(0)
    setGenerationError(null)
    setIsGenerating(true)
    setGenerationOpen(true)

    try {
      // Start generation - init step
      updateStep('init', 'in-progress')
      const response = await generateFromScratchProject({ idea: trimmedIdea })
      updateStep('init', 'completed')
      setGenerationProgress(10)

      // Poll for status updates
      await pollRunStatus(
        response.run_id,
        user,
        (status) => {
          const progress = calculateProgress(status)
          setGenerationProgress(progress)
          updateStepsFromStatus(status)
        }
      )

      // Mark all steps complete
      setGenerationSteps(prev => prev.map(step => ({ ...step, status: 'completed' as const })))
      setGenerationProgress(100)

      // Success - redirect to project workspace
      setTimeout(() => {
        setGenerationOpen(false)
        setIsGenerating(false)
        toast({
          title: "Success",
          description: "Project generated successfully! Redirecting to workspace..."
        })
        router.push(`/projects/${response.project_id}/overview`)
      }, 1500)

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate project"
      setGenerationError(message)
      setIsGenerating(false)

      // Mark current step as error
      setGenerationSteps(prev => {
        const currentStep = prev.find(s => s.status === 'in-progress')
        if (currentStep) {
          return prev.map(step =>
            step.key === currentStep.key ? { ...step, status: 'error' as const } : step
          )
        }
        return prev
      })

      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    }
  }, [isAuthenticated, user, router, toast, updateStep, calculateProgress, updateStepsFromStatus])

  return {
    isGenerating,
    generationOpen,
    generationIdea,
    generationSteps,
    generationProgress,
    generationError,
    startGeneration,
    cancelGeneration,
    resetGeneration,
  }
}
