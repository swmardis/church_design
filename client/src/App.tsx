import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import About from "@/pages/About";
import NextSteps from "@/pages/NextSteps";
import Contact from "@/pages/Contact";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

// Leader Pages
import LeaderDashboard from "@/pages/leader/LeaderDashboard";
import LeaderEvents from "@/pages/leader/LeaderEvents";
import LeaderMedia from "@/pages/leader/LeaderMedia";
import LeaderHomeEdit from "@/pages/leader/LeaderHomeEdit";
import LeaderAbout from "@/pages/leader/LeaderAbout";
import LeaderNextSteps from "@/pages/leader/LeaderNextSteps";
import LeaderContact from "@/pages/leader/LeaderContact";
import LeaderSettings from "@/pages/leader/LeaderSettings";
import LeaderUsers from "@/pages/leader/LeaderUsers";
import LeaderResources from "@/pages/leader/LeaderResources";
import { LeaderLayout } from "@/components/LeaderLayout";
import { BackToTop } from "@/components/BackToTop";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isLeaderRoute = location.startsWith("/leader") || location.startsWith("/admin");

  useEffect(() => {
    // If using hash anchors, let the browser handle them
    if (location.includes("#")) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  if (isLeaderRoute) {
    return (
      <LeaderLayout>
        <Switch>
          <Route path="/leader/dashboard" component={LeaderDashboard} />
          <Route path="/admin/dashboard" component={LeaderDashboard} />
          <Route path="/leader/events" component={LeaderEvents} />
          <Route path="/leader/media" component={LeaderMedia} />
          <Route path="/leader/home" component={LeaderHomeEdit} />
          <Route path="/leader/about" component={LeaderAbout} />
          <Route path="/leader/next-steps" component={LeaderNextSteps} />
          <Route path="/leader/contact" component={LeaderContact} />
          <Route path="/leader/settings" component={LeaderSettings} />
          <Route path="/leader/users" component={LeaderUsers} />
          <Route path="/leader/resources" component={LeaderResources} />
          <Route component={NotFound} />
        </Switch>
      </LeaderLayout>
    );
  }

  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/events" component={Events} />
        <Route path="/about" component={About} />
        <Route path="/next-steps" component={NextSteps} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
