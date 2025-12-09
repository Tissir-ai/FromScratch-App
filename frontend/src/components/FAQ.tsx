import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is FromScratch.ai?",
    answer:
      "FromScratch.ai turns a short idea brief into a complete project plan: requirements, diagrams, stack suggestions, and exportable docs.",
  },
  {
    question: "What kinds of outputs do I get?",
    answer:
      "You’ll receive requirements, UML/architecture visuals, a recommended tech stack, and a milestone-driven roadmap—ready to share as PDFs.",
  },
  {
    question: "Can I upload my own documents?",
    answer:
      "Yes. Attach up to 4 supporting files (like TXT, MD, PDF) to give the AI more context and improve the plan.",
  },
  {
    question: "How accurate are the recommendations?",
    answer:
      "Recommendations include rationale and trade-offs. You can iterate by refining your brief or adjusting constraints.",
  },
  {
    question: "Do I need to sign in?",
    answer:
      "You can explore the demo, but signing in lets you save, revisit, and export your plans.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-20 bg-gradient-to-b from-background to-feature-background overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">Questions</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about how FromScratch.ai works and what to expect.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-feature-border bg-card/60 backdrop-blur-sm">
              <Accordion type="single" collapsible>
                <AccordionItem value={`faq-${idx}`}>
                  <AccordionTrigger className="px-4 sm:px-5 py-4 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-5 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
