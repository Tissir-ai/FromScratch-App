import Navigation from "@/components/Navigation";
import FullFeatures from "@/components/FullFeatures";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { Lightbulb, Brain, GitBranch, FileText, Check } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Page Header */}
        <section className="relative py-24 bg-gradient-hero overflow-hidden">
          {/* Background accents */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-20 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl opacity-40" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                Features that help you go from
                {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
                  idea to plan
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore the capabilities that make FromScratch.ai your partner in planning—requirements, diagrams, tech choices, and exports.
              </p>

              {/* Mini feature bullets */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Idea brief</div>
                <div className="flex items-center justify-center gap-2"><Brain className="h-4 w-4 text-primary" /> Requirements</div>
                <div className="flex items-center justify-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Diagrams</div>
                <div className="flex items-center justify-center gap-2"><FileText className="h-4 w-4 text-primary" /> PDF exports</div>
              </div>
            </div>
          </div>
        </section>
        
        <FullFeatures />
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
} 