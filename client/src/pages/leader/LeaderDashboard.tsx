import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, LayoutTemplate, Image as ImageIcon, Settings, Users, ArrowRight } from "lucide-react";

export default function LeaderDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { 
      title: "Pages", 
      desc: "Edit website content", 
      icon: LayoutTemplate, 
      href: "/leader/home",
      color: "text-blue-500",
      bg: "bg-blue-500/10" 
    },
    { 
      title: "Events", 
      desc: "Manage church calendar", 
      icon: Calendar, 
      href: "/leader/events",
      color: "text-purple-500",
      bg: "bg-purple-500/10" 
    },
    { 
      title: "Media", 
      desc: "Upload photos & files", 
      icon: ImageIcon, 
      href: "/leader/media",
      color: "text-green-500",
      bg: "bg-green-500/10" 
    },
    { 
      title: "Settings", 
      desc: "Theme & global configs", 
      icon: Settings, 
      href: "/leader/settings",
      color: "text-orange-500",
      bg: "bg-orange-500/10" 
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome, {user?.firstName}</h1>
          <p className="text-muted-foreground">Manage your church website and resources.</p>
        </div>
        <Button asChild>
          <Link href="/">View Live Site</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.title} href={item.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer border-border/60 hover:border-primary/50 group">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{item.desc}</CardDescription>
                <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                  Open <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Page Content Updated</p>
                      <p className="text-xs text-muted-foreground">Home Page • 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
