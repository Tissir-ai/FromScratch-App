import { 
  Zap, 
  Lightbulb, 
  Layers, 
  Clock, 
  FileText, 
  Edit, 
  RefreshCw, 
  Code, 
  Users, 
  Globe, 
  Database, 
  Shield,
  GitBranch,
  ArrowRight
} from "lucide-react";

const allFeatures = [
  {
    icon: Lightbulb,
    title: "Idea-to-Requirements AI Engine",
    description: "Instantly transform any idea into structured project requirements.",
    details: "Paste your project idea and let the AI generate epics, features, user stories, acceptance criteria, constraints, non-functional requirements, and high-level architecture suggestions. All content is editable and updated in real time."
  },
  {
    icon: Zap,
    title: "Automatic Diagram Generation",
    description: "Generate system diagrams directly from your requirements.",
    details: "The platform automatically creates flowcharts, sequence diagrams, ER diagrams, and class diagrams based on your requirements. All diagrams are editable, exportable, and updated dynamically as the project evolves."
  },
  {
    icon: Layers,
    title: "AI Task Planner & Sprint Generator",
    description: "Break down user stories into actionable tasks using AI.",
    details: "The system automatically generates tasks, assigns priorities, groups them by sprint, and balances workloads. Supports task estimation, auto-assignment, and real-time synchronization with team members."
  },
  {
    icon: Users,
    title: "Real-Time Collaborative Workspace",
    description: "Team collaboration with live editing and role-based access.",
    details: "Multiple users can edit diagrams, documents, and tasks simultaneously. Includes permissions (admin, member, guest), activity tracking, and team-level access rules for each project area."
  },
  {
    icon: FileText,
    title: "Full Project Documentation",
    description: "Export complete documentation with one click.",
    details: "Generate a unified project PDF containing requirements, diagrams, architecture, tasks, cost estimates, technical recommendations, and more. Perfect for investors, managers, and developers."
  },
  {
    icon: Clock,
    title: "Estimation & Project Insights",
    description: "Accurate cost, timeline, and workload calculations.",
    details: "AI estimates development time, complexity, cost ranges, team workload distribution, and delivery phases. Includes a dashboard with charts and metrics for admins."
  },
  {
    icon: Code,
    title: "GitHub Scaffold & Code Generation",
    description: "Generate and push a full project scaffold automatically.",
    details: "With one click, create a complete code scaffold (frontend, backend, folder structure, configs) and push it to the admin’s GitHub repo. Includes environment setup, README, and optional CI/CD templates."
  },
  {
    icon: GitBranch,
    title: "AI Architecture & Tech Recommendations",
    description: "Receive personalized architecture and technology suggestions.",
    details: "The system recommends the best architecture style (microservices, monolith, serverless), technology stacks, hosting providers, database choices, and scalability strategies based on your project type."
  },
  {
    icon: Shield,
    title: "Role-Based Security & Audit Logs",
    description: "Protect your workspace with granular access control.",
    details: "Admins manage user roles, permissions, and audit logs for every action inside a project. Includes compliance rules, data retention, and secure collaboration."
  }
];

const FullFeatures = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="space-y-12">
          {allFeatures.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Feature Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="bg-feature-background rounded-xl p-6 border border-feature-border">
                  <p className="text-foreground leading-relaxed">
                    {feature.details}
                  </p>
                </div>
              
              </div>
              
              {/* Feature Visual */}
              <div className="flex-1">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-12 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-muted-foreground">
                      Interactive demo coming soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FullFeatures;