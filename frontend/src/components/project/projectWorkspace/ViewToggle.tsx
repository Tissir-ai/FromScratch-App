"use client"

import { Button } from "@/components/ui/button"
import { Grid3x3, List } from "lucide-react"

type ViewType = "grid" | "table"

interface ViewToggleProps {
  view: ViewType
  onChange: (view: ViewType) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      <Button
        size="sm"
        variant={view === "grid" ? "default" : "ghost"}
        onClick={() => onChange("grid")}
        className="gap-2"
      >
        <Grid3x3 className="h-4 w-4" />
        Grid
      </Button>
      <Button
        size="sm"
        variant={view === "table" ? "default" : "ghost"}
        onClick={() => onChange("table")}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        Table
      </Button>
    </div>
  )
}
