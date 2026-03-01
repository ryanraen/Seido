import TiltableCard from "@/components/ui/TiltableCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ankleDorsiflexionImg from "@/assets/exercise-images/ankle-dori.jpg";
import backwardBendImg from "@/assets/exercise-images/backward-bend.png";
import birdDogImg from "@/assets/exercise-images/bird-dog.jpg";
import bridgeImg from "@/assets/exercise-images/bridge.jpg";
import catCowImg from "@/assets/exercise-images/catcow.jpg";
import deadBugImg from "@/assets/exercise-images/dead-bug.jpg";
import fowardBendImg from "@/assets/exercise-images/foward-bend.png";
import gluteBridgeImg from "@/assets/exercise-images/glute-bridge.jpg";
import hipCarImg from "@/assets/exercise-images/hipcar.jpg";
import hipFlexImg from "@/assets/exercise-images/hip-flex.jpg";
import marchingGluteImg from "@/assets/exercise-images/marching-glute.jpg";
import pelvicTiltImg from "@/assets/exercise-images/pelvic-tilt.jpg";
import plankImg from "@/assets/exercise-images/plank.jpg";
import resistanceBandImg from "@/assets/exercise-images/resistance-band.png";
import reverseLungeImg from "@/assets/exercise-images/reverse-lunge.png";
import seatedIlliImg from "@/assets/exercise-images/seated-illi.jpg";
import sidePlankImg from "@/assets/exercise-images/side-plank.jpg";
import singleLegDeadImg from "@/assets/exercise-images/single-leg-dead.jpg";
import squatImg from "@/assets/exercise-images/squat.png";
import standingRowImg from "@/assets/exercise-images/standing-row.jpg";
import thoracicImg from "@/assets/exercise-images/thoratic.jpg";
import wallAngelImg from "@/assets/exercise-images/wall-angel.jpg";

const exercises = [
  {
    name: "Squat",
    focus: "Lower body strength",
    description: "Loaded hinge for glute and quad activation. Keep chest lifted and knees tracking over toes.",
    intensity: "Medium",
    cues: ["Feet shoulder-width", "Drive through the heels"],
    stats: { angle: "90° depth", stability: "92%" },
    status: "Good",
    image: squatImg,
    ctaLink: "/session?phase=movement&exercise=squat",
  },
  {
    name: "Forward Bend",
    focus: "Posterior chain mobility",
    description: "Slow flexion with hip hinging to stretch hamstrings while protecting the spine.",
    intensity: "Low",
    cues: ["Soft knees", "Hinge from the hips"],
    stats: { angle: "70° reach", stability: "88%" },
    status: "Adjust",
    image: fowardBendImg,
    ctaLink: "/session?phase=movement&exercise=forwardExtension",
  },
  {
    name: "Backward Bend",
    focus: "Extension control",
    description: "Gentle lumbar extension to build tolerance without over-arching the lumbar spine.",
    intensity: "Low",
    cues: ["Hands rest on hips", "Keep ribs down"],
    stats: { angle: "15° lean", stability: "85%" },
    status: "Adjust",
    image: backwardBendImg,
    ctaLink: "/session?phase=movement&exercise=backExtension",
  },
  {
    name: "Plank",
    focus: "Core engagement",
    description: "Loaded anti-extension hold to reinforce neutral spine under load.",
    intensity: "High",
    cues: ["Brace abs", "Tuck the pelvis"],
    stats: { angle: "Flat line", stability: "90%" },
    status: "Good",
    image: plankImg,
  },
  {
    name: "Bridge",
    focus: "Glute drive",
    description: "Hip elevation with emphasis on glute squeeze and posterior chain rhythm.",
    intensity: "Medium",
    cues: ["Lead with the hips", "Hold at top"],
    stats: { angle: "30° lift", stability: "89%" },
    status: "Good",
    image: bridgeImg,
  },
  {
    name: "Reverse Lunge",
    focus: "Lateral stability",
    description: "Step backward into a controlled lunge to load the entire posterior chain.",
    intensity: "Medium",
    cues: ["Track knee", "Keep torso upright"],
    stats: { angle: "90° split", stability: "86%" },
    status: "Adjust",
    image: reverseLungeImg,
  },
  {
    name: "Single-leg Deadlift",
    focus: "Balance + hip hinge",
    description: "Controlled hinge on a single leg with focus on hip drive and spine neutrality.",
    intensity: "High",
    cues: ["Soft knee", "Engage glutes"],
    stats: { angle: "Flat", stability: "84%" },
    status: "Adjust",
    image: singleLegDeadImg,
  },
  {
    name: "Pelvic Tilt",
    focus: "Low back control",
    description: "Posterior pelvic tilt to build awareness of lumbar positioning.",
    intensity: "Low",
    cues: ["Brace abs", "Gently press low back"],
    stats: { duration: "5 sec", stability: "90%" },
    status: "Good",
    image: pelvicTiltImg,
  },
  {
    name: "Side Plank",
    focus: "Oblique stability",
    description: "Hold with straight line from head to heels, supporting body weight on one arm.",
    intensity: "Medium",
    cues: ["Stack hips", "Reach top arm"],
    stats: { duration: "15 sec", stability: "88%" },
    status: "Good",
    image: sidePlankImg,
  },
  {
    name: "Hip Flexor Stretch",
    focus: "Anterior mobility",
    description: "Lunge stretch reaching pelvis forward to unload the hip flexors.",
    intensity: "Low",
    cues: ["Square hips", "Soft back leg"],
    stats: { hold: "30 sec", stability: "90%" },
    status: "Good",
    image: hipFlexImg,
  },
  {
    name: "Cat-Cow",
    focus: "Spinal mobility",
    description: "Flow through flexion and extension to lubricate the spine.",
    intensity: "Low",
    cues: ["Move with breath", "Feel each segment"],
    stats: { reps: "5", stability: "92%" },
    status: "Good",
    image: catCowImg,
  },
  {
    name: "Dead Bug",
    focus: "Core control",
    description: "Slow limb extension while keeping lumbar spine pressed to the mat.",
    intensity: "Medium",
    cues: ["Press low back", "Activate TVA"],
    stats: { reps: "8", stability: "89%" },
    status: "Adjust",
    image: deadBugImg,
  },
  {
    name: "Wall Angels",
    focus: "Shoulder mechanics",
    description: "Slide arms up and down wall while keeping lumbar contact.",
    intensity: "Low",
    cues: ["Keep ribs down", "Light pressure main"],
    stats: { reps: "10", stability: "91%" },
    status: "Good",
    image: wallAngelImg,
  },
  {
    name: "Glute Bridge March",
    focus: "Pelvic stability",
    description: "Bridge while alternating leg lifts to challenge core and hip drive.",
    intensity: "Medium",
    cues: ["Keep hips level","Slow lift"],
    stats: { reps: "10", stability: "87%" },
    status: "Adjust",
    image: gluteBridgeImg,
  },
  {
    name: "Thoracic Rotation",
    focus: "Upper thoracic mobility",
    description: "Thread the needle with one arm reaching through to rotate upper back.",
    intensity: "Low",
    cues: ["Lead with elbow","Hips square"],
    stats: { reps: "6", stability: "90%" },
    status: "Good",
    image: thoracicImg,
  },
  {
    name: "Standing Rows",
    focus: "Scapular control",
    description: "Band or cable row with scapula retraction and low back bracing.",
    intensity: "Medium",
    cues: ["Squeeze shoulder blades","Neutral spine"],
    stats: { reps: "10", stability: "89%" },
    status: "Good",
    image: standingRowImg,
  },
  {
    name: "Ankle Dorsiflexion",
    focus: "Foot mobility",
    description: "Controlled ankle flex while keeping toes lifted.",
    intensity: "Low",
    cues: ["Keep heel down","Slow return"],
    stats: { reps: "12", stability: "93%" },
    status: "Good",
    image: ankleDorsiflexionImg,
  },
  {
    name: "Seated Iliopsoas Stretch",
    focus: "Hip flexor release",
    description: "Kneel and lean forward to open the hip flexor gently.",
    intensity: "Low",
    cues: ["Square hips","Breathe"],
    stats: { hold: "20 sec", stability: "88%" },
    status: "Good",
    image: seatedIlliImg,
  },
  {
    name: "Resistance Band Pull Apart",
    focus: "Upper back endurance",
    description: "Band pulls with scapular depression and retraction.",
    intensity: "Low",
    cues: ["Keep chest tall","Controlled swing"],
    stats: { reps: "15", stability: "90%" },
    status: "Good",
    image: resistanceBandImg,
  },
  {
    name: "Marching Glute Bridge",
    focus: "Posterior chain rhythm",
    description: "Bridge with alternating knee drive to challenge stability.",
    intensity: "Medium",
    cues: ["Slow tempo","Keep pelvis level"],
    stats: { reps: "10", stability: "86%" },
    status: "Adjust",
    image: marchingGluteImg,
  },
  {
    name: "Hip CARs",
    focus: "Controlled rotation",
    description: "Passively move entire hip through its range slowly and fluidly.",
    intensity: "Medium",
    cues: ["Mindful movement","constant tension"],
    stats: { reps: "5 each", stability: "92%" },
    status: "Good",
    image: hipCarImg,
  },
  {
    name: "Bird Dog",
    focus: "Anti-rotation core",
    description: "Extend opposite arm and leg while keeping pelvis stable.",
    intensity: "High",
    cues: ["Hips square","Steady breath"],
    stats: { reps: "8", stability: "87%" },
    status: "Adjust",
    image: birdDogImg,
  },
];

const Gallery = () => {
  return (
    <section className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            curated movement library
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Exercise Gallery
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore each movement that feeds our posture analysis. Tap any card to see the coaching cues, target area, and live form indicators.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Squat", href: "/session?phase=movement&exercise=squat" },
                { label: "Forward Bend", href: "/session?phase=movement&exercise=forwardExtension" },
                { label: "Backward Bend", href: "/session?phase=movement&exercise=backExtension" },
              ].map((item) => (
                <Link key={item.label} to={item.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-foreground px-5 py-2 rounded-full shadow"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <Link to="/session" className="w-full sm:w-auto">
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full px-6 py-3 text-base font-semibold bg-sage-light border border-sage/40 text-foreground hover:bg-sage/90 hover:text-white shadow-lg"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage" />
                    AI-Powered Rehabilitation
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exercises.map((exercise) => (
            <TiltableCard
              key={exercise.name}
              rotateAmplitude={6}
              scaleOnHover={1.02}
              className="h-full"
            >
              <div className="h-full overflow-hidden rounded-2xl border border-border shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white flex flex-col">
                {/* Image section */}
                <div
                  className="h-40 bg-cover bg-center flex-shrink-0 relative"
                  style={{ backgroundImage: `url(${exercise.image})` }}
                >
                  {/* Intensity badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium bg-white/90 text-foreground rounded-full">
                      {exercise.intensity}
                    </span>
                  </div>
                  
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${
                      exercise.status === "Good" 
                        ? "bg-emerald-500/90 text-white" 
                        : "bg-amber-500/90 text-white"
                    }`}>
                      {exercise.status}
                    </span>
                  </div>
                </div>
                
                {/* Content section */}
                <div className="flex-1 p-4 flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground leading-tight">
                      {exercise.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {exercise.focus}
                    </p>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {exercise.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(exercise.stats).map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg bg-slate-50 px-2 py-2 text-center"
                      >
                        <p className="text-foreground font-semibold text-sm">
                          {value}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cues */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Coaching Cues
                    </p>
                    <ul className="space-y-1 text-xs text-foreground">
                      {exercise.cues.map((cue) => (
                        <li key={cue} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* CTA Button - always show if available */}
                  {exercise.ctaLink && (
                    <Link to={exercise.ctaLink} className="block mt-auto pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center rounded-full border-slate-200 text-foreground text-xs py-1.5 h-8 hover:bg-slate-50"
                      >
                        Try demo
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </TiltableCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
