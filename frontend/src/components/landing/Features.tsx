import { Camera, HeartPulse, Activity, Brain } from "lucide-react";
import useScrollAnimation from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Camera,
    title: "AI Motion Tracking",
    description:
      "No wearables needed. Just use your camera, and our vision engine guides your form in real-time.",
  },
  {
    icon: HeartPulse,
    title: "Personalized Plans",
    description:
      "Tailored recovery roadmaps that adapt daily based on your pain levels and mobility score.",
  },
  {
    icon: Activity,
    title: "Holistic Insights",
    description:
      "Track your range of motion improvements over time with detailed analytics.",
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description:
      "AI-powered suggestions that learn from your progress and optimize your recovery path.",
  },
];

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3, rootMargin: "-100px 0px" });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.15, rootMargin: "-80px 0px" });

  return (
    <section
      id="features"
      className="w-full px-6 md:px-12 py-16 md:py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div 
          ref={headerRef}
          className={`text-center mb-12 md:mb-14 animate-fade-up ${headerVisible ? 'is-visible' : ''}`}
        >
          <p className="text-sm font-semibold text-sage uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Recovery Reimagined
          </h2>
        </div>

        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-muted/30 rounded-3xl border border-sage/10 p-8 md:p-10 hover:shadow-xl hover:border-sage/30 transition-all duration-300 group animate-scale-in stagger-${index + 1} ${cardsVisible ? 'is-visible' : ''}`}
            >
              <div
                className="w-16 h-16 rounded-2xl bg-sage flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 pb-2 border-b-2 border-sage/40">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
