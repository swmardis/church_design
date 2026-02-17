import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { wpApiUrl, wpHeaders } from "@/lib/wp";

export function useMedia() {
  return useQuery({
    queryKey: [api.media.list.path],
    queryFn: async () => {
      const res = await fetch(wpApiUrl(api.media.list.path), { headers: wpHeaders() });
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      return api.media.list.responses[200].parse(data.map((m: any) => ({
        ...m,
        uploadedAt: m.uploadedAt ? new Date(m.uploadedAt) : null
      })));
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(wpApiUrl(api.media.upload.path), {
        headers: wpHeaders(),
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to upload media");
      const data = await res.json();
      return api.media.upload.responses[201].parse({
        ...data,
        uploadedAt: new Date(data.uploadedAt)
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.media.list.path] }),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.media.delete.path, { id });
      const res = await fetch(wpApiUrl(url), {
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete media");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.media.list.path] }),
  });
}
