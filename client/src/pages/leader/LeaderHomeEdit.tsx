import { usePageContent, useUpdateSection, getSectionContent } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { MediaPicker } from "@/components/MediaPicker";

// Types for form values
interface HomeFormValues {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
    primaryButtonText: string;
    secondaryButtonText: string;
  };
  schedule: {
    title: string;
    description: string;
  };
}

export default function LeaderHomeEdit() {
  const { data: sections, isLoading } = usePageContent("home");
  const { mutate: updateSection, isPending } = useUpdateSection();
  const { toast } = useToast();

  // Load initial data
  const defaultHero = getSectionContent(sections, "hero", {
    title: "", subtitle: "", imageUrl: "", primaryButtonText: "", secondaryButtonText: ""
  });
  const defaultSchedule = getSectionContent(sections, "schedule", {
    title: "", description: ""
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<HomeFormValues>();
  
  // Watch imageUrl for preview
  const heroImage = watch("hero.imageUrl");

  useEffect(() => {
    if (sections) {
      reset({
        hero: defaultHero,
        schedule: defaultSchedule
      });
    }
  }, [sections, reset]);

  const onSubmit = (data: HomeFormValues) => {
    // Save Hero
    updateSection({ pageSlug: "home", sectionKey: "hero", content: data.hero });
    // Save Schedule
    updateSection({ pageSlug: "home", sectionKey: "schedule", content: data.schedule }, {
      onSuccess: () => toast({ title: "Saved", description: "Home page updated successfully." }),
      onError: () => toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" })
    });
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
        <h1 className="font-display text-3xl font-bold">Edit Home Page</h1>
        <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <form className="space-y-8">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Main Headline</label>
              <Input {...register("hero.title")} placeholder="Welcome Home" />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Subtitle</label>
              <Textarea {...register("hero.subtitle")} placeholder="A place to belong..." />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Background Image</label>
              <div className="flex gap-4 items-start">
                <MediaPicker 
                  value={heroImage} 
                  onSelect={(url) => setValue("hero.imageUrl", url)} 
                />
                <div className="flex-1 text-xs text-muted-foreground pt-2">
                  Select a high-quality image for the main banner. 1920x1080 resolution recommended.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Primary Button</label>
                <Input {...register("hero.primaryButtonText")} placeholder="Plan Your Visit" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Secondary Button</label>
                <Input {...register("hero.secondaryButtonText")} placeholder="Watch Online" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input {...register("schedule.title")} placeholder="Join Us This Sunday" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea {...register("schedule.description")} placeholder="Service times info..." />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
