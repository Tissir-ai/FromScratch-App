'use client'

import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    role: "Senior Software Engineer",
    company: "TechFlow Inc.",
  image: "/testimonial/testimonial-1.jpg",
    rating: 5,
    review: "DevPlan Pro transformed how we approach new projects. What used to take us weeks of planning now happens in minutes. The AI-generated diagrams are incredibly accurate and the documentation is production-ready."
  },
  {
    id: 2,
    name: "Sarah Martinez",
    role: "Product Manager",
    company: "StartupHub",
  image: "/testimonial/testimonial-2.jpg",
    rating: 5,
    review: "As a PM, I love how DevPlan Pro bridges the gap between ideas and implementation. The timeline estimates are spot-on and the tech stack recommendations have saved us from costly mistakes."
  },
  {
    id: 3,
    name: "David Kim",
    role: "Startup Founder",
    company: "InnovateLab",
  image: "/testimonial/testimonial-3.jpg",
    rating: 5,
    review: "This tool is a game-changer for startups. We've reduced our time-to-market by 40% and the automatically generated documentation impressed our investors. Best investment we've made."
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    role: "Senior Developer",
    company: "CodeCraft Solutions",
  image: "/testimonial/testimonial-4.jpg",
    rating: 5,
    review: "The code skeleton generation feature is phenomenal. It sets up the perfect project structure with best practices built-in. My team adopted DevPlan Pro within a week of trying it."
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-24 bg-gradient-feature relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full animate-float" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary rounded-full animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-primary rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Developers
            </span>{" "}
            Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what industry professionals are saying about DevPlan Pro and how it's transforming their development workflow.
          </p>
        </div>

        {/* Main Testimonial Carousel */}
        <div 
          className="relative max-w-4xl mx-auto mb-12"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-large border border-feature-border relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-8 left-8 opacity-10">
              <Quote className="h-16 w-16 text-primary" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-primary fill-current" />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="text-xl md:text-2xl text-card-foreground text-center leading-relaxed mb-8 font-medium">
                "{testimonials[currentIndex].review}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="relative">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-card-foreground text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </div>
                  <div className="text-primary font-medium">
                    {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-card border border-feature-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 shadow-soft"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-card border border-feature-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 shadow-soft"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center space-x-3 mb-16">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-muted hover:bg-primary/50'
              }`}
            />
          ))}
        </div>

        {/* All Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`bg-card rounded-2xl p-6 border border-feature-border hover-lift transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'ring-2 ring-primary/50 border-primary/30' 
                  : 'hover:border-primary/20'
              }`}
              onClick={() => goToSlide(index)}
            >
              {/* Stars */}
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-primary fill-current" />
                ))}
              </div>

              {/* Review */}
              <p className="text-card-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                "{testimonial.review}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-card-foreground text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Microsoft</div>
            <div className="text-2xl font-bold">Amazon</div>
            <div className="text-2xl font-bold">Netflix</div>
            <div className="text-2xl font-bold">Stripe</div>
            <div className="text-2xl font-bold">Airbnb</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;