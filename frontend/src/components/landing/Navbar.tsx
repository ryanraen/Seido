import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full py-3 px-6 md:px-12 flex items-center justify-between bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b-2 border-border shadow-sm">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold font-serif text-foreground">
          Rehabify
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a
          href="#features"
          className="text-foreground/70 hover:text-foreground transition-colors text-sm font-semibold"
        >
          Methodology
        </a>
        <a
          href="#features"
          className="text-foreground/70 hover:text-foreground transition-colors text-sm font-semibold"
        >
          Exercises
        </a>
        <a
          href="#journey"
          className="text-foreground/70 hover:text-foreground transition-colors text-sm font-semibold"
        >
          Technology
        </a>
        <a
          href="#journey"
          className="text-foreground/70 hover:text-foreground transition-colors text-sm font-semibold"
        >
          Pricing
        </a>
      </div>

      <Link to="/session" className="hidden md:block">
        <Button variant="cta" size="lg">
          Start Recovery <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b-2 border-border shadow-lg p-6 flex flex-col gap-4 md:hidden">
          <a
            href="#features"
            className="text-foreground font-semibold text-sm py-2"
          >
            Methodology
          </a>
          <a
            href="#features"
            className="text-foreground font-semibold text-sm py-2"
          >
            Exercises
          </a>
          <a
            href="#journey"
            className="text-foreground font-semibold text-sm py-2"
          >
            Technology
          </a>
          <a
            href="#journey"
            className="text-foreground font-semibold text-sm py-2"
          >
            Pricing
          </a>
          <Link to="/session">
            <Button variant="cta" size="lg" className="w-full">
              Start Recovery <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
