"use client";

          import React, { useMemo, useState } from 'react';
          import Link from 'next/link';
          import { Requirement } from '@/types/requirement.type';
          import { FileText, UserCircle, Plus, Folder, Trash2, Loader2 } from 'lucide-react';
          import { Button } from '@/components/ui/button';
          import { Input } from '@/components/ui/input';
          import CreateRequirementModal from '@/components/project/requirement/CreateRequirementModal';
          import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
          import { useRequirementStore } from '@/services/requirement.service';
          import {
            AlertDialog,
            AlertDialogAction,
            AlertDialogCancel,
            AlertDialogContent,
            AlertDialogDescription,
            AlertDialogFooter,
            AlertDialogHeader,
            AlertDialogTitle,
          } from "@/components/ui/alert-dialog";
          import { useToast } from '@/components/ui/use-toast';

          interface CategoryItemsProps {
            items: Requirement[];
            projectId: string;
            category: string;
          }

          export const CategoryItems: React.FC<CategoryItemsProps> = ({ items, projectId, category }) => {
            const [open, setOpen] = useState(false);
            const [query, setQuery] = useState('');
            const { deleteRequirement, loading } = useRequirementStore();
            const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
            const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);
            const [deleting, setDeleting] = useState(false);

            const normalizedQuery = query.trim().toLowerCase();
            const filtered = useMemo(() => items.filter(r => {
              if (!normalizedQuery) return true;
              const haystack = [r.title, r.description, r.content ?? ''].join(' ').toLowerCase();
              return haystack.includes(normalizedQuery);
            }), [items, normalizedQuery]);

            const formatDate = (value?: Date | string) => {
              if (!value) return '—';
              const date = typeof value === 'string' ? new Date(value) : value;
              if (Number.isNaN(date?.getTime?.())) return '—';
              try { return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date as Date); } catch { return '—'; }
            };

            const handleDeleteClick = (e: React.MouseEvent, id: string) => {
              e.preventDefault();
              e.stopPropagation();
              setRequirementToDelete(id);
              setDeleteDialogOpen(true);
            };

            const { toast } = useToast();

            const handleConfirmDelete = async () => {
              if (!requirementToDelete) return;
              setDeleting(true);
              try {
                await deleteRequirement(projectId, requirementToDelete);
                setDeleteDialogOpen(false);
                setRequirementToDelete(null);
                toast({ title: 'Deleted', description: 'Requirement deleted successfully' });
              } catch (error: any) {
                const message = error?.message || 'Failed to delete requirement';
                toast({ title: 'Delete failed', description: message, variant: 'destructive' });
              } finally {
                setDeleting(false);
              }
            };

            return (
              <div className='px-6 py-6  mx-auto w-full'>
                <div className='pb-4'>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link href={`?`}>Requirement</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className='capitalize'>{category.replace('-', ' ')}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className='flex items-center justify-between mb-4'>
                  <div className='space-y-2 '>
                    <h2 className='text-2xl font-semibold capitalize flex items-center gap-3'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-sm'>
                        <Folder className='h-5 w-5' />
                      </span>
                      {category.replace('-', ' ')}
                    </h2>
                    <p className='text-sm text-muted-foreground'>{items.length} requirement{items.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Input placeholder='Search…' value={query} onChange={e => setQuery(e.target.value)} className='w-48' />
                    <Button onClick={() => setOpen(true)} className='bg-gradient-primary gap-2'><Plus className='h-4 w-4' /> New</Button>
                  </div>
                </div>

                {items.length === 0 && (
                  <div className='rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground flex flex-col items-center justify-center'>
                    <p className='mb-2'>No requirements yet.</p>
                    <Button size='sm' onClick={() => setOpen(true)} className='bg-gradient-primary'>Create First</Button>
                  </div>
                )}

                {items.length > 0 && filtered.length === 0 && (
                  <div className='rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground flex flex-col items-center justify-center'>
                    <p className='mb-2'>No matches found for "{query}".</p>
                    <Button size='sm' variant='outline' onClick={() => setOpen(true)}>New requirement</Button>
                  </div>
                )}

                {filtered.length > 0 && (
                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {filtered.map(r => (
                      <div key={r.id} className='relative group'>
                        <Link href={`/projects/${projectId}/requirements?category=${category}&id=${r.id}`} className='rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-primary/40 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40'>
                          <div className='flex items-start gap-3'>
                            <FileText className='h-8 w-8 text-primary/70' />
                            <div className='min-w-0 flex-1'>
                              <h3 className='text-sm font-medium truncate flex items-center gap-2'><span className='truncate'>{r.title}</span></h3>
                              <p className='text-xs text-muted-foreground line-clamp-2'>{r.description}</p>
                            </div>
                          </div>
                          <div className='flex items-center justify-between  text-[10px] text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity'>Open →</div>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive/20 text-destructive"
                          onClick={(e) => handleDeleteClick(e, r.id)}
                          aria-label="Delete requirement"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <CreateRequirementModal open={open} onOpenChange={setOpen} category={category} projectId={projectId} />
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Requirement?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the requirement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          };

          export default CategoryItems;
