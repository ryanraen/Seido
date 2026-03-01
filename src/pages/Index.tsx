import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SessionPreview from "@/components/landing/SessionPreview";
import Journey from "@/components/landing/Journey";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <SessionPreview />
      <Journey />
      <Footer />
    </div>
  );
};

export default Index;
