import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertEvent } from "@shared/routes";
import { wpApiUrl, wpHeaders } from "@/lib/wp";

export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(wpApiUrl(api.events.list.path), {
        headers: wpHeaders(),
        credentials: "include",
      });
            if (!res.ok) throw new Error("Failed to fetch events");
      // Note: Dates from JSON are strings, Zod handles coercion if schema uses z.coerce.date()
      // But shared schema uses timestamp(), so we might need manual parsing if not automatic
      const data = await res.json();
      return api.events.list.responses[200].parse(data.map((e: any) => ({
        ...e,
        date: e.date ? new Date(`${e.date}T00:00:00`) : null,
        createdAt: e.createdAt ? new Date(e.createdAt) : null
      })));
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: InsertEvent) => {
      const res = await fetch(wpApiUrl(api.events.create.path), {
        method: "POST",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(event),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create event");
      const data = await res.json();
      return api.events.create.responses[201].parse({
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt)
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertEvent>) => {
      const url = buildUrl(api.events.update.path, { id });
      const res = await fetch(wpApiUrl(url), {
        method: "PUT",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update event");
      const data = await res.json();
      return api.events.update.responses[200].parse({
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt)
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.events.delete.path, { id });
      const res = await fetch(wpApiUrl(url), {
        method: "DELETE",
        headers: wpHeaders(),
        credentials: "include",
      });
            if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}
