import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Section } from "@shared/routes";
import { wpApiUrl, wpHeaders } from "@/lib/wp";

// === Content Hooks ===

export function usePageContent(pageSlug: string) {
  return useQuery({
    queryKey: [api.content.getPage.path, pageSlug],
    queryFn: async () => {
      const url = buildUrl(api.content.getPage.path, { page: pageSlug });
      const res = await fetch(wpApiUrl(url), { headers: wpHeaders() });
      if (res.status === 404) return []; // Return empty array if not found, let UI handle defaults
      if (!res.ok) throw new Error("Failed to fetch page content");
      return api.content.getPage.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pageSlug, sectionKey, content }: { pageSlug: string, sectionKey: string, content: any }) => {
      const url = buildUrl(api.content.updateSection.path, { page: pageSlug, sectionKey });
      const res = await fetch(wpApiUrl(url), {
        method: "POST",
        headers: wpHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update section");
      return api.content.updateSection.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the page content query so it refreshes
      queryClient.invalidateQueries({ queryKey: [api.content.getPage.path, variables.pageSlug] });
    },
  });
}

// Helper to get a specific section from the array of sections
export function getSectionContent(sections: Section[] | undefined, sectionKey: string, defaultContent: any = {}) {
  if (!sections) return defaultContent;
  const section = sections.find(s => s.sectionKey === sectionKey);
  return section ? section.content : defaultContent;
}
