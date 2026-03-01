import { Camera, HeartPulse, Activity, Brain, Shield } from "lucide-react";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import BounceCards from "@/components/ui/BounceCards";

const features = [
  {
    icon: Camera,
    title: "AI Motion Tracking",
    description:
      "Camera-based vision guides your form in real-time.",
  },
  {
    icon: HeartPulse,
    title: "Personalized Plans",
    description:
      "Recovery roadmaps that adapt to your needs.",
  },
  {
    icon: Activity,
    title: "Holistic Insights",
    description:
      "Track improvements with detailed analytics.",
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description:
      "AI learns from your progress over time.",
  },
  {
    icon: Shield,
    title: "Injury Prevention",
    description:
      "Proactive alerts to ensure safe exercise.",
  },
];

const transformStyles = [
  'rotate(-8deg) translate(-380px)',
  'rotate(-4deg) translate(-190px)',
  'rotate(0deg)',
  'rotate(4deg) translate(190px)',
  'rotate(8deg) translate(380px)'
];

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3, rootMargin: "-100px 0px" });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.15, rootMargin: "-80px 0px" });

  return (
    <section
      id="features"
      className="w-full px-6 md:px-12 py-16 md:py-20 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div 
          ref={headerRef}
          className={`text-center mb-10 animate-fade-up ${headerVisible ? 'is-visible' : ''}`}
        >
          <p className="text-sm font-semibold text-sage uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Recovery Reimagined
          </h2>
        </div>

        <div 
          ref={cardsRef} 
          className={`flex justify-center animate-fade-up ${cardsVisible ? 'is-visible' : ''}`}
        >
          <BounceCards
            cards={features}
            containerWidth={1200}
            containerHeight={480}
            animationDelay={1}
            animationStagger={0.08}
            easeType="elastic.out(1, 0.8)"
            transformStyles={transformStyles}
            enableHover={true} 
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
