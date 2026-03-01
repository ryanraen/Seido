import { Link } from "react-router-dom";
import { Star, Play, Check } from "lucide-react";
import heroImage from "@/assets/hero-yoga.jpg";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="w-full px-6 md:px-12 py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left content */}
        <div className="flex-1 space-y-7">
          <div className="inline-flex items-center gap-2 bg-peach/40 text-peach-foreground px-4 py-2 rounded-full text-sm font-semibold border border-peach/60">
            <Star className="w-4 h-4 text-terracotta" />
            AI-Powered Physiotherapy
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight text-foreground">
            Healing made{" "}
            <span className="text-terracotta">personal & precise.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Recover from the comfort of your home with real-time pose correction
            and warm, supportive guidance. No appointments needed.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/session">
              <Button variant="hero" size="lg">
                Try Demo
              </Button>
            </Link>
            <Button variant="hero-outline" size="lg">
              <Play className="w-4 h-4 text-terracotta" />
              Watch Video
            </Button>
          </div>
        </div>

        {/* Right demo card */}
        <div className="flex-1 max-w-lg w-full">
          <div className="bg-card rounded-2xl border-2 border-border shadow-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-card">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-terracotta" />
                <div className="w-3 h-3 rounded-full bg-amber-soft" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                Live Demo
              </span>
            </div>
            <div className="px-4 pb-2">
              <div className="rounded-xl overflow-hidden relative">
                <img
                  src={heroImage}
                  alt="Cobra stretch exercise on ocean rocks at sunset"
                  className="w-full h-56 sm:h-64 object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-md border border-border">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="text-sm font-medium text-foreground">
                    Back alignment:{" "}
                  </span>
                  <span className="text-sm font-bold text-success">Good</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-card">
              <div>
                <p className="font-bold text-foreground">Cobra Stretch</p>
                <p className="text-sm text-muted-foreground">
                  Lower back relief
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center border border-sage/30">
                  <Check className="w-4 h-4 text-sage" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
