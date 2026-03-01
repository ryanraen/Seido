import { Link } from "react-router-dom";
import { Star, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="w-full px-6 md:px-12 py-12 md:py-20 lg:py-24 min-h-[90vh] flex items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left content */}
        <div className="flex-1 space-y-7">
          <div className="inline-flex items-center gap-2 bg-sage-light text-foreground px-4 py-2.5 rounded-full text-sm font-semibold">
            <div className="w-2 h-2 rounded-full bg-sage" />
            AI-Powered Rehabilitation v2.0
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight bg-gradient-to-r from-foreground via-primary to-sage bg-clip-text text-transparent">
            Master Every Movement Analysis
          </h1>
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
            with <span className="text-primary bg-sage-light px-3 py-1 rounded-lg">Rehabify</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Personalized physiotherapy rehabilitation with structured exercise assessment and real-time movement feedback for accelerated recovery.
          </p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-sage" />
              <span className="font-medium text-foreground">Computer Vision</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" strokeWidth="2" />
              </svg>
              <span className="font-medium text-foreground">ROM Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium text-foreground">Posture Correction</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/session">
              <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full">
                Begin Self-Assessment
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-white border-2 border-border hover:bg-accent font-semibold rounded-full">
              <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center mr-1">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
              Platform Demo
            </Button>
          </div>


        </div>

        {/* Right demo card */}
        <div className="flex-1 max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-border">
            {/* Card Header */}
            <div className="bg-white p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">PF</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Movement Analysis</h3>
                    <p className="text-sm text-muted-foreground">Live Session • Hip Flexion</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">84°</p>
                  <p className="text-xs text-muted-foreground font-medium">Current Angle</p>
                </div>
                <div className="bg-muted rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">92%</p>
                  <p className="text-xs text-muted-foreground font-medium">Form Accuracy</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              {/* Active Track */}
              <div className="bg-sage-light rounded-2xl p-5 border border-sage/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Active Recovery Track</h4>
                    <p className="text-sm text-muted-foreground">Module 4 of 12 • 15 mins left</p>
                  </div>
                </div>
              </div>

              {/* Structured Assessment */}
              <div className="bg-primary rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="px-3 py-1.5 bg-sage rounded-full shrink-0">
                    <span className="text-xs font-bold text-primary">REC</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Structured Assessment</h4>
                    <p className="text-sm text-white/70">Session recording enabled</p>
                  </div>
                </div>
              </div>

              {/* View Report Button */}
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-2xl transition-colors">
                View Full Bio-Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-sage-light border-2 border-sage rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
