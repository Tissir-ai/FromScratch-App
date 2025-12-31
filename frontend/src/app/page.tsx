'use client'

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";

// Lazy load heavy components to improve initial page load and dev compile speed
const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-muted/20" />
});
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const Pricing = dynamic(() => import('@/components/Pricing'));
const FAQ = dynamic(() => import('@/components/FAQ'), { ssr: false });
const CTA = dynamic(() => import('@/components/CTA'));
const Footer = dynamic(() => import('@/components/Footer'));

const DemoVideo = dynamic(() => import('@/components/DemoVideo'), { 
  loading: () => <div className="h-64 w-full animate-pulse bg-muted rounded-xl" /> 
});


export default function HomePage() {
  const { subscription } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <Hero />
 
        <section id="features">
          <Features />
        </section>
          <DemoVideo />
 {subscription === null || subscription?.status != 'active' ? ( 
          <Testimonials />
 ) : null}
        <section id="pricing" className="bg-feature-background">
            {subscription === null || subscription?.status != 'active' ? ( 
              <>
              <Pricing />
        <div className="max-w-7xl mx-auto pb-10 text-center ">
          <div className="bg-card rounded-2xl p-8 border border-feature-border shadow-medium">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Want to know more about our plans?
            </h3>
           <p className="text-muted-foreground mb-6">
               Explore plans and pricing in detail?
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-medium hover:shadow-glow transition-all duration-300 group"
              onClick={() => window.location.href = '/subscription'}
            >
              View Plan Details
            </Button>
          </div>
        </div>
              </>
               ) : null}
        </section>
        
          <FAQ />

         {subscription === null || subscription?.status !== 'active' ?  <CTA /> : null}
      </main>

        <Footer />
    </div>
  );
} 