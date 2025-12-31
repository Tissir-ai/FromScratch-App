"use client";
import { useRequirementStore } from '@/services/requirement.service';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/date-utils';
import { Requirement } from '@/types/requirement.type';

function MarkdownViewer({ content }: { content?: string | null }) {
  if (!content) return <em className="text-muted-foreground">No additional notes.</em>;
  return (
    <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Headings
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-3 mb-1" {...props} />,
    h4: ({node, ...props}) => <h4 className="text-base font-medium mt-2 mb-1" {...props} />,
    h5: ({node, ...props}) => <h5 className="text-sm font-medium mt-2 mb-1" {...props} />,
    h6: ({node, ...props}) => <h6 className="text-sm font-medium mt-2 mb-1" {...props} />,
    
    // Paragraph
    p: ({node, ...props}) => <p className="mb-2 text-base leading-7" {...props} />,
    
    // Links
    a: ({node, ...props}) => <a className="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noreferrer noopener" {...props} />,
    
    // Lists
    ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-3 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="mb-1" {...props} />,
    
    // Blockquote
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3 bg-muted/30 py-2 rounded-r" {...props} />,
    
    // Tables
    table: ({node, ...props}) => (
      <div className="overflow-auto my-3 border rounded-lg">
        <table className="min-w-full table-auto border-collapse" {...props} />
      </div>
    ),
    thead: ({node, ...props}) => <thead className="bg-muted/20 border-b" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y" {...props} />,
    tr: ({node, ...props}) => <tr className="hover:bg-muted/10 transition-colors" {...props} />,
    th: ({node, ...props}) => <th className="px-4 py-2 text-left text-sm font-semibold border-r last:border-r-0" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-2 text-sm border-r last:border-r-0" {...props} />,
    
        code: ({inline, children, className, ...props}: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return inline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <div className="my-3 rounded-lg overflow-hidden border">
              {language && (
                <div className="bg-muted/50 px-3 py-1 text-xs font-mono text-muted-foreground border-b">
                  {language}
                </div>
              )}
              <pre className="bg-muted p-4 overflow-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },
    
    // Horizontal Rule
    hr: ({node, ...props}) => <hr className="my-4 border-t border-border" {...props} />,
    
    // Emphasis
    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
    em: ({node, ...props}) => <em className="italic" {...props} />,
    del: ({node, ...props}) => <del className="line-through text-muted-foreground" {...props} />,
    
    // Images
    img: ({node, ...props}) => (
      <img 
        className="max-w-full h-auto rounded-lg my-3 border" 
        loading="lazy"
        {...props} 
      />
    ),
    
    // Task lists (requires remarkGfm)
    input: ({node, ...props}) => (
      <input 
        className="mr-2 align-middle" 
        disabled 
        type="checkbox"
        {...props} 
      />
    ),
  }}
>
  {content}
</ReactMarkdown>  
  );
}


interface RequirementEditorTabProps {
  id: string;
}

export const RequirementEditorTab = ({ id }: RequirementEditorTabProps) => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { requirements, updateRequirement, loading } = useRequirementStore();
  const req = requirements.find(r => r.id === id);
  // removed global autosave states; use per-field local copies instead
  const [saving, setSaving] = useState(false);
  // per-field editing state: 'title' | 'description' | 'content' | null
  const [editingField, setEditingField] = useState<"title" | "description" | "content" | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  // local working copies for each field while editing
  const [localTitle, setLocalTitle] = useState(req?.title || '');
  const [localDescription, setLocalDescription] = useState(req?.description || '');
  const [localContent, setLocalContent] = useState(req?.content || '');
  const createdAt = req?.created_at || undefined;
  const updatedAt = req?.updated_at || undefined;

  // Handlers for top action bar
  const { toast } = useToast();

  const handleCancel = (field?: "title" | "description" | "content") => {
    if (!req) return;
    const f = field ?? editingField;
    if (!f) return;
    if (f === 'title') setLocalTitle(req.title || '');
    if (f === 'description') setLocalDescription(req.description || '');
    if (f === 'content') setLocalContent(req.content || '');
    setEditingField(null);
  };

  const handleSave = async (field?: "title" | "description" | "content") => {
    if (!req || !projectId) return;
    const f = field ?? editingField;
    if (!f) return;
    setSaving(true);
    const patch: any = {};
    if (f === 'title') req.title = localTitle;
    if (f === 'description') req.description = localDescription;
    if (f === 'content') req.content = localContent;

    console.log("Saving requirement with patch:", req);
    try {
      await updateRequirement(projectId, req.id, req);
      toast({ title: 'Saved', description: 'Requirement updated successfully' });
      setEditingField(null);
    } catch (error: any) {
      const message = error?.message || 'Failed to save changes';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  // keep local copies in sync when requirement changes externally
  useEffect(() => {
    if (!req) return;
    setLocalTitle(req.title || '');
    setLocalDescription(req.description || '');
    setLocalContent(req.content || '');
  }, [req]);

  if (!req) return <div className="p-6 text-sm text-muted-foreground">Not found.</div>;

  const related = requirements.filter(r => r.category === req.category && r.id !== req.id);
  const visibleRelated = related.slice(0, 5);
  const hasMoreRelated = related.length > 5;

  return (
      <div className="w-full px-2 py-4 flex justify-around">
        
        <div className="w-full max-w-3xl">
          <article className="prose prose-invert max-w-full w-full">
            <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-sm">
            <FileText className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="group relative">
              {editingField === 'title' ? (
                <div className="flex flex-col gap-2">
                  <Input id="req-title" ref={titleRef} value={localTitle} onChange={e => setLocalTitle(e.target.value)} placeholder="Requirement title" className="text-2xl font-semibold" />
                 < div className ="flex justify-between text-xs items-center text-muted-foreground ">
                  <div className="flex flex-wrap gap-2 text-xs items-center text-muted-foreground">
                    <span className="ml-auto">Created  {formatDate(createdAt) || 'just now'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs items-center text-muted-foreground">
                    <span className="ml-auto">Updated {formatDate(updatedAt) || 'just now'}</span>
                    {saving && <span className="text-primary text-xs">Saving…</span>}
                  </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-semibold m-0">{localTitle || req.title}</h1>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span>Updated {formatDate(updatedAt)}</span>
                  </div>
                </div>
              )}

              {/* edit button shown on hover */}
              {editingField !== 'title' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingField('title');
                    setTimeout(() => titleRef.current?.focus(), 50);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute right-[-40px] top-0 text-sm px-2 py-1 rounded bg-muted/10 hover:bg-muted/20"
                  aria-label="Edit title"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="mb-6 group relative">
          {editingField === 'description' ? (
            <Textarea id="req-desc" value={localDescription} onChange={e => setLocalDescription(e.target.value)} placeholder="Describe the requirement, context, and acceptance details" className="min-h-[90px]" />
          ) : (
            <div className="text-sm text-muted-foreground">{localDescription || req.description || <em className="text-muted-foreground">No description provided.</em>}</div>
          )}
          {editingField !== 'description' && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingField('description'); }}
              className="opacity-0 group-hover:opacity-100 absolute right-[-40px] top-0 text-sm px-2 rounded bg-muted/10 hover:bg-muted/20"
            >
              Edit
            </button>
          )}
        </section>

        <section className="mb-6 group relative">
          {editingField === 'content' ? (
            <Textarea id="req-notes" value={localContent} onChange={e => setLocalContent(e.target.value)} placeholder="Capture details, acceptance criteria, or links" className="min-h-[520px]" />
          ) : (
            <div className="leading-relaxed text-base font-sans text-foreground">
              <MarkdownViewer content={localContent} />
            </div>
          )}
          {editingField !== 'content' && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingField('content'); }}
              className="opacity-0 group-hover:opacity-100 absolute right-[-40px] top-0 text-sm px-2 py-1 rounded bg-muted/10 hover:bg-muted/20"
            >
              Edit
            </button>
          )}
        </section>

        
          </article>
        </div>

        <aside className="lg:col-span-1 lg:pl-6 hidden lg:block w-full max-w-sm">
          <div className="sticky top-6">
            <h4 className="text-sm font-semibold mb-3">Related ({related.length})</h4>
            {related.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No related items.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleRelated.map(r => (
                  <Link
                    key={r.id}
                    href={`?category=${req.category}&id=${r.id}`}
                    className="group rounded-md border border-border p-3 flex items-start gap-3 hover:border-primary-glow transition-smooth"
                  >
                    <FileText className="h-5 w-5 text-primary/80 mt-1" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground">{r.updated_at ? formatDate(r.updated_at): '—'}</div>
                    </div>
                  </Link>
                ))}
                {hasMoreRelated && (
                  <Link href={`?category=${req.category}`} className="mt-2 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm bg-card/80 border border-border hover:shadow-sm">See more ({related.length - visibleRelated.length})</Link>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Bottom-right floating action group for Save/Cancel when editing */}
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          {editingField && (
            <div className="pointer-events-auto flex items-center gap-3 bg-card/90 backdrop-blur-md border border-border rounded-md px-3 py-2 shadow-lg">
              <div className=" text-xs text-muted-foreground px-2">Editing {editingField}</div>
              <div className="flex items-center gap-2">
                <Button className='text-xs' variant="outline" onClick={() => handleCancel()} aria-label="Cancel changes">Cancel</Button>
                <Button className="text-xs bg-gradient-primary" onClick={() => handleSave()} aria-label="Save changes">{saving ? 'Saving…' : 'Save'}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};
