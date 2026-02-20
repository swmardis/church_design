import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { wpApiUrl, wpHeaders } from "@/lib/wp";

export type ResourceItem = {
  id: string;
  title: string;
  type: "file" | "link" | "video";
  category: string;
  url?: string;
  mediaId?: number;
  filename?: string;
  mime?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useResources() {
  return useQuery({
    queryKey: [api.resources.list.path],
    queryFn: async () => {
      const res = await fetch(wpApiUrl(api.resources.list.path), {
        headers: wpHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch resources");
      const json = await res.json();
      return api.resources.list.responses[200].parse(json);
    },
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(wpApiUrl(api.resources.create.path), {
        method: "POST",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create resource");
      return api.resources.create.responses[201].parse(await res.json());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.resources.list.path] }),
  });
}

export function useUpdateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const url = buildUrl(api.resources.update.path, { id });
      const res = await fetch(wpApiUrl(url), {
        method: "PUT",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(patch),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update resource");
      return api.resources.update.responses[200].parse(await res.json());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.resources.list.path] }),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.resources.delete.path, { id });
      const res = await fetch(wpApiUrl(url), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete resource");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.resources.list.path] }),
  });
}

export function useBulkDeleteResources() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(wpApiUrl(api.resources.bulkDelete.path), {
        method: "POST",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to bulk delete resources");
      return api.resources.bulkDelete.responses[200].parse(await res.json());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.resources.list.path] }),
  });
}

export function useToggleResourceFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.resources.toggleFavorite.path, { id });
      const res = await fetch(wpApiUrl(url), {
        method: "POST",
        headers: wpHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      return api.resources.toggleFavorite.responses[200].parse(await res.json());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.resources.list.path] }),
  });
}
