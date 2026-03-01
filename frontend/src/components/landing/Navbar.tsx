import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Leaf } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full sticky top-0 z-50 px-4 md:px-8 pt-4">
      <nav className="max-w-6xl mx-auto py-3 px-4 md:px-6 flex items-center justify-between bg-primary rounded-full shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <span className="text-white font-bold text-lg">Recova</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          <a
            href="#features"
            className="text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            Platform
          </a>
          <a
            href="#features"
            className="text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            Assessment
          </a>
          <a
            href="#journey"
            className="text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            Case Studies
          </a>
          <a
            href="#journey"
            className="text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            Pricing
          </a>
        </div>

        <Link to="/session" className="hidden md:block">
          <Button variant="default" size="sm" className="bg-white text-primary hover:bg-white/90 font-medium rounded-full px-5 py-2 h-auto">
            Request Demo
          </Button>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 bg-primary rounded-2xl shadow-lg p-6 flex flex-col gap-4">
          <a
            href="#features"
            className="text-white font-medium text-sm py-2"
          >
            Platform
          </a>
          <a
            href="#features"
            className="text-white font-medium text-sm py-2"
          >
            Assessment
          </a>
          <a
            href="#journey"
            className="text-white font-medium text-sm py-2"
          >
            Case Studies
          </a>
          <a
            href="#journey"
            className="text-white font-medium text-sm py-2"
          >
            Pricing
          </a>
          <Link to="/session">
            <Button variant="default" size="default" className="w-full bg-white text-primary hover:bg-white/90 font-medium rounded-full">
              Request Demo
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
