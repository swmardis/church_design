import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDashboardShortcut } from "@shared/routes";
import { wpApiUrl, wpHeaders } from "@/lib/wp";

export function useShortcuts() {
  return useQuery({
    queryKey: [api.shortcuts.list.path],
    queryFn: async () => {
      const res = await fetch(wpApiUrl(api.shortcuts.list.path), { headers: wpHeaders(), credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch shortcuts");
      return api.shortcuts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateShortcut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDashboardShortcut) => {
      const res = await fetch(wpApiUrl(api.shortcuts.create.path), {
        method: "POST",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create shortcut");
      return api.shortcuts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shortcuts.list.path] }),
  });
}

export function useDeleteShortcut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.shortcuts.delete.path, { id });
      const res = await fetch(wpApiUrl(url), { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete shortcut");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shortcuts.list.path] }),
  });
}
