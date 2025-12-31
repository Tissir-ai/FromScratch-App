'use client'

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lightbulb, Brain, FileText, SlidersHorizontal, CheckCircle, Upload, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
const steps = [
  {
    id: 1,
    title: "Input Your Idea",
    description: "Paste your project idea or concept into the text area. Optionally add notes or context so the AI understands your vision clearly.",
    icon: Lightbulb,
    features: [
      { icon: CheckCircle, text: "Simple idea input field" },
      { icon: CheckCircle, text: "Optional extra notes" },
      { icon: CheckCircle, text: "Supports multiple project types" },
      { icon: CheckCircle, text: "Instant processing with one click" },
    ]
  },
  {
    id: 2,
    title: "AI Generation",
    description: "Our AI engine transforms your idea into a complete project blueprint including requirements, diagrams, tasks, and technical recommendations.",
    icon: Brain,
    features: [
      { icon: CheckCircle, text: "Requirements & user stories generation" },
      { icon: CheckCircle, text: "Automatic diagrams (Flow, ERD, Sequence...)" },
      { icon: CheckCircle, text: "AI-generated tasks & sprints" },
      { icon: CheckCircle, text: "Cost, timeline & architecture suggestions" },
    ]
  },
  {
    id: 3,
    title: "Workspace Output",
    description: "Your project opens in a real-time collaborative workspace where all generated documents, diagrams, and tasks are organized and editable.",
    icon: FileText,
    features: [
      { icon: CheckCircle, text: "Structured project workspace" },
      { icon: CheckCircle, text: "Editable user stories & diagrams" },
      { icon: CheckCircle, text: "Task board with priorities" },
      { icon: CheckCircle, text: "Role-based access for team members" },
    ]
  },
  {
    id: 4,
    title: "Customize & Collaborate",
    description: "Refine the AI output, edit details with your team, regenerate sections on demand, and export or push your project scaffold to GitHub.",
    icon: SlidersHorizontal,
    features: [
      { icon: CheckCircle, text: "Real-time collaborative editing" },
      { icon: CheckCircle, text: "AI regeneration for any section" },
      { icon: CheckCircle, text: "Full PDF export of the project" },
      { icon: CheckCircle, text: "GitHub scaffold push for admins" },
    ]
  }
];
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="relative pt-28 pb-8 sm:pt-32 sm:pb-4 overflow-hidden">
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
        <section className="relative py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="relative">
              {/* Vertical connecting line - visible on sm and up */}
              <div className="absolute left-[2rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden sm:block" />

              <div className="space-y-12 sm:space-y-20">
                {steps.map((step) => (
                  <div key={step.id} className="relative flex flex-col sm:flex-row gap-6 sm:gap-10 group">
                    <div className="flex-none z-10 sm:w-16 flex flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.15)] group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/50">
                        <step.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 relative rounded-2xl border border-border bg-card/50 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:border-primary/20">
                      {/* Arrow pointing to icon */}
                      <div className="absolute -left-2 top-8 h-4 w-4 rotate-45 border-b border-l border-border bg-card/50 hidden sm:block group-hover:border-primary/20 group-hover:bg-card/80 transition-colors" />
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{step.id}</span>
                        <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {step.description}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {step.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border/50">
                            <feature.icon className="h-4 w-4 text-primary/70" />
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
