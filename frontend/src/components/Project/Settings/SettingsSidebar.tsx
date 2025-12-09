"use client";
import { cn } from "@/lib/utils";

type Section = "project" | "teams" | "members";

interface SettingsSidebarProps {
  active: Section;
  onSelect: (s: Section) => void;
}

const items: { key: Section; label: string }[] = [
  { key: "project", label: "Options" },
  { key: "teams", label: "Teams" },
  { key: "members", label: "Manage access" },
];

export default function SettingsSidebar({ active, onSelect }: SettingsSidebarProps) {
  return (
    <nav className="text-sm">
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.key}>
            <button
              onClick={() => onSelect(it.key)}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-md",
                active === it.key
                  ? "bg-muted font-medium"
                  : "hover:bg-muted/60 text-muted-foreground"
              )}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
