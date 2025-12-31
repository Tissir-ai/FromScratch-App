const DemoVideo = () => {
    return (
        <section className="relative py-24 bg-gradient-to-b from-background to-feature-background overflow-hidden" suppressHydrationWarning={true}>


            <div className="container mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning={true}>
                {/* Header */}
                <div className="text-center mb-10 sm:mb-14" suppressHydrationWarning={true}>
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">Demo</span>
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                        A quick walkthrough of how FromScratch.ai turns an idea into a complete, shareable plan.
                    </p>
                </div>

                {/* Video Card */}
                <div className="max-w-5xl mx-auto" suppressHydrationWarning={true}>
                    <div className="group relative rounded-2xl border border-feature-border bg-card/60 backdrop-blur-sm shadow-large overflow-hidden" suppressHydrationWarning={true}>
          
                        {/* Aspect wrapper */}
                        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }} suppressHydrationWarning={true}>
                            <iframe
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                                title="FromScratch.ai – Product Demo"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 h-full w-full rounded-[calc(theme(borderRadius.2xl)-2px)]"
                            />
                        </div>

                        {/* Footer bar */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-background/60 border-t border-feature-border" suppressHydrationWarning={true}>
                            <div className="text-xs sm:text-sm text-muted-foreground" suppressHydrationWarning={true}>
                                Tip: Press F to toggle fullscreen • Space to pause
                            </div>
                            <a
                                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs sm:text-sm font-medium text-primary hover:underline"
                                aria-label="Open the demo on YouTube"
                            >
                                Watch on YouTube
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoVideo;
