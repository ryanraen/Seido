import journeyImage from "@/assets/journey-meditation.jpg";

const steps = [
  {
    number: 1,
    title: "Smart Assessment",
    description:
      "A quick interview and mobility scan to understand your needs.",
    active: true,
    color: "border-sage bg-sage-light text-sage",
  },
  {
    number: 2,
    title: "Daily Routine",
    description: "Follow your custom exercise plan with live feedback.",
    active: false,
    color: "border-terracotta/40 text-terracotta",
  },
  {
    number: 3,
    title: "Track Recovery",
    description: "Watch your mobility score improve week by week.",
    active: false,
    color: "border-muted-foreground/30 text-muted-foreground",
  },
];

const Journey = () => {
  return (
    <section id="journey" className="w-full px-6 md:px-12 py-16 md:py-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
              Your journey to wellness
            </h2>
            <p className="text-muted-foreground max-w-md">
              We guide you through every step of the rehabilitation process.
            </p>
          </div>

          <div className="space-y-5">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4 items-start group">
                <div
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${step.color}`}
                >
                  {step.number}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-foreground text-base">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-lg w-full">
          <div className="rounded-2xl overflow-hidden relative shadow-lg">
            <img
              src={journeyImage}
              alt="Meditation and wellness journey"
              className="w-full h-72 sm:h-80 object-cover rounded-2xl"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-md border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Current Stage
              </p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">Mobility Phase</p>
                <span className="text-terracotta font-bold text-lg">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-terracotta h-2 rounded-full transition-all"
                  style={{ width: "85%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
