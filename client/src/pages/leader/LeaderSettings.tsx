import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function LeaderSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || "";

  const defaultValues = {
    site_name: "",
    primary_color: "",
    secondary_color: "",
    contact_email: "",
  };

  if (settings) {
    defaultValues.site_name = getSetting("site_name");
    defaultValues.primary_color = getSetting("primary_color");
    defaultValues.secondary_color = getSetting("secondary_color");
    defaultValues.contact_email = getSetting("contact_email");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold">Global Settings</h1>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <SettingsForm
          defaultValues={defaultValues}
          onSubmit={(data) => {
            const formatted = Object.entries(data).map(([key, value]) => ({ key, value }));
            updateSettings.mutate(formatted, {
              onSuccess: () => toast({ title: "Saved", description: "Settings updated." })
            });
          }}
        />
      )}
    </div>
  );
}

function SettingsForm({ defaultValues, onSubmit }: any) {
  const form = useForm({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Config</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color (HSL)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. hsl(222.2 47.4% 11.2%)" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color (HSL)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. hsl(210 40% 96.1%)" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
