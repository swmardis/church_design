import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPicker } from "@/components/MediaPicker";

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
    
    // Theme
    menu_bg_color: "#ffffff",
    menu_text_color: "#000000",
    site_bg_color: "#ffffff",
    site_text_color: "#000000",
    site_font: "DM Sans, sans-serif",
    
    // Logos
    header_logo: "",
    footer_logo: "",
  };

  if (settings) {
    Object.keys(defaultValues).forEach(key => {
      const val = getSetting(key);
      if (val) (defaultValues as any)[key] = val;
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <h1 className="font-display text-3xl font-bold">Global Settings</h1>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <SettingsForm
          defaultValues={defaultValues}
          onSubmit={(data) => {
            const formatted = Object.entries(data).map(([key, value]) => ({ key, value }));
            updateSettings.mutate(formatted, {
              onSuccess: () => toast({ title: "Saved", description: "Settings updated successfully." })
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* General Info */}
        <Card>
          <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="site_name" render={({ field }) => (
              <FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="contact_email" render={({ field }) => (
              <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Branding & Logos */}
        <Card>
          <CardHeader><CardTitle>Branding & Logos</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="header_logo" render={({ field }) => (
              <FormItem><FormLabel>Header Logo</FormLabel><FormControl><MediaPicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="footer_logo" render={({ field }) => (
              <FormItem><FormLabel>Footer Logo</FormLabel><FormControl><MediaPicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Theme Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>Enter HSL values (e.g. "222.2 47.4% 11.2%") for system colors.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="primary_color" render={({ field }) => (
              <FormItem><FormLabel>Primary Color (HSL)</FormLabel><FormControl><Input {...field} placeholder="222.2 47.4% 11.2%" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="secondary_color" render={({ field }) => (
              <FormItem><FormLabel>Secondary Color (HSL)</FormLabel><FormControl><Input {...field} placeholder="210 40% 96.1%" /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Visual Styles */}
        <Card>
          <CardHeader><CardTitle>Visual Styles</CardTitle></CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField control={form.control} name="menu_bg_color" render={({ field }) => (
                <FormItem><FormLabel>Menu Background (HSL)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="menu_text_color" render={({ field }) => (
                <FormItem><FormLabel>Menu Text Color (HSL)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="site_bg_color" render={({ field }) => (
                <FormItem><FormLabel>Site Background (HSL)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="site_text_color" render={({ field }) => (
                <FormItem><FormLabel>Site Text Color (HSL)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
             </div>

             <FormField control={form.control} name="site_font" render={({ field }) => (
               <FormItem>
                 <FormLabel>Font Family</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                   <FormControl><SelectTrigger><SelectValue placeholder="Select a font" /></SelectTrigger></FormControl>
                   <SelectContent>
                     <SelectItem value="'DM Sans', sans-serif">DM Sans (Modern)</SelectItem>
                     <SelectItem value="'Inter', sans-serif">Inter (Clean)</SelectItem>
                     <SelectItem value="'Playfair Display', serif">Playfair Display (Elegant)</SelectItem>
                     <SelectItem value="'Roboto', sans-serif">Roboto (Standard)</SelectItem>
                     <SelectItem value="'Lora', serif">Lora (Classic)</SelectItem>
                   </SelectContent>
                 </Select>
               </FormItem>
             )} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">Save All Settings</Button>
      </form>
    </Form>
  );
}
