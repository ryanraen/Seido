import { Link } from "react-router-dom";
import { Leaf, Mail, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-serif">Rehabify</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              AI-powered physiotherapy that makes healing personal, precise, and
              accessible from anywhere.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Methodology
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Exercises
                </a>
              </li>
              <li>
                <a
                  href="#journey"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="#journey"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Stay Updated
            </h4>
            <p className="text-sm text-primary-foreground/60 mb-4">
              Get recovery tips and product updates delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2">
                <Mail className="w-4 h-4 text-primary-foreground/50 shrink-0" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-transparent text-sm outline-none text-primary-foreground placeholder:text-primary-foreground/40 w-full"
                  readOnly
                />
              </div>
              <button className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center shrink-0 hover:bg-terracotta/90 transition-colors">
                <ArrowRight className="w-4 h-4 text-terracotta-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            2026 Rehabify. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
