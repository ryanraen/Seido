import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ApiKeySettings from "@/components/ApiKeySettings";
import Index from "./pages/Index";
import Session from "./pages/Session";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSettings, setShowSettings] = useState(false);

  const onSaved = () => {
    setShowSettings(false);
    // Reload so hooks reinitialize SDK clients using new runtime keys.
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/session" element={<Session />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        <div className="fixed bottom-4 right-4 z-50">
          <Button variant="hero-outline" size="sm" onClick={() => setShowSettings(true)}>
            API Settings
          </Button>
        </div>

        {showSettings && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif text-foreground">API Settings</h2>
                <Button variant="hero-outline" size="sm" onClick={() => setShowSettings(false)}>
                  Close
                </Button>
              </div>
              <ApiKeySettings onSaved={onSaved} onCancel={() => setShowSettings(false)} showCancel />
            </div>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
