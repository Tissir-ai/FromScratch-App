import { useEffect, useState } from "react";
import { Sparkles, Zap, Brain, Bot, ArrowRight } from "lucide-react";
const incomingSlides = [
  {
    icon: Sparkles,
    title: "Welcome to FromScratch.ai!",
    desc: "Transform ideas into comprehensive project plans with AI-powered automation.",
    img : '/hero-image.jpg'
  },
  {
    icon: Zap,
    title: "Instant Plans",
    desc: "Generate project timelines and tasks instantly.",
        img : '/hero-image.jpg'

  },
  {
    icon: Brain,
    title: "Smart Diagrams",
    desc: "Visualize your architecture with AI-generated diagrams.",
        img : '/hero-image.jpg'

  },
  {
    icon: Bot,
    title: "Full Docs",
    desc: "Get production-ready documentation for every project.",
        img : '/hero-image.jpg'

  },
  {
    icon: ArrowRight,
    title: "More features incoming...",
    desc: "Stay tuned for upcoming integrations and tools!",
        img : '/hero-image.jpg'

  }
];

function NewsSlideshow() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % incomingSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = incomingSlides[current];
  const Icon = slide.icon;
  return (
    <div className="relative z-10 text-center text-white p-12 w-full  transition-all duration-700">
      <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
        <Icon className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-bold mb-2 animate-fade-in">{slide.title}</h2>
      <p className="text-xl opacity-90 mb-6 animate-fade-in delay-200">{slide.desc}</p>
      <div className="flex justify-center items-center" >
        <img src={`${slide.img}`} alt={slide.title} className="w-96 h-auto rounded-lg mb-6" />
      </div>
      <div className="flex items-center justify-center space-x-3 mt-4">
        {incomingSlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none ${idx === current ? 'bg-white' : 'bg-white/30'}`}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </div>
    )
}
export default NewsSlideshow;
