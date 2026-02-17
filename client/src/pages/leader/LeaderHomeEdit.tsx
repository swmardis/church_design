import { usePageContent, useUpdateSection, getSectionContent } from "@/hooks/use-content";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "@/components/MediaPicker";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaderHomeEdit() {
  const { data: sections, isLoading } = usePageContent("home");
  const updateSection = useUpdateSection();
  const { toast } = useToast();

  const hero = getSectionContent(sections, "hero", { 
    title: "", subtitle: "", imageUrl: "", 
    primaryButtonText: "", primaryButtonUrl: "",
    secondaryButtonText: "", secondaryButtonUrl: ""
  });
  
  const schedule = getSectionContent(sections, "schedule", { 
    title: "", description: "", image: "", times: [] 
  });
  
  const featured = getSectionContent(sections, "featured", { cards: [] });
  const serviceTypes = getSectionContent(sections, "service_types", { items: [] });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl font-bold">Edit Home Page</h1>
        <Button variant="outline" onClick={() => window.open('/', '_blank')}>View Live</Button>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="services">Service Types</TabsTrigger>
          <TabsTrigger value="featured">Featured Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <HeroForm 
            defaultValues={hero} 
            onSubmit={(data) => updateSection.mutate({ pageSlug: "home", sectionKey: "hero", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Hero section updated." })
            })}
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleForm 
            defaultValues={schedule}
            onSubmit={(data) => updateSection.mutate({ pageSlug: "home", sectionKey: "schedule", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Schedule updated." })
            })}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <ServiceTypesForm
            defaultValues={serviceTypes}
            onSubmit={(data) => updateSection.mutate({ pageSlug: "home", sectionKey: "service_types", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Service types updated." })
            })}
          />
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <FeaturedForm 
            defaultValues={featured}
            onSubmit={(data) => updateSection.mutate({ pageSlug: "home", sectionKey: "featured", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Featured cards updated." })
            })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HeroForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  useEffect(() => { form.reset(defaultValues); }, [defaultValues, form]);

  return (
    <Card>
      <CardHeader><CardTitle>Hero Section</CardTitle><CardDescription>The main banner at the top of the site.</CardDescription></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="subtitle" render={({ field }) => (
              <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem><FormLabel>Background Image</FormLabel><FormControl><MediaPicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-4">
                <FormField control={form.control} name="primaryButtonText" render={({ field }) => (
                  <FormItem><FormLabel>Primary Button Text</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="primaryButtonUrl" render={({ field }) => (
                  <FormItem><FormLabel>Primary Button Link</FormLabel><FormControl><Input {...field} placeholder="/page" /></FormControl></FormItem>
                )} />
              </div>
              <div className="space-y-4">
                <FormField control={form.control} name="secondaryButtonText" render={({ field }) => (
                  <FormItem><FormLabel>Secondary Button Text</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="secondaryButtonUrl" render={({ field }) => (
                  <FormItem><FormLabel>Secondary Button Link</FormLabel><FormControl><Input {...field} placeholder="/page" /></FormControl></FormItem>
                )} />
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ScheduleForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  useEffect(() => { form.reset(defaultValues); }, [defaultValues, form]);

  const times = form.watch("times") || [];
  const addTime = () => {
    const current = form.getValues("times") || [];
    form.setValue("times", [...current, { label: "", time: "" }]);
  };
  const removeTime = (idx: number) => {
    const current = form.getValues("times") || [];
    form.setValue("times", current.filter((_, i) => i !== idx));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="image" render={({ field }) => (
              <FormItem><FormLabel>Section Image</FormLabel><FormControl><MediaPicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>
            )} />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Service Times</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addTime}><Plus className="w-4 h-4 mr-2"/> Add Time</Button>
              </div>
              {times.map((_, index) => (
                <div key={index} className="flex gap-4 items-end bg-muted/20 p-3 rounded-lg border">
                  <FormField control={form.control} name={`times.${index}.time`} render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel className="text-xs">Time</FormLabel><FormControl><Input {...field} placeholder="9:00 AM" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`times.${index}.label`} render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel className="text-xs">Label</FormLabel><FormControl><Input {...field} placeholder="Classic Service" /></FormControl></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeTime(index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ServiceTypesForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  useEffect(() => { form.reset(defaultValues); }, [defaultValues, form]);

  const items = form.watch("items") || [];
  const addItem = () => {
    const current = form.getValues("items") || [];
    form.setValue("items", [...current, { title: "", description: "", image: "" }]);
  };
  const removeItem = (idx: number) => {
    const current = form.getValues("items") || [];
    form.setValue("items", current.filter((_, i) => i !== idx));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Types</CardTitle>
        <CardDescription>Special events or service categories displayed below the schedule.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {items.map((_, index) => (
              <div key={index} className="border p-4 rounded-xl space-y-4 bg-muted/10 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeItem(index)}><Trash2 className="w-4 h-4" /></Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`items.${index}.title`} render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${index}.image`} render={({ field }) => (
                    <FormItem><FormLabel>Image</FormLabel><FormControl><MediaPicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
              </div>
            ))}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-2"/> Add Service Type</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function FeaturedForm({ defaultValues, onSubmit }: any) {
  // Simplified version reuse similar pattern
  const form = useForm({ defaultValues });
  useEffect(() => { form.reset(defaultValues); }, [defaultValues, form]);
  
  const cards = form.watch("cards") || [];
  
  return (
    <Card>
      <CardHeader><CardTitle>Featured Cards</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             {cards.map((_, index) => (
                <div key={index} className="border p-4 rounded-lg bg-muted/20 space-y-3">
                  <FormField control={form.control} name={`cards.${index}.title`} render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`cards.${index}.description`} render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                   <FormField control={form.control} name={`cards.${index}.link`} render={({ field }) => (
                    <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                </div>
             ))}
             <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
