import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.list.path],
    queryFn: async () => {
      const res = await fetch(api.settings.list.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      // Convert object to array format expected by API
      const settingsArray = Object.entries(updates).map(([key, value]) => ({ key, value }));
      
      const res = await fetch(api.settings.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsArray),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.settings.list.path] }),
  });
}

// Helper to get value
export function getSettingValue(settings: any[] | undefined, key: string, defaultValue: any = null) {
  if (!settings) return defaultValue;
  const setting = settings.find(s => s.key === key);
  return setting ? setting.value : defaultValue;
}
