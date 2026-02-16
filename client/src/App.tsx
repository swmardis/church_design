import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

// Leader Pages
import LeaderDashboard from "@/pages/leader/LeaderDashboard";
import LeaderEvents from "@/pages/leader/LeaderEvents";
import LeaderMedia from "@/pages/leader/LeaderMedia";
import LeaderHomeEdit from "@/pages/leader/LeaderHomeEdit";
import { LeaderLayout } from "@/components/LeaderLayout";

// Wrapper for public pages (adds Nav + Footer)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isLeaderRoute = location.startsWith("/leader");

  if (isLeaderRoute) {
    return (
      <LeaderLayout>
        <Switch>
          <Route path="/leader/dashboard" component={LeaderDashboard} />
          <Route path="/leader/events" component={LeaderEvents} />
          <Route path="/leader/media" component={LeaderMedia} />
          <Route path="/leader/home" component={LeaderHomeEdit} />
          {/* Add other leader routes here */}
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
        {/* Placeholder pages for routes not fully implemented yet but linked */}
        <Route path="/about" component={() => <div className="p-20 text-center font-display text-2xl">About Page Coming Soon</div>} />
        <Route path="/contact" component={() => <div className="p-20 text-center font-display text-2xl">Contact Page Coming Soon</div>} />
        <Route path="/next-steps" component={() => <div className="p-20 text-center font-display text-2xl">Next Steps Page Coming Soon</div>} />
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
