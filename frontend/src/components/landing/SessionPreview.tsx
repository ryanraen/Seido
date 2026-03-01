import { Leaf, LogOut, Send, Camera } from "lucide-react";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import poseImg from "@/assets/chicken.png";

const SessionPreview = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2, rootMargin: "-50px 0px" });

  return (
    <section className="w-full px-6 md:px-12 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-sage uppercase tracking-widest mb-3">
            Platform Preview
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            See It In Action
          </h2>
        </div>

        {/* Session Preview Card */}
        <div 
          ref={sectionRef}
          className={`bg-muted/30 rounded-3xl border border-sage/10 overflow-hidden shadow-xl animate-fade-up ${sectionVisible ? 'is-visible' : ''}`}
        >
          {/* Phase Header */}
          <div className="bg-white px-6 py-4 border-b border-border flex items-center gap-4">
            <span className="px-3 py-1 bg-sage-light text-sage text-xs font-bold rounded-md uppercase tracking-wider">
              Phase 1
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              The Interview & Setup
            </h3>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* Left Sidebar */}
            <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-border p-6 flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-foreground">Rehabify</span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-6 flex-1">
                {/* Step 1 - Active */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-sage-light rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-sage" />
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-sage/30" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Initial Check</p>
                    <p className="text-xs text-terracotta">In Progress</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Analysis</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                    <span className="text-xs font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">Summary</p>
                  </div>
                </div>
              </div>

              {/* Exit Button */}
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-auto pt-6">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Exit Session</span>
              </button>
            </div>

            {/* Center - Camera View */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-muted/20">
              {/* Camera Frame */}
              <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
                {/* Camera Image */}
                <img 
                  src={poseImg} 
                  alt="Camera setup" 
                  className="w-full h-64 md:h-80 object-cover"
                />
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="scan-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80 shadow-[0_0_20px_5px_rgba(239,68,68,0.5)]" />
                </div>

                {/* Bounding Box Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-40 md:w-40 md:h-52 border-2 border-white/60 rounded-lg" />
                </div>

                {/* Recording Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-sm font-medium">REC • Mediapipe Active</span>
                </div>
              </div>

              {/* Setup Text */}
              <div className="text-center mt-6">
                <h4 className="text-xl font-bold text-foreground mb-1">Let's check your setup</h4>
                <p className="text-muted-foreground">Ensure your whole body is visible in the frame.</p>
              </div>
            </div>

            {/* Right - Chat Panel */}
            <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-border flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-light rounded-full flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Dr. AI Coach</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* AI Message */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-terracotta/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-terracotta font-bold">AI</span>
                  </div>
                  <div className="bg-sage-light/50 rounded-xl rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      Hi there! Before we start the plank analysis, how is your lower back feeling today on a scale of 1–10?
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex gap-2 justify-end">
                  <div className="bg-muted rounded-xl rounded-tr-none p-3 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      It feels okay, maybe a 3/10. Little stiff.
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white font-bold">Me</span>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-terracotta/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-terracotta font-bold">AI</span>
                  </div>
                  <div className="bg-sage-light/50 rounded-xl rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      Noted. We will proceed gently. Please step back until you fit in the box.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                  <input 
                    type="text" 
                    placeholder="Type your answer..." 
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                    readOnly
                  />
                  <button className="w-8 h-8 rounded-full bg-sage flex items-center justify-center hover:bg-sage/90 transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionPreview;
