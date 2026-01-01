"use client"
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
      <DialogContent
        className="max-w-none w-screen h-screen sm:rounded-none sm:border-0 p-0 bg-transparent"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-background/95 p-8 shadow-2xl backdrop-blur-md">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Loader2
                  className={cn(
                    "h-6 w-6",
                    error ? "text-red-500" : "text-sky-500 animate-spin"
                  )}
                />
                <DialogTitle className="text-2xl font-semibold text-foreground">
                  Generating Your Project
                </DialogTitle>
              </div>
              <DialogDescription className="text-base text-muted-foreground">
                {idea}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.key}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                      step.status === "in-progress" && "border-sky-500/50 bg-sky-50/60 dark:bg-slate-900",
                      step.status === "completed" && "border-emerald-500/40 bg-emerald-50/60 dark:bg-slate-900",
                      step.status === "error" && "border-red-500/50 bg-red-50/60 dark:bg-slate-900",
                      step.status === "pending" && "border-border bg-muted/40"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "pending" && (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      {step.status === "in-progress" && (
                        <Loader2 className="h-5 w-5 text-sky-600 animate-spin" />
                      )}
                      {step.status === "completed" && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                      {step.status === "error" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          step.status === "pending" && "text-muted-foreground",
                          step.status === "in-progress" && "text-sky-700 dark:text-sky-300",
                          step.status === "completed" && "text-emerald-700 dark:text-emerald-300",
                          step.status === "error" && "text-red-700 dark:text-red-300"
                        )}
                      >
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

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  <p className="text-sm">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}

              {!error && (
                <div className="text-center text-sm text-muted-foreground">
                  This may take a few minutes. Please keep this window open while we prepare your blueprint.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
