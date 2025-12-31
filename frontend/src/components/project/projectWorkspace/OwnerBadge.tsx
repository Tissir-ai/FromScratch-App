"use client"

import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"

interface OwnerBadgeProps {
  isOwner: boolean
}

export function OwnerBadge({ isOwner }: OwnerBadgeProps) {
  if (!isOwner) return null

  return (
    <Badge variant="default" className="gap-1 bg-amber-600 hover:bg-amber-700">
      <Crown className="h-3 w-3" />
      You
    </Badge>
  )
}
