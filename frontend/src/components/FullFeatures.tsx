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
    icon: Zap,
    title: "Automatic Diagram Generation",
    description: "Generate system architecture, flowcharts, and UML diagrams instantly from your project description.",
    details: "Our AI analyzes your project requirements and automatically creates professional diagrams including system architecture, database schemas, user flow diagrams, and UML class diagrams. Export in multiple formats including SVG, PNG, and PDF."
  },
  {
    icon: Lightbulb,
    title: "Design Pattern Suggestion",
    description: "Get intelligent recommendations for the best design patterns to use in your project architecture.",
    details: "Receive expert-level recommendations for design patterns like MVC, Observer, Factory, Singleton, and more based on your specific project requirements. Each suggestion includes implementation examples and best practices."
  },
  {
    icon: Layers,
    title: "Tech Stack Recommendation",
    description: "Receive personalized technology stack suggestions based on your project requirements and goals.",
    details: "Get tailored recommendations for frontend frameworks, backend technologies, databases, hosting solutions, and development tools. Includes pros/cons analysis, learning resources, and migration paths."
  },
  {
    icon: Clock,
    title: "Timeline & Cost Estimation",
    description: "Accurate project timelines and cost estimates to help you plan resources and deadlines effectively.",
    details: "Generate detailed project timelines with milestone tracking, resource allocation, and accurate cost estimates based on team size, complexity, and industry standards. Includes buffer time calculations and risk assessments."
  },
  {
    icon: FileText,
    title: "Full Documentation Generation",
    description: "Complete project documentation including API specs, user guides, and technical documentation.",
    details: "Automatically generate comprehensive documentation including API documentation, user manuals, technical specifications, deployment guides, and maintenance procedures. All documents are professionally formatted and export-ready."
  },
  {
    icon: Edit,
    title: "User Editing",
    description: "Easily edit and customize all generated content to match your specific requirements and preferences.",
    details: "Full-featured editor with real-time preview, version control, collaborative editing, and custom templates. Make changes to any generated content with intelligent suggestions and auto-completion."
  },
  {
    icon: RefreshCw,
    title: "Real-time Diagram Updates",
    description: "See your diagrams update in real-time as you modify your project specifications and requirements.",
    details: "Dynamic diagram updates that reflect changes instantly as you modify project requirements. Includes change tracking, rollback functionality, and collaborative real-time editing with team members."
  },
  {
    icon: Code,
    title: "Code Skeleton Generation",
    description: "Get started quickly with auto-generated code skeletons and project structure templates.",
    details: "Generate production-ready code skeletons with proper folder structure, configuration files, testing setup, CI/CD pipelines, and best practices implementation. Supports 20+ programming languages and frameworks."
  },
  {
    icon: Users,
    title: "Collaboration & Sharing",
    description: "Share your project plans with team members and collaborate in real-time on project specifications.",
    details: "Advanced collaboration features including real-time editing, comment system, approval workflows, permission management, and team workspace organization. Integrates with Slack, Teams, and other communication tools."
  },
  {
    icon: Globe,
    title: "Multilingual Export",
    description: "Export your documentation and plans in multiple languages to support global development teams.",
    details: "Support for 25+ languages with professional translation services, cultural adaptation, and localized formatting. Maintain consistency across all language versions with automated sync and update notifications."
  },
  {
    icon: Database,
    title: "Database Schema Generation",
    description: "Automatically generate optimized database schemas with relationships and constraints.",
    details: "Create normalized database schemas with proper indexing, foreign key relationships, data validation rules, and performance optimization. Supports SQL and NoSQL databases with migration scripts included."
  },
  {
    icon: Shield,
    title: "Security Recommendations",
    description: "Get security best practices and recommendations tailored to your project's specific needs.",
    details: "Comprehensive security analysis including vulnerability assessments, encryption recommendations, authentication strategies, data protection guidelines, and compliance requirements (GDPR, HIPAA, SOC 2)."
  },
  {
    icon: GitBranch,
    title: "DevOps Pipeline Suggestion",
    description: "Receive customized CI/CD pipeline recommendations to streamline your deployment process.",
    details: "Complete DevOps setup with CI/CD pipeline configuration, automated testing strategies, deployment automation, monitoring setup, and infrastructure as code. Supports major platforms like AWS, Azure, GCP, and Docker."
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
                
                <div className="flex items-center text-primary font-medium">
                  <span>Learn more about this feature</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
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