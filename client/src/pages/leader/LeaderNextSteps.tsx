import { usePageContent, useUpdateSection, getSectionContent } from "@/hooks/use-content";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "@/components/MediaPicker";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

export default function LeaderNextSteps() {
  const { data: sections, isLoading } = usePageContent("next-steps");
  const updateSection = useUpdateSection();
  const { toast } = useToast();

  const steps = getSectionContent(sections, "steps", { list: [] });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold">Edit Next Steps</h1>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <StepsForm
          defaultValues={steps}
          onSubmit={(data) => updateSection.mutate({ pageSlug: "next-steps", sectionKey: "steps", content: data }, {
            onSuccess: () => toast({ title: "Saved", description: "Next steps updated." })
          })}
        />
      )}
    </div>
  );
}

function StepsForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const list = form.watch("list") || [];

  const addStep = () => {
    const current = form.getValues("list") || [];
    form.setValue("list", [...current, { title: "", description: "", buttonText: "Learn More", buttonUrl: "", imageUrl: "" }]);
  };

  const removeStep = (index: number) => {
    const current = form.getValues("list") || [];
    form.setValue("list", current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Steps Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {list.map((_, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`list.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`list.${index}.buttonText`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`list.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`list.${index}.buttonUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button URL</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`list.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <MediaPicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={addStep}>
                <Plus className="w-4 h-4 mr-2" /> Add Step
              </Button>
              <Button type="submit">Save Steps</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
