import { usePageContent, useUpdateSection, getSectionContent } from "@/hooks/use-content";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "@/components/MediaPicker";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

export default function LeaderAbout() {
  const { data: sections, isLoading } = usePageContent("about");
  const updateSection = useUpdateSection();
  const { toast } = useToast();

  const intro = getSectionContent(sections, "intro", { title: "", body: "", imageUrl: "" });
  const values = getSectionContent(sections, "values", { title: "", body: "", imageUrl: "" });
  const team = getSectionContent(sections, "team", { leaders: [] });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold">Edit About Page</h1>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <>
          <SectionForm
            title="Intro Section"
            defaultValues={intro}
            onSubmit={(data) => updateSection.mutate({ pageSlug: "about", sectionKey: "intro", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Intro section updated." })
            })}
          />
          <SectionForm
            title="What to Expect"
            defaultValues={values}
            onSubmit={(data) => updateSection.mutate({ pageSlug: "about", sectionKey: "values", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Values section updated." })
            })}
          />
          <TeamForm
            defaultValues={team}
            onSubmit={(data) => updateSection.mutate({ pageSlug: "about", sectionKey: "team", content: data }, {
              onSuccess: () => toast({ title: "Saved", description: "Team updated." })
            })}
          />
        </>
      )}
    </div>
  );
}

function SectionForm({ title, defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  
  // Update form when defaultValues load
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Text</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <MediaPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function TeamForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const leaders = form.watch("leaders") || [];

  const addLeader = () => {
    const current = form.getValues("leaders") || [];
    form.setValue("leaders", [...current, { name: "", role: "", imageUrl: "" }]);
  };

  const removeLeader = (index: number) => {
    const current = form.getValues("leaders") || [];
    form.setValue("leaders", current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leadership Team</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {leaders.map((_, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20">
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name={`leaders.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`leaders.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl><Input {...field} placeholder="Lead Pastor" /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`leaders.${index}.imageUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo</FormLabel>
                        <FormControl>
                          <MediaPicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeLeader(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={addLeader}>
                <Plus className="w-4 h-4 mr-2" /> Add Leader
              </Button>
              <Button type="submit">Save Team</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
