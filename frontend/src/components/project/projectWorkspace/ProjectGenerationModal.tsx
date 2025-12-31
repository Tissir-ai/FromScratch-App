"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GenerationStep {
  key: string
  label: string
  status: "pending" | "in-progress" | "completed" | "error"
}

interface ProjectGenerationModalProps {
  open: boolean
  idea: string
  steps: GenerationStep[]
  currentStep?: string
  progress?: number
  error?: string | null
  onCancel?: () => void
}

export function ProjectGenerationModal({
  open,
  idea,
  steps,
  currentStep,
  progress = 0,
  error,
  onCancel
}: ProjectGenerationModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => onCancel?.()}>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Generating Your Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {idea}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors",
                  step.status === "in-progress" && "bg-blue-50 dark:bg-blue-950/20",
                  step.status === "completed" && "bg-green-50 dark:bg-green-950/20",
                  step.status === "error" && "bg-red-50 dark:bg-red-950/20"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === "pending" && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {step.status === "in-progress" && (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  {step.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {step.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    step.status === "pending" && "text-muted-foreground",
                    step.status === "in-progress" && "text-blue-700 dark:text-blue-400",
                    step.status === "completed" && "text-green-700 dark:text-green-400",
                    step.status === "error" && "text-red-700 dark:text-red-400"
                  )}>
                    {step.label}
                  </p>
                  {step.status === "in-progress" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Processing...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-400">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Info Message */}
          {!error && (
            <div className="text-center text-sm text-muted-foreground">
              This may take a few minutes. Please don't close this window.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
