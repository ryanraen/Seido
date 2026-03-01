import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TiltableCard from "@/components/ui/TiltableCard";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Activity, Sparkles, TrendingUp, HeartPulse, UserCheck } from "lucide-react";
import galleryHero from "@/assets/meditation_landing.png";

const exercises = [
  {
    title: "Squat Series",
    focus: "Posterior chain",
    highlight: "Hip stability + loaded depth",
    badge: "Strength",
    stat: "88° depth",
    icon: TrendingUp,
    tone: "bg-amber-light text-amber",
    note: "Keep knees tracking mid-foot, chest proud."
  },
  {
    title: "Forward Bend",
    focus: "Spinal flexion control",
    highlight: "Trigger hamstring engagement",
    badge: "Mobility",
    stat: "Full ROM",
    icon: Activity,
    tone: "bg-sage-light text-sage",
    note: "Emphasize slow descent and relaxed neck."
  },
  {
    title: "Backward Arch",
    focus: "Extension resilience",
    highlight: "Protect lumbar arch",
    badge: "Protection",
    stat: "Smooth extension",
    icon: HeartPulse,
    tone: "bg-terracotta-light text-terracotta",
    note: "Initiate from thoracic spine, not lumbar."
  },
  {
    title: "Plank Progression",
    focus: "Core + shoulder stack",
    highlight: "Load + breathing",
    badge: "Control",
    stat: "10s hold",
    icon: Sparkles,
    tone: "bg-primary-light text-primary",
    note: "Breathe diaphragmatically, avoid sag."
  },
  {
    title: "Bridge Variations",
    focus: "Glute drive",
    highlight: "Pelvic articulation",
    badge: "Activation",
    stat: "3 reps",
    icon: UserCheck,
    tone: "bg-sage-light text-sage",
    note: "Fire glutes without overarching the spine."
  },
  {
    title: "Calibrated Cooldown",
    focus: "Neural reset",
    highlight: "Intentional breathing",
    badge: "Recovery",
    stat: "5 min",
    icon: ArrowUpRight,
    tone: "bg-muted text-muted-foreground",
    note: "Pair gentle movement cues with mindful breath."
  },
];

const ExerciseGallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto mt-10 max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {exercises.map((exercise) => {
            const Icon = exercise.icon;
            return (
              <TiltableCard key={exercise.title} rotateAmplitude={10} scaleOnHover={1.03}>
                <div className="bg-white border border-border rounded-3xl shadow-xl p-6 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                      {exercise.badge}
                    </span>
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold ${exercise.tone}`}>
                      {exercise.focus}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{exercise.title}</h3>
                      <p className="text-sm text-muted-foreground">{exercise.highlight}</p>
                    </div>
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-foreground font-semibold mb-3">
                    <span>{exercise.stat}</span>
                    <span className="text-xs text-muted-foreground">metrics</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">{exercise.note}</p>
                  <div className="mt-6">
                    <Button variant="hero-outline" size="sm" className="px-5 py-3 rounded-full">
                      Start guide
                    </Button>
                  </div>
                </div>
              </TiltableCard>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExerciseGallery;
