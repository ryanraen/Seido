import { Link } from "react-router-dom";
import { Star, Play, Check, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import TiltableCard from "@/components/ui/TiltableCard";
import ShinyText from "@/components/ui/ShinyText";
import CountUp from "@/components/ui/CountUp";
import meditationLandingImg from "@/assets/meditation_landing.png";

const Hero = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-16 md:py-24 lg:py-28 min-h-screen flex items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full">
        {/* Left content */}
        <div className="flex-1 space-y-7">
          <div className="inline-flex items-center gap-2 bg-sage-light text-foreground px-5 py-3 rounded-full text-base font-semibold">
            <div className="w-2.5 h-2.5 rounded-full bg-sage" />
            AI-Powered Rehabilitation
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight pb-1 bg-gradient-to-r from-foreground via-primary to-sage bg-clip-text text-transparent">
            <span className="font-['Rouge_Script'] text-6xl md:text-7xl lg:text-9xl">
              Healing
            </span>{" "}
            made personal & precise
          </h1>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground flex items-center gap-3 flex-wrap">
            with{" "}
            <span className="inline-flex items-center gap-2 text-primary bg-sage-light px-4 py-2 rounded-xl">
              <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-black" />
              </div>
              <ShinyText
                text="Recova"
                className="font-['Instrument_Serif']"
                color="black"
                shineColor="#8fbc94"
                speed={3.5}
                spread={150}
              />
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
            Personalized physiotherapy rehabilitation with structured exercise
            assessment and real-time movement feedback for accelerated recovery.
          </p>

          <div className="flex flex-wrap gap-5 pt-3">
            <Link to="/session">
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 group"
              >
                Begin Self-Assessment
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
              className="bg-white border-2 border-border hover:bg-sage-light hover:border-sage font-semibold rounded-full px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 group"
            >
              <div className="w-7 h-7 rounded-full bg-sage flex items-center justify-center mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Play className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              Platform Demo
            </Button>
            <Link to="/gallery">
              <Button
                variant="outline"
                size="lg"
                className="bg-white border-2 border-border hover:bg-sage-light hover:border-sage font-semibold rounded-full px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 group"
              >
                Exercise Gallery
              </Button>
            </Link>
          </div>

          {/* Reviews counter */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-base">
              Over <CountUp to={100} duration={2.5} className="font-bold text-foreground" /> positive reviews
            </span>
          </div>
        </div>

        {/* Right demo cards */}
        <div className="flex-1 max-w-lg w-full space-y-5">
          {/* Live Demo Card */}
          <TiltableCard rotateAmplitude={10} scaleOnHover={1.02}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border p-6">
              {/* Card Header with dots and LIVE DEMO */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
                </div>
                <span className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
                  Live Demo
                </span>
              </div>

              {/* Main Image with overlay */}
              <div className="relative rounded-xl overflow-hidden mb-5">
                <img
                  src={meditationLandingImg}
                  alt="Movement analysis demo"
                  className="w-full h-56 object-cover"
                />
                {/* Alignment badge overlay */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
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
                  <p className="text-base text-muted-foreground">
                    Lower back relief
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </TiltableCard>

          {/* Movement Analysis Card */}
          <TiltableCard rotateAmplitude={10} scaleOnHover={1.02}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
              {/* Card Header */}
              <div className="bg-white p-5 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-white">PF</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        Movement Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Live Session • Hip Flexion
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-foreground mb-1">
                      84°
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Current Angle
                    </p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-foreground mb-1">
                      92%
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Form Accuracy
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Active Track */}
                <div className="bg-sage-light rounded-xl p-4 border border-sage/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base mb-0.5">
                        Active Recovery Track
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Module 4 of 12 • 15 mins left
                      </p>
                    </div>
                  </div>
                </div>

                {/* Structured Assessment */}
                <div className="bg-primary rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1.5 bg-sage rounded-full shrink-0">
                      <span className="text-xs font-bold text-primary">
                        REC
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base mb-0.5">
                        Structured Assessment
                      </h4>
                      <p className="text-sm text-white/70">
                        Session recording enabled
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Report Button */}
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-colors text-base">
                  View Full Bio-Report
                </button>
              </div>
            </div>
          </TiltableCard>
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
