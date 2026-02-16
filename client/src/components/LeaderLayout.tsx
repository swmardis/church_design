import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Calendar, Image, Settings, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeaderLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) return null;

  // Redirect if not logged in is handled by protected route wrapper usually, 
  // but good to have a check here or return null while loading
  if (!user) {
    window.location.href = "/api/login";
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
    { href: "/leader/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b">
          <Link href="/leader/dashboard" className="font-display text-xl font-bold text-primary flex items-center gap-2">
            Grace<span className="text-foreground">Leader</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
              )}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600" asChild>
            <Link href="/">
              <Home className="w-5 h-5" /> View Site
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
