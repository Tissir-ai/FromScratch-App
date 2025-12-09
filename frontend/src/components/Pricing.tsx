import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building, GraduationCap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "Free",
    period: "forever",
    description: "Perfect for individual developers and small projects",
    features: [
      "5 project plans per month",
      "Basic diagram generation",
      "Standard documentation",
      "Community support",
      "Export to PDF/Markdown"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Student",
    icon: GraduationCap,
    price: "$9",
    period: "per month",
    description: "Perfect for students and academic projects",
    features: [
      "20 project plans per month",
      "Advanced diagram generation",
      "Academic templates",
      "Student community access",
      "Export to PDF/Markdown/Word",
      "GitHub integration",
      "Academic discount (50% off)"
    ],
    buttonText: "Get Student Discount",
    buttonVariant: "outline" as const,
    popular: false,
    badge: "Student"
  },
  {
    name: "Professional",
    icon: Crown,
    price: "$29",
    period: "per month",
    description: "Ideal for professional developers and growing teams",
    features: [
      "Unlimited project plans",
      "Advanced AI recommendations",
      "Real-time collaboration",
      "Priority support",
      "All export formats",
      "Custom templates",
      "API access"
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Enterprise",
    icon: Building,
    price: "Custom",
    period: "contact us",
    description: "Built for large teams and enterprise requirements",
    features: [
      "Everything in Professional",
      "SSO & Advanced security",
      "Dedicated account manager",
      "Custom integrations",
      "On-premise deployment",
      "24/7 phone support",
      "Training & onboarding"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false
  }
];

const Pricing = () => {
  return (
    <section className="py-24 bg-feature-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and scale as you grow.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-3xl border transition-all duration-300 hover-lift ${
                plan.popular 
                  ? 'border-primary shadow-glow scale-105' 
                  : 'border-feature-border hover:border-primary/20'
              }`}
            >
              {/* Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-400 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-primary">
                        {plan.price}
                      </span>
                      {plan.price !== "Custom" && plan.price !== "Free" && (
                        <span className="text-muted-foreground ml-1 text-lg">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.period === "forever" && (
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    )}
                    {plan.period === "contact us" && (
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-card-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA Button */}
                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  className={`w-full rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-medium hover:shadow-glow' 
                      : ''
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.{" "}
            <a href="#" className="text-primary hover:text-primary-hover underline">
              View detailed comparison
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;