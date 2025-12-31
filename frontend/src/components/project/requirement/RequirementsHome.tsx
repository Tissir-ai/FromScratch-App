"use client";
import { useEffect } from 'react';
import { RequirementsFolderCard } from './RequirementsFolderCard';
import { FolderInfo } from '@/types/requirement.type';
import { useRequirementStore } from '@/services/requirement.service';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface RequirementsHomeProps {
  projectId: string;
}

const folders: FolderInfo[] = [
  { category: 'user-stories', name: 'User Stories'},
  { category: 'technical', name: 'Technical' },
  { category: 'acceptance', name: 'Acceptance Criteria' },
  { category: 'business', name: 'Business Goals' },
  { category: 'non-functional', name: 'Non-Functional' },
  { category: 'questions', name: 'Open Questions' },
];

export const RequirementsHome = ({ projectId }: RequirementsHomeProps) => {
  const { fetchRequirements, loading, error } = useRequirementStore();
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchRequirements(projectId).catch((err: any) => {
        toast({ title: 'Error loading requirements', description: err?.message || 'Failed to load requirements', variant: 'destructive' });
      });
    }
  }, [projectId, fetchRequirements, toast]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading requirements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            className="mt-4"
            onClick={async () => {
              try {
                await fetchRequirements(projectId);
              } catch (err: any) {
                toast({ title: 'Error loading requirements', description: err?.message || 'Failed to load requirements', variant: 'destructive' });
              }
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4">
      {folders.map(f => <RequirementsFolderCard key={f.category} folder={f} projectId={projectId} />)}
    </div>
  );
};
