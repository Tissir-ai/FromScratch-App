'use client'

import { 
  Zap, 
  Lightbulb, 
  Layers, 
  Clock, 
  FileText, 
  Code,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Core features to show on main page
const coreFeatures = [
  {
    icon: Lightbulb,
    title: "Idea-to-Requirements AI Engine",
    description: "Transform any raw idea into structured requirements, epics, user stories, acceptance criteria, and technical outlines instantly."
  },
  {
    icon: Zap,
    title: "AI Diagram Generator",
    description: "Automatically generate flowcharts, ER diagrams, class diagrams, and sequence diagrams from project requirements."
  },
  {
    icon: Layers,
    title: "Task Planner & Sprint Generator",
    description: "Break down epics into actionable tasks, assign them intelligently, and create balanced sprints using AI."
  },
  {
    icon: FileText,
    title: "Real-Time Collaborative Workspace",
    description: "Work together with your team in real time on documents, diagrams, and tasks, with role-based access control."
  },
  {
    icon: Clock,
    title: "Project Insights & Cost Estimation",
    description: "Get automatic time estimates, workload summaries, technical recommendations, and cost breakdowns for your project."
  },
  {
    icon: Code,
    title: "PDF Export & GitHub Scaffolding",
    description: "Download complete project documentation as a PDF or generate and push a full project scaffold directly to GitHub."
  }
];


const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-feature-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Ship Faster
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform provides all the tools and insights you need to transform ideas into production-ready projects.
          </p>
        </div>
        
        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 border border-feature-border hover-lift hover:border-primary/20 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Show More Button */}
        <div className="text-center">
          <div className="bg-card rounded-2xl p-8 border border-feature-border shadow-medium">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              And 7 More Powerful Features
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore the full suite of tools designed to streamline your development process and boost productivity.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-medium hover:shadow-glow transition-all duration-300 group"
              onClick={() => window.location.href = '/features'}
            >
              View All Features
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;