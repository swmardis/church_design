import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { wpApiUrl, wpHeaders } from "@/lib/wp";

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.list.path],
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settingsArray: { key: string; value: any }[]) => {
      const res = await fetch(wpApiUrl(api.settings.update.path), {
        method: "POST",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(settingsArray),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.settings.list.path] }),
  });
}

export function getSettingValue(settings: any[] | undefined, key: string, defaultValue: any = null) {
  if (!settings) return defaultValue;
  const setting = settings.find((s: any) => s.key === key);
  return setting ? setting.value : defaultValue;
}
