import { ClipboardList, Target, Search, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up and enter your injury details and mobility restrictions. Your preferences are saved for easy access.",
    icon: ClipboardList,
    position: "left",
  },
  {
    number: "02",
    title: "Set Your Filters",
    description:
      "Choose your recovery goals and time commitment. Add any additional filters like exercise intensity or focus areas.",
    icon: Target,
    position: "right",
  },
  {
    number: "03",
    title: "Explore the Plan",
    description:
      "Browse exercises on our interactive dashboard. Green indicators show perfect form, amber shows areas to improve.",
    icon: Search,
    position: "left",
  },
  {
    number: "04",
    title: "Start Recovery",
    description:
      "Begin your personalized rehabilitation journey with real-time AI guidance and progress tracking.",
    icon: Zap,
    position: "right",
  },
];

const Journey = () => {
  return (
    <section id="journey" className="w-full px-6 md:px-12 py-16 md:py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-sage uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Recovery in 4 Simple Steps
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From setup to your first session, we've made the process as easy as possible.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-sage/40 -translate-x-1/2 hidden md:block rounded-full" />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step) => (
              <div key={step.number} className="relative md:flex md:items-center md:min-h-[220px]">
                {/* Icon in center */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:flex">
                  <div className="w-14 h-14 bg-sage rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-sage/20">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`md:w-[calc(50%-50px)] ${
                    step.position === "left"
                      ? "md:mr-auto md:pr-10"
                      : "md:ml-auto md:pl-10"
                  }`}
                >
                  <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-sage/10 hover:shadow-xl hover:border-sage/30 transition-all duration-300">
                    {/* Mobile icon */}
                    <div className="flex items-center gap-4 mb-5 md:hidden">
                      <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center shadow-lg">
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-3xl font-bold text-sage">
                        {step.number}
                      </span>
                    </div>

                    {/* Desktop number */}
                    <p className="hidden md:block text-3xl font-bold text-sage mb-3">
                      {step.number}
                    </p>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
