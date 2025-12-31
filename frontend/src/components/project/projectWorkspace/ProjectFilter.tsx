"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search } from "lucide-react"
import type { Project } from "@/types/project.type"

interface ProjectFilterProps {
  projects: Project[]
  currentUserId: string
  onFilter: (filtered: Project[]) => void
  onReset: () => void
}

type FilterType = "all" | "owner" | "member"

export function ProjectFilter({
  projects,
  currentUserId,
  onFilter,
  onReset,
}: ProjectFilterProps) {
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"none" | "created:asc" | "created:desc" | "updated:asc" | "updated:desc">("none")

  // Normalize dates from either snake_case or camelCase fields
  const getDateValue = (p: Project, which: "created" | "updated") => {
    const snake = p[`${which}_at` as keyof Project] as unknown as string | undefined
    const camel = p[`${which}At` as keyof Project] as unknown as string | undefined
    const v = snake ?? camel ?? undefined
    return v ? new Date(v) : new Date(0)
  }

  const applyFilters = () => {
    let filtered = projects

    if (filterType === "owner") {
      filtered = projects.filter((p) => p.owner.id === currentUserId)
    } else if (filterType === "member") {
      filtered = projects.filter(
        (p) =>
          p.owner.id !== currentUserId &&
          p.members?.some((m) => {
            // If members had an id we could check it; here keep the simple behavior
            return true
          })
      )
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.owner.name.toLowerCase().includes(q)
      )
    }

    if (sort !== "none") {
      const [field, dir] = sort.split(":") as ["created" | "updated", "asc" | "desc"]
      filtered = [...filtered].sort((a, b) => {
        const da = getDateValue(a, field)
        const db = getDateValue(b, field)
        if (da < db) return dir === "asc" ? -1 : 1
        if (da > db) return dir === "asc" ? 1 : -1
        return 0
      })
    }

    onFilter(filtered)
  }

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type)
  }

  const handleSearch = (q: string) => {
    setQuery(q)
  }

  const handleSortChange = (s: string) => {
    setSort((s as any) ?? "none")
  }

  useEffect(() => {
    applyFilters()
  }, [projects, filterType, query, sort])

  useEffect(() => {
    // reset local state when reset is triggered from parent
    // caller should call onReset()
  }, [onReset])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name or owner..."
          className="pl-10"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Select onValueChange={(value) => handleFilterChange(value as FilterType)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          <SelectItem value="owner">My Projects</SelectItem>
          <SelectItem value="member">Member Of</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => handleSortChange(value)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No sorting</SelectItem>
          <SelectItem value="created:asc">Created (oldest)</SelectItem>
          <SelectItem value="created:desc">Created (newest)</SelectItem>
          <SelectItem value="updated:asc">Updated (oldest)</SelectItem>
          <SelectItem value="updated:desc">Updated (newest)</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => { setQuery(''); setFilterType('all'); setSort('none'); onReset() }}
        className="gap-2"
      >
        <X className="h-4 w-4" />
        Reset
      </Button>
    </div>
  )
}
