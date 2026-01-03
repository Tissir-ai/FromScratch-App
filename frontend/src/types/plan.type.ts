export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // normalized from Prisma Decimal to number
  oldPrice : number | null; // normalized from Prisma Decimal to number
  billingPeriod: string;
  description?: string[] | null; // array of feature strings
  isActive: boolean;
  isPopular: boolean;
  config?: {
    nbrProjects: number; 
    allowPages: string[] | boolean;
    pdfExport: boolean;
    githubExport: boolean;
    chatTokens: number;
  } | null;
}
