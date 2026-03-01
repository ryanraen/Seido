import { Camera, HeartPulse, Activity, Brain } from "lucide-react";

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
  return (
    <section
      id="features"
      className="w-full px-6 md:px-12 py-16 md:py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-sm font-semibold text-sage uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Recovery reimagined
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-muted/30 rounded-2xl border border-sage/10 p-6 md:p-7 hover:shadow-lg hover:border-sage/30 transition-all duration-300 group"
            >
              <div
                className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
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
