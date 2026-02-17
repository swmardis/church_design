import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPicker } from "@/components/MediaPicker";

function getVal(settings: any[] | undefined, key: string, fallback = "") {
  if (!settings) return fallback;
  const s = settings.find((s: any) => s.key === key);
  return s ? s.value : fallback;
}

export default function LeaderSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    site_name: "",
    contact_email: "",
    primary_color: "#1e293b",
    secondary_color: "#f1f5f9",
    menu_bg_color: "#ffffff",
    menu_text_color: "#1e293b",
    site_bg_color: "#ffffff",
    site_text_color: "#1e293b",
    font_family: "Inter",
    header_logo: "",
    footer_logo: "",
  });

  useEffect(() => {
    if (settings && !loaded) {
      setForm({
        site_name: getVal(settings, "site_name", ""),
        contact_email: getVal(settings, "contact_email", ""),
        primary_color: getVal(settings, "primary_color", "#1e293b"),
        secondary_color: getVal(settings, "secondary_color", "#f1f5f9"),
        menu_bg_color: getVal(settings, "menu_bg_color", "#ffffff"),
        menu_text_color: getVal(settings, "menu_text_color", "#1e293b"),
        site_bg_color: getVal(settings, "site_bg_color", "#ffffff"),
        site_text_color: getVal(settings, "site_text_color", "#1e293b"),
        font_family: getVal(settings, "font_family", "Inter"),
        header_logo: getVal(settings, "header_logo", ""),
        footer_logo: getVal(settings, "footer_logo", ""),
      });
      setLoaded(true);
    }
  }, [settings, loaded]);

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const formatted = Object.entries(form).map(([key, value]) => ({ key, value }));
    updateSettings.mutate(formatted, {
      onSuccess: () => {
        toast({ title: "Saved", description: "Settings updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold" data-testid="text-settings-title">Global Settings</h1>
        <Button onClick={handleSave} disabled={updateSettings.isPending} data-testid="button-save-settings">
          {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Settings
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={form.site_name}
              onChange={(e) => update("site_name", e.target.value)}
              data-testid="input-site-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              value={form.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              data-testid="input-contact-email"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Branding & Logos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Header Logo</Label>
            <MediaPicker
              value={form.header_logo}
              onSelect={(url) => update("header_logo", url)}
            />
          </div>
          <div className="space-y-2">
            <Label>Footer Logo</Label>
            <MediaPicker
              value={form.footer_logo}
              onSelect={(url) => update("footer_logo", url)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Theme Colors</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorField label="Primary Color" value={form.primary_color} onChange={(v) => update("primary_color", v)} testId="primary-color" />
            <ColorField label="Secondary Color" value={form.secondary_color} onChange={(v) => update("secondary_color", v)} testId="secondary-color" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visual Styles</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorField label="Menu Background" value={form.menu_bg_color} onChange={(v) => update("menu_bg_color", v)} testId="menu-bg-color" />
            <ColorField label="Menu Text Color" value={form.menu_text_color} onChange={(v) => update("menu_text_color", v)} testId="menu-text-color" />
            <ColorField label="Site Background" value={form.site_bg_color} onChange={(v) => update("site_bg_color", v)} testId="site-bg-color" />
            <ColorField label="Site Text Color" value={form.site_text_color} onChange={(v) => update("site_text_color", v)} testId="site-text-color" />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={form.font_family} onValueChange={(v) => update("font_family", v)}>
              <SelectTrigger data-testid="select-font-family">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter (Clean)</SelectItem>
                <SelectItem value="DM Sans">DM Sans (Modern)</SelectItem>
                <SelectItem value="Roboto">Roboto (Standard)</SelectItem>
                <SelectItem value="Lora">Lora (Classic)</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                <SelectItem value="Merriweather">Merriweather (Readable)</SelectItem>
                <SelectItem value="Open Sans">Open Sans (Friendly)</SelectItem>
                <SelectItem value="Poppins">Poppins (Geometric)</SelectItem>
                <SelectItem value="Nunito">Nunito (Rounded)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={updateSettings.isPending} data-testid="button-save-bottom">
        {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save All Settings
      </Button>
    </div>
  );
}

function ColorField({ label, value, onChange, testId }: { label: string; value: string; onChange: (v: string) => void; testId: string }) {
  const safeHex = value.startsWith("#") ? value : "#000000";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={safeHex}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-md border border-border cursor-pointer p-0.5"
            data-testid={`color-picker-${testId}`}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
          data-testid={`input-${testId}`}
        />
        <div
          className="w-10 h-10 rounded-md border border-border shrink-0"
          style={{ backgroundColor: safeHex }}
        />
      </div>
    </div>
  );
}
