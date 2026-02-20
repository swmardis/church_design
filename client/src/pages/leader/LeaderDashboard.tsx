import { useAuth } from "@/hooks/use-auth";
import { useShortcuts, useCreateShortcut, useDeleteShortcut } from "@/hooks/use-shortcuts";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, LayoutTemplate, Image as ImageIcon, Settings, Users, ArrowRight, Plus, Trash2, Link as LinkIcon, ExternalLink, Activity } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";


// No hardcoded defaults - all shortcuts come from the database

export default function LeaderDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin_leader";
  const { data: customShortcuts, isLoading } = useShortcuts();
  const createShortcut = useCreateShortcut();
  const deleteShortcut = useDeleteShortcut();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allShortcuts = customShortcuts || [];

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this shortcut?")) {
      await deleteShortcut.mutateAsync(id);
      toast({ title: "Removed", description: "Shortcut deleted successfully." });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome, {user?.firstName}</h1>
          <p className="text-muted-foreground">Manage your church website and resources.</p>
        </div>
        <div className="flex gap-3">
        {isAdmin && (
  <AddShortcutDialog 
    open={isDialogOpen} 
    onOpenChange={setIsDialogOpen}
    onSubmit={async (data: any) => {
      await createShortcut.mutateAsync(data);
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Shortcut added to dashboard." });
    }}
      />
)}
          <Button asChild variant="outline">
            <Link href="/">View Live Site <ExternalLink className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allShortcuts.map((item: any, idx) => {
          // Dynamic Icon Rendering
          const IconComponent = (LucideIcons as any)[item.icon] || LayoutTemplate;
          const isCustom = !!item.id; // If it has an ID, it's from DB

          return (
            <Link key={idx} href={item.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-border/60 hover:border-primary/50 group h-full relative">
              {isAdmin && item.id && (
                <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`p-3 rounded-xl ${item.bgColor} ${item.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                  <CardDescription className="mb-4 line-clamp-2">{item.description}</CardDescription>
                  <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform mt-auto">
                    Open <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Page Content Updated</p>
                      <p className="text-xs text-muted-foreground">Home Page • {i + 1} hours ago</p>
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

function AddShortcutDialog({ open, onOpenChange, onSubmit }: any) {
  const { register, handleSubmit, reset } = useForm();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Shortcut
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Dashboard Shortcut</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data: any) => {
          // Add default styling for new shortcuts
          onSubmit({ ...data, color: "text-gray-500", bgColor: "bg-gray-100" });
          reset();
        })} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title", { required: true })} placeholder="e.g. Volunteers" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...register("description")} placeholder="Short description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link (HREF)</Label>
              <Input {...register("href", { required: true })} placeholder="/leader/..." />
            </div>
            <div className="space-y-2">
              <Label>Icon Name</Label>
              <Select onValueChange={(val) => register("icon").onChange({ target: { value: val, name: "icon" } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="FileText">FileText</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Heart">Heart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">Add Shortcut</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
