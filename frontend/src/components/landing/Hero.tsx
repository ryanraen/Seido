import { Link } from "react-router-dom";
import { Star, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import meditationLandingImg from "@/assets/meditation_landing.png";

const Hero = () => {
  return (
    <section className="w-full px-8 md:px-16 lg:px-20 py-20 md:py-28 lg:py-36 min-h-screen flex items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-14 lg:gap-24 w-full">
        {/* Left content */}
        <div className="flex-1 space-y-10">
          <div className="inline-flex items-center gap-3 bg-sage-light text-foreground px-6 py-3.5 rounded-full text-lg font-semibold">
            <div className="w-3 h-3 rounded-full bg-sage" />
            AI-Powered Rehabilitation v2.0
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-normal pb-2 bg-gradient-to-r from-foreground via-primary to-sage bg-clip-text text-transparent">
            Healing made personal & precise
          </h1>
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-foreground">
            with{" "}
            <span className="text-primary bg-sage-light px-5 py-2.5 rounded-xl">
              Rehabify
            </span>
          </h2>

          <p className="text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            Personalized physiotherapy rehabilitation with structured exercise
            assessment and real-time movement feedback for accelerated recovery.
          </p>

          <div className="flex flex-wrap gap-10 text-lg">
            <div className="flex items-center gap-3">
              <Star className="w-7 h-7 text-sage" />
              <span className="font-medium text-foreground">
                Computer Vision
              </span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-7 h-7 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  strokeWidth="2"
                />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" strokeWidth="2" />
              </svg>
              <span className="font-medium text-foreground">ROM Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-7 h-7 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17l10 5 10-5M2 12l10 5 10-5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium text-foreground">
                Posture Correction
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
            <Link to="/session">
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-10 py-7 text-xl"
              >
                Begin Self-Assessment
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="bg-white border-2 border-border hover:bg-accent font-semibold rounded-full px-10 py-7 text-xl"
            >
              <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center mr-3">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              Platform Demo
            </Button>
          </div>
        </div>

        {/* Right demo card */}
        <div className="flex-1 max-w-xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-border p-6">
            {/* Card Header with dots and LIVE DEMO */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-400" />
                <div className="w-4 h-4 rounded-full bg-amber-400" />
                <div className="w-4 h-4 rounded-full bg-green-400" />
              </div>
              <span className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
                Live Demo
              </span>
            </div>

            {/* Main Image with overlay */}
            <div className="relative rounded-2xl overflow-hidden mb-6">
              <img
                src={meditationLandingImg}
                alt="Movement analysis demo"
                className="w-full h-64 md:h-80 object-cover"
              />
              {/* Alignment badge overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2.5 flex items-center gap-2 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-foreground">
                  Back alignment:
                </span>
                <span className="text-sm font-bold text-green-600">Good</span>
              </div>
            </div>

            {/* Exercise Info Footer */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Cobra Stretch
                </h3>
                <p className="text-muted-foreground">Lower back relief</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-light border-2 border-sage flex items-center justify-center">
                <Check className="w-6 h-6 text-sage" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-sage-light border-2 border-sage rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <svg
            className="w-6 h-6 text-sage"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
