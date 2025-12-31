"use client";
import { FolderInfo } from '@/types/requirement.type';
import { useRequirementStore } from '@/services/requirement.service';
import { useMemo } from 'react';
import Link from 'next/link';
import { Folder, FileText } from 'lucide-react';

interface RequirementsFolderCardProps {
  folder: FolderInfo;
  projectId: string;
}

export const RequirementsFolderCard = ({ folder, projectId }: RequirementsFolderCardProps) => {
  const { requirements } = useRequirementStore();
  const items = useMemo(() => requirements.filter(r => r.category === folder.category), [requirements, folder.category]);
  const count = items.length;
  const sample = items.slice(0, 3);

  return (
    <Link
      href={`/projects/${projectId}/requirements?category=${folder.category}`}
      aria-label={`${folder.name} folder (${count} item${count === 1 ? '' : 's'})`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/90 backdrop-blur-sm p-4 flex flex-col gap-3 shadow-sm hover:shadow-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="relative flex items-center gap-3">
        <div className="relative">
          <div className="rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors p-3">
            <Folder className="h-8 w-8 text-primary" />
          </div>
          <span className="absolute -top-2 -right-2 text-[10px] font-medium rounded-full bg-primary text-primary-foreground px-2 py-1 shadow-md">
            {count}
          </span>
        </div>
        <h3 className="font-semibold text-base text-foreground truncate">{folder.name}</h3>
      </div>
      <div className="min-h-[42px]">
        {count === 0 && <p className="text-xs italic text-muted-foreground">Empty folder</p>}
        {count > 0 && (
          <ul className="flex flex-col gap-1">
            {sample.map(s => (
              <li key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground/90 truncate" title={s.title}>
                <FileText className="h-3.5 w-3.5 text-primary/70" />
                <span className="truncate">{s.title}</span>
              </li>
            ))}
            {count > sample.length && (
              <li className="text-[10px] text-primary/70">+ {count - sample.length} more</li>
            )}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Folder</span>
        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/30" />
      <div className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />
    </Link>
  );
};
