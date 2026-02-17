import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Calendar, Image, Settings, LogOut, Home, Users, Clock, ShieldX, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { BackToTop } from "@/components/BackToTop";

export function LeaderLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return null;

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  if (user.role === "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Clock className="w-12 h-12 mx-auto text-amber-500" />
            <h2 className="text-xl font-bold">Awaiting Approval</h2>
            <p className="text-muted-foreground">
              Your account is pending approval from a church leader. You'll be able to access the dashboard once your request has been approved.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Return to Website</Link>
              </Button>
              <Button variant="ghost" onClick={() => logout()} data-testid="button-logout-pending">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role === "denied") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <ShieldX className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              Your access to the leader portal has been denied. Please contact a church leader if you believe this is a mistake.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Return to Website</Link>
              </Button>
              <Button variant="ghost" onClick={() => logout()} data-testid="button-logout-denied">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin_leader") {
    window.location.href = "/";
    return null;
  }

  const navItems = [
    { href: "/leader/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/leader/home", icon: FileText, label: "Home" },
    { href: "/leader/about", icon: FileText, label: "About" },
    { href: "/leader/next-steps", icon: FileText, label: "Next Steps" },
    { href: "/leader/contact", icon: FileText, label: "Contact" },
    { href: "/leader/events", icon: Calendar, label: "Events" },
    { href: "/leader/media", icon: Image, label: "Media" },
    { href: "/leader/users", icon: Users, label: "Users" },
    { href: "/leader/settings", icon: Settings, label: "Settings" },
  ];

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              location === item.href 
                ? "bg-primary/10 text-primary" 
                : "text-slate-600 hover-elevate"
            )} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="px-3 py-2 text-xs text-muted-foreground truncate">
          {user.firstName} {user.lastName}
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600" asChild onClick={onNavigate}>
          <Link href="/">
            <Home className="w-5 h-5" /> View Site
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b">
          <Link href="/leader/dashboard" className="font-display text-xl font-bold text-primary flex items-center gap-2">
            Leader<span className="text-foreground">Portal</span>
          </Link>
        </div>
        <SidebarNav />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/leader/dashboard" className="font-display text-lg font-bold text-primary">
            Leader<span className="text-foreground">Portal</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-6 border-b">
                <span className="font-display text-xl font-bold text-primary">Leader<span className="text-foreground">Portal</span></span>
              </div>
              <div className="flex flex-col h-[calc(100%-73px)]">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
        {children}
      </main>
      <BackToTop />
    </div>
  );
}
