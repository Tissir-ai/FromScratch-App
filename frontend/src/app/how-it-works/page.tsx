'use client'

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lightbulb, Brain, FileText, SlidersHorizontal, CheckCircle, Upload, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="relative pt-28 pb-14 sm:pt-32 sm:pb-16 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl opacity-40" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-feature-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              From idea to execution — step by step
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              How FromScratch.ai works
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              We turn your raw idea and documents into a complete, customizable plan with clear actions.
              Here’s the flow you’ll experience—transparent, fast, and controllable.
            </p>
          </div>
        </section>

        {/* Flow steps - improved vertical timeline */}
        <section className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative mx-auto">
              {/* vertical rail */}
              <div className="pointer-events-none absolute left-5 top-0 h-full w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

              <ol className="space-y-6">
                {/* Step 1 */}
                <li className="group relative rounded-2xl border border-feature-border bg-card/60 p-5 pl-14 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <div className="absolute left-1.5 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-2 ring-primary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Lightbulb className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">1. Input</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Describe your project. Optionally attach files (PDF, DOCX, images) for extra context.</p>
                  <ul className="mt-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <li className="flex items-center gap-2"><Upload className="h-3.5 w-3.5" /> Multi-file upload (max 4)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Drag & drop supported</li>
                  </ul>
                </li>

                {/* Step 2 */}
                <li className="group relative rounded-2xl border border-feature-border bg-card/60 p-5 pl-14 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <div className="absolute left-1.5 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-2 ring-primary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Brain className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">2. Traitements</h3>
                  <p className="mt-1 text-sm text-muted-foreground">We analyze your input and files to extract goals, constraints, and key steps. Then we draft a structured plan.</p>
                  <ul className="mt-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Requirements extraction</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Milestones & dependencies</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Risk notes & assumptions</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Optional tech choices</li>
                  </ul>
                </li>

                {/* Step 3 */}
                <li className="group relative rounded-2xl border border-feature-border bg-card/60 p-5 pl-14 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <div className="absolute left-1.5 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-2 ring-primary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">3. Output</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You get a clean, structured plan (overview, phases, tasks, timelines) ready to review or export.</p>
                  <ul className="mt-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Clear phases & tasks</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Timeline estimate</li>
                  </ul>
                </li>

                {/* Step 4 */}
                <li className="group relative rounded-2xl border border-feature-border bg-card/60 p-5 pl-14 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <div className="absolute left-1.5 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-2 ring-primary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <SlidersHorizontal className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">4. Customize</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Tune priorities, swap technologies, add constraints, or ask for alternatives. Regenerate sections instantly.</p>
                  <ul className="mt-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Editable tasks & phases</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> One-click alternatives</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Save & version plans</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Export / Share updates</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-feature-border bg-card/60 p-6 sm:p-8 backdrop-blur-sm">
              {/* background accents */}
              <div className="pointer-events-none absolute -right-8 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-40" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl opacity-40" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-feature-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Smart planning, instant draft
                  </div>
                  <h3 className="mt-3 text-xl sm:text-2xl font-semibold text-foreground">Ready to turn your idea into a plan?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">It takes less than a minute to get your first draft. Tweak anything and export when you’re happy.</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full border border-feature-border bg-background/70 px-2.5 py-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> No credit card
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-feature-border bg-background/70 px-2.5 py-1">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" /> 1-minute draft
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                      Start free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/#pricing">
                    <Button variant="ghost" className="text-primary border-primary/80 border-2 hover:bg-primary/80 hover:text-white">See pricing</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
