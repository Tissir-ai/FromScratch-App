import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import dynamic from 'next/dynamic';

// Lazy load heavy components to improve initial page load and dev compile speed
const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-muted/20" />
});
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const Pricing = dynamic(() => import('@/components/Pricing'));
const FAQ = dynamic(() => import('@/components/FAQ'));
const CTA = dynamic(() => import('@/components/CTA'));
const Footer = dynamic(() => import('@/components/Footer'));

const DemoVideo = dynamic(() => import('@/components/DemoVideo'), { 
  loading: () => <div className="h-64 w-full animate-pulse bg-muted rounded-xl" /> 
});


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <Hero />
 
        <section id="features">
          <Features />
        </section>
          <DemoVideo />

          <Testimonials />

        <section id="pricing">
            <Pricing />
        </section>
        
          <FAQ />

          <CTA />
      </main>

        <Footer />
    </div>
  );
} 