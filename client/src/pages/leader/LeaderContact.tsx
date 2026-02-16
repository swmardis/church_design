import { usePageContent, useUpdateSection, getSectionContent } from "@/hooks/use-content";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function LeaderContact() {
  const { data: sections, isLoading } = usePageContent("contact");
  const updateSection = useUpdateSection();
  const { toast } = useToast();

  const info = getSectionContent(sections, "info", { address: "", email: "", phone: "", serviceTimes: "" });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold">Edit Contact Info</h1>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <ContactForm
          defaultValues={info}
          onSubmit={(data) => updateSection.mutate({ pageSlug: "contact", sectionKey: "info", content: data }, {
            onSuccess: () => toast({ title: "Saved", description: "Contact info updated." })
          })}
        />
      )}
    </div>
  );
}

function ContactForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });
  
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="serviceTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Times</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Sundays 9AM & 11AM" /></FormControl>
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
