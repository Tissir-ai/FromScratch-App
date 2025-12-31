"use client";
import React, { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRequirementStore } from "@/services/requirement.service";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

interface CreateRequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  projectId: string;
}

export const CreateRequirementModal: React.FC<CreateRequirementModalProps> = ({ open, onOpenChange, category, projectId }) => {
  const { createRequirement, loading } = useRequirementStore();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setError(null);
  };

  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;
    
    setError(null);

    try {
      const newReq = await createRequirement(projectId, {
        title: title.trim(),
        description: description.trim(),
        category: category as any,
        content: content.trim() || undefined,
      });
      
      toast({ title: 'Requirement created', description: 'Requirement was created successfully.' });
      onOpenChange(false);
      resetForm();
      router.push(`/projects/${projectId}/requirements?category=${category}&id=${newReq!.id}`);
    } catch (err: any) {
      const message = err?.message || 'Failed to create requirement';
      setError(message);
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>New Requirement</DialogTitle>
          <DialogDescription>Create a requirement for the <span className='font-medium'>{category.replace('-', ' ')}</span> folder.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div className='space-y-2'>
            <label className='text-xs font-medium'>Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder='Clear, concise title' required />
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium'>Description (optional)</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder='Detailed description or acceptance criteria' rows={4} />
          </div>
          <DialogFooter className='flex gap-2 justify-end'>
            <Button type='button' variant='outline' onClick={() => { onOpenChange(false); resetForm(); }} disabled={loading}>Cancel</Button>
            <Button type='submit' disabled={!title.trim() || loading} className='bg-gradient-primary'>
              {loading ? 'Creating...' : (
                <span className='inline-flex items-center gap-2'><Plus className='h-4 w-4'/>Create Requirement</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequirementModal;
