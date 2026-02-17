import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Button
        size="icon"
        onClick={scrollToTop}
        data-testid="button-back-to-top"
        aria-label="Back to top"
        className="rounded-full shadow-lg"
      >
        <ArrowUp className="w-4 h-4" />
      </Button>
    </div>
  );
}
