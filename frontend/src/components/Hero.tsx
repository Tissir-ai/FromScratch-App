"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowBigRight, Check, Lightbulb, Brain, GitBranch, FileText, Upload, X, Paperclip } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ideas = [
  "Build an AI-powered food delivery app",
  "Create a project management dashboard",
  "Develop an e-commerce platform for clothes",
  "Launch a SaaS for automated code reviews",
];

const Hero = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [userText, setUserText] = useState("");
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; size: number; type: string; isText: boolean; content?: string }>>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [dotY, setDotY] = useState(0);
  const [railHeight, setRailHeight] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Project Idea",
      desc: "Describe what you want to build",
      Icon: Lightbulb,
      color: "from-amber-500 to-amber-600",
    },
    {
      id: 1,
      title: "AI Analysis",
      desc: "Extract requirements and scope",
      Icon: Brain,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      id: 2,
      title: "Project Requirements",
      desc: "UML, flows,Milestones, tasks and architecture",
      Icon: FileText,
      color: "from-sky-500 to-sky-600",
    },
    {
      id: 3,
      title: "Project Scaffold",
      desc: "Get a ready-to-code project structure",
      Icon: GitBranch,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  // Typing animation logic
  useEffect(() => {
    const currentIdea = ideas[ideaIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentIdea.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentIdea.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 80);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentIdea.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 50);
    } else if (!isDeleting && charIndex === currentIdea.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setIdeaIndex((ideaIndex + 1) % ideas.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, ideaIndex]);

  // Step sequence auto-advance with pause/visibility gating
  useEffect(() => {
    if (paused || isTabHidden) return;
    const t = setInterval(() => {
      setCurrentStep((s) => (s + 1) % steps.length);
    }, 2200);
    return () => clearInterval(t);
  }, [paused, isTabHidden, steps.length]);

  // Track tab visibility
  useEffect(() => {
    const onVis = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Measure rail and active step to position the animated dot and progress fill
  const recalcRailMetrics = useCallback(() => {
    if (!railRef.current || !stepRefs.current[currentStep]) return;
    const railRect = railRef.current.getBoundingClientRect();
    const activeRect = stepRefs.current[currentStep]!.getBoundingClientRect();
    const centerY = activeRect.top + activeRect.height / 2 - railRect.top;
    setDotY(centerY);
    setRailHeight(railRect.height);
  }, [currentStep]);

  useEffect(() => {
    recalcRailMetrics();
  }, [recalcRailMetrics, currentStep]);

  useEffect(() => {
    const onResize = () => recalcRailMetrics();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recalcRailMetrics]);

  const handleGenerate = useCallback(() => {
    const idea = userText.trim() || displayedText.trim();
    if (!idea) return;
    // TODO: Wire to actual generate handler
    // For now, just log. You can replace with navigation or mutation.
    // e.g., router.push(`/generate?idea=${encodeURIComponent(idea)}`)
    console.log("Generate from idea:", idea);
  }, [userText, displayedText]);

  // Shared file processing helper used by both input and drag-n-drop
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const remaining = Math.max(0, 4 - attachments.length);
    if (remaining <= 0) return;
    const selected = list.slice(0, remaining);
    const newItems = await Promise.all(
      selected.map(async (file) => {
        const name = file.name;
        const isText = file.type.startsWith("text/") || /\.(md|markdown|txt|json|csv)$/i.test(name);
        const base = { name, size: file.size, type: file.type || "", isText } as {
          name: string;
          size: number;
          type: string;
          isText: boolean;
          content?: string;
        };
        if (isText) {
          const content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || "");
            reader.readAsText(file);
          });
          return { ...base, content };
        }
        return base;
      })
    );
    setAttachments((prev) => {
      const merged = [...prev, ...newItems];
      return merged.slice(0, 4);
    });
  }, [attachments.length]);

  return (
    <section className="relative min-h-[92vh] flex items-center bg-gradient-hero overflow-hidden ">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left */}
          <div className="lg:col-span-7">
           
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-hero-foreground mb-4 sm:mb-6 leading-[1.1]">
              From Idea to Complete
              {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
                Project Plan
              </span>
              {" "}– Instantly
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Transform ideas into comprehensive plans with auto‑generated diagrams, smart stack recommendations,
              and full documentation — in seconds.
            </p>


            {/* Mini feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> UML diagrams</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Tech stack picks</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> PDF docs</div>
            </div>

          </div>

          {/* Right: vertical animated sequence */}
          <div className="lg:col-span-5">
            <div
              className="relative rounded-2xl border border-feature-border bg-card/60 backdrop-blur-sm p-4 sm:p-6"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              role="listbox"
              aria-label="Planning steps"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setCurrentStep((s) => (s + 1) % steps.length); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setCurrentStep((s) => (s - 1 + steps.length) % steps.length); }
              }}
            >
              {/* Vertical rail (base) aligned with icon centers */}
              <div ref={railRef} className="absolute left-[2.25rem] top-6 bottom-6 w-[2px] bg-feature-border" />
              {/* Progress on the rail using scaleY for smooth animation */}
              <div role="progressbar" aria-label="Planning progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={currentStep + 1} className="absolute left-[2.25rem] top-6 bottom-6 w-[2px]">
                <motion.div initial={false} animate={{ scaleY: railHeight ? Math.max(0, Math.min(dotY / railHeight, 1)) : 0 }} transition={{ type: "spring", stiffness: 100, damping: 18 }} style={{ transformOrigin: "top" }} className="absolute inset-0 w-[2px] bg-gradient-to-b from-primary to-primary-glow" />
              </div>

              {/* Animated dot indicating current step on the rail */}
              <motion.div className="absolute left-[2.25rem] top-6 -ml-[5px]" initial={false} animate={{ y: dotY - 6 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_16px_rgba(99,102,241,0.6)]" />
                  <div className="absolute inset-0 -m-1 rounded-full border border-primary/40 animate-pulse" />
                </div>
              </motion.div>

              <div className="space-y-5 relative pl-[2.5rem]">
                {steps.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    ref={(el) => { stepRefs.current[idx] = el; }}
                    role="option"
                    aria-selected={idx === currentStep}
                    tabIndex={0}
                    onClick={() => setCurrentStep(idx)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCurrentStep(idx); } }}
                    className={`relative flex pr-4 py-3 rounded-xl border cursor-pointer transition-colors ${idx === currentStep ? "border-primary/50 bg-background/70" : "border-feature-border bg-background/50 hover:bg-background/60"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, scale: idx === currentStep ? 1.01 : 1 }}
                    transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  >
                    {/* Node icon aligned to rail */}
                    <div className={`ml-2 w-10 h-10 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center shadow-md ${idx === currentStep ? "ring-2 ring-primary/40" : ""}`}>
                      <s.Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">{String(idx + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
                        <p className="text-sm font-semibold">{s.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    {idx === currentStep && (<motion.div layoutId="activeGlow" className="absolute inset-0 rounded-xl ring-1 ring-primary/30" />)}
                    {idx < currentStep && (<div className="absolute right-2 top-2 text-emerald-500"><Check className="h-4 w-4" /></div>)}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width input below the two columns */}
        <div className="max-w-6xl mx-auto mt-2">
          { /* Precompute counters (no state needed) */ }
          { /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ }
          { (() => null)() }
          <div
            className={`relative group rounded-2xl border shadow-sm transition-all duration-200 ${isDraggingOver ? "border-dashed border-primary/60 bg-primary/5" : "border-feature-border bg-card/60 backdrop-blur-sm"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={(e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) { setIsDraggingOver(false); } }}
            onDrop={async (e) => { e.preventDefault(); setIsDraggingOver(false); if (attachments.length >= 4) return; await processFiles(e.dataTransfer.files); }}
          >
            {/* Drag overlay */}
            {isDraggingOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/50 bg-background/70 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm font-medium text-primary">Drop files to attach</p>
                  <p className="text-xs text-muted-foreground">Up to 4 files • PDF, DOCX, TXT, MD, JSON, CSV</p>
                </div>
              </div>
            )}
            {/* Attached files preview */}
            <AnimatePresence initial={false}>
              {attachments.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex items-center gap-2 flex-wrap p-2">
                    {attachments.map((a, idx) => (
                      <motion.div layout key={`${a.name}-${idx}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 250, damping: 22 }} className="group flex items-center gap-2 rounded-md border border-feature-border bg-background/70 px-3 py-1">
                        <span className="text-primary"><Paperclip className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate max-w-[180px]" title={a.name}>{a.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(a.size / 1024).toFixed(1)} KB{a.isText ? " • text" : ""}</p>
                        </div>
                        <button type="button" aria-label={`Remove ${a.name}`} className="ml-1 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} title="Remove file">
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label htmlFor="project-idea" className="sr-only">Describe your project idea</label>
            <textarea
              id="project-idea"
              aria-describedby="idea-hint"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleGenerate(); } }}
              className="w-full px-5 sm:px-6 py-4 pb-14 sm:pb-16 rounded-2xl text-base dark:text-primary/80 sm:text-lg border border-transparent shadow-sm text-foreground focus:outline-none bg-transparent placeholder-muted-foreground dark:placeholder:text-primary/80 resize-none overflow-y-auto"
              placeholder={displayedText}
              rows={1}
              style={{ minHeight: "8rem", maxHeight: "16rem" }}
              onInput={(e) => { const target = e.target as HTMLTextAreaElement; target.style.height = "3.25rem"; target.style.height = `${target.scrollHeight}px`; }}
            />
            <span id="idea-hint" className="sr-only">Type your idea. Press Ctrl+Enter to generate.</span>

            {/* Bottom toolbar */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between pr-3 sm:pr-4 pl-2 sm:pl-3 pb-3 sm:pb-4 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                {/* Hidden file input */}
                <input ref={uploadInputRef} id="idea-upload" type="file" multiple accept=".txt,.md,.markdown,.json,.csv,.pdf,.doc,.docx" className="hidden" onChange={async (e) => { const input = e.currentTarget; await processFiles(e.target.files || []); input.value = ""; }} />
                <Button type="button" variant="outline" size="sm" aria-label="Upload document(s) to extract requirements" title={attachments.length >= 4 ? "Maximum 4 files" : "Upload document(s)"} disabled={attachments.length >= 4} onClick={() => uploadInputRef.current?.click()} className="flex items-center text-sm">
                  <Upload />
                  Attach{attachments.length ? ` (${attachments.length}/4)` : ""}
                </Button>
                {attachments.length > 0 && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline" onClick={() => setAttachments([])} aria-label="Clear all attachments">Clear all</button>
                )}
              </div>
              <div className="flex items-center gap-3 pointer-events-auto">
                <span className="text-[11px] text-muted-foreground select-none">
                  {userText.length}/{2000}
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={!userText.trim() && !displayedText.trim()}
                  className="inline-flex items-center gap-1"
                >
                  Generate
                  <ArrowBigRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Decorative gradient focus ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-feature-border group-focus-within:ring-primary/40" />
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-2 sm:mt-4 max-w-6xl mx-auto flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p className="text-xs sm:text-sm mb-2">Powered by</p>
            <div className="flex items-center gap-6 opacity-70">
              <div className="flex flex-col items-center">
                <img src="/logos/github.png" alt="GitHub" className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
                <span className="text-[10px] sm:text-xs font-semibold">Github</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="/logos/clickup.png" alt="ClickUp" className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
                <span className="text-[10px] sm:text-xs font-semibold">ClickUp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
