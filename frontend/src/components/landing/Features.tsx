import { Camera, HeartPulse, Activity } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Motion Tracking",
    description:
      "No wearables needed. Just use your camera, and our vision engine guides your form in real-time.",
    iconBg: "bg-sage-light",
    iconColor: "text-sage",
    borderAccent: "border-sage/20 hover:border-sage/40",
  },
  {
    icon: HeartPulse,
    title: "Personalized Plans",
    description:
      "Tailored recovery roadmaps that adapt daily based on your pain levels and mobility score.",
    iconBg: "bg-peach/50",
    iconColor: "text-terracotta",
    borderAccent: "border-terracotta/15 hover:border-terracotta/35",
  },
  {
    icon: Activity,
    title: "Holistic Insights",
    description:
      "Track your range of motion improvements over time with detailed analytics.",
    iconBg: "bg-secondary",
    iconColor: "text-primary",
    borderAccent: "border-primary/10 hover:border-primary/30",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="w-full px-6 md:px-12 py-16 md:py-20 bg-secondary/60"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-sm font-bold text-terracotta uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            Recovery reimagined
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`bg-background rounded-2xl border-2 ${feature.borderAccent} p-7 md:p-8 hover:shadow-lg transition-all duration-300 group`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold font-sans text-foreground mb-3">
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
