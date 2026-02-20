import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUploadMedia } from "@/hooks/use-media";
import {
  useResources,
  useCreateResource,
  useBulkDeleteResources,
  useDeleteResource,
  useToggleResourceFavorite,
} from "@/hooks/use-resources";
import { Star, StarOff, Trash2, Plus, Upload, ExternalLink, Loader2 } from "lucide-react";

const DEFAULT_CATEGORIES = ["Training", "Policies", "Forms", "Other"] as const;

export default function LeaderResources() {
  const { toast } = useToast();

  const { data, isLoading, error } = useResources();
  const { mutate: createResource, isPending: creating } = useCreateResource();
  const { mutate: bulkDelete, isPending: bulkDeleting } = useBulkDeleteResources();
  const { mutate: deleteOne } = useDeleteResource();
  const { mutate: toggleFav, isPending: togglingFav } = useToggleResourceFavorite();

  const { mutate: uploadMedia, isPending: uploading } = useUploadMedia();

  const items = data?.items ?? [];
  const favorites = data?.favorites ?? [];
  const canManage = !!data?.canManage;

  const categories = (data?.categories?.length ? data.categories : [...DEFAULT_CATEGORIES]) as string[];

  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "file" | "link" | "video">("");
  const [category, setCategory] = useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Add dialog state
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState<"file" | "link" | "video">("link");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<string>(categories[0] || "Training");
  const [newUrl, setNewUrl] = useState("");
  const [newMediaId, setNewMediaId] = useState<number | null>(null);
  const [newFilename, setNewFilename] = useState<string>("");
  const [newMime, setNewMime] = useState<string>("");

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    let list = items.filter((r) => {
      if (type && r.type !== type) return false;
      if (category && r.category !== category) return false;
      if (favoritesOnly && !favorites.includes(r.id)) return false;

      if (qq) {
        const hay = `${r.title} ${r.category} ${r.type} ${r.url ?? ""} ${r.filename ?? ""}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }

      return true;
    });

    // Favorites pinned to top
    list = list.sort((a, b) => {
      const af = favorites.includes(a.id) ? 1 : 0;
      const bf = favorites.includes(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return a.title.localeCompare(b.title);
    });

    return list;
  }, [items, favorites, q, type, category, favoritesOnly]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => !!selected[r.id]);

  const onToggleAllVisible = () => {
    const next = { ...selected };
    if (allVisibleSelected) {
      filtered.forEach((r) => (next[r.id] = false));
    } else {
      filtered.forEach((r) => (next[r.id] = true));
    }
    setSelected(next);
  };

  const onBulkDelete = () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} resource(s)? This cannot be undone.`)) return;

    bulkDelete(selectedIds, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Resources removed" });
        setSelected({});
      },
      onError: () => toast({ title: "Error", description: "Bulk delete failed", variant: "destructive" }),
    });
  };

  const onDeleteOne = (id: string) => {
    if (!confirm("Delete this resource?")) return;
    deleteOne(id, {
      onSuccess: () => toast({ title: "Deleted", description: "Resource removed" }),
      onError: () => toast({ title: "Error", description: "Delete failed", variant: "destructive" }),
    });
  };

  const onToggleFavorite = (id: string) => {
    toggleFav(id, {
      onError: () => toast({ title: "Error", description: "Favorite update failed", variant: "destructive" }),
    });
  };

  const resetNew = () => {
    setNewType("link");
    setNewTitle("");
    setNewCategory(categories[0] || "Training");
    setNewUrl("");
    setNewMediaId(null);
    setNewFilename("");
    setNewMime("");
  };

  const onSaveNew = () => {
    if (!newTitle.trim()) {
      toast({ title: "Missing title", description: "Title is required", variant: "destructive" });
      return;
    }

    if (newType === "file") {
      if (!newMediaId) {
        toast({ title: "Upload required", description: "Upload a file first", variant: "destructive" });
        return;
      }
    } else {
      if (!newUrl.trim()) {
        toast({ title: "Missing URL", description: "URL is required", variant: "destructive" });
        return;
      }
    }

    const payload: any = {
      title: newTitle.trim(),
      type: newType,
      category: newCategory || "Other",
    };

    if (newType === "file") {
      payload.mediaId = newMediaId;
      payload.url = newUrl || undefined;
      payload.filename = newFilename || undefined;
      payload.mime = newMime || undefined;
    } else {
      payload.url = newUrl.trim();
    }

    createResource(payload, {
      onSuccess: () => {
        toast({ title: "Saved", description: "Resource added" });
        setOpen(false);
        resetNew();
      },
      onError: () => toast({ title: "Error", description: "Create failed", variant: "destructive" }),
    });
  };

  const onUploadFile = (file: File) => {
    uploadMedia(file, {
      onSuccess: (m) => {
        setNewMediaId(m.id);
        setNewUrl(m.url);
        setNewFilename(m.filename);
        setNewMime(m.mimeType || "");
        if (!newTitle.trim()) setNewTitle(m.filename);
        toast({ title: "Uploaded", description: "File uploaded" });
      },
      onError: () => toast({ title: "Error", description: "Upload failed", variant: "destructive" }),
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
<div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
<div>
          <h1 className="font-display text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Training docs, forms, and helpful links.</p>
        </div>

        {canManage && (
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
              <Button className="bg-[#495bf2] w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add Resource</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Type</div>
                      <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="video">YouTube Video</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-1">Category</div>
                      <Select value={newCategory} onValueChange={(v) => setNewCategory(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Title</div>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Leader Onboarding" />
                  </div>

                  {newType === "file" ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Upload file</div>
                      <div className="flex items-center gap-2">
  <input
    id="resource-upload-input"
    type="file"
    className="hidden"
    onChange={(e) => {
      const f = e.target.files?.[0];
      if (f) onUploadFile(f);
    }}
  />

  <Button asChild type="button" variant="outline" disabled={uploading}>
    <label htmlFor="resource-upload-input" className="cursor-pointer flex items-center">
      {uploading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Upload className="w-4 h-4 mr-2" />
      )}
      Choose File
    </label>
  </Button>

  <span className="text-sm text-muted-foreground truncate">
    {newMediaId ? `Uploaded ✓ (${newFilename || "file"})` : "No file selected"}
  </span>
</div>

                      {newUrl && (
                        <div className="text-xs text-muted-foreground break-all">
                          {newUrl}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium mb-1">{newType === "video" ? "YouTube URL" : "Link URL"}</div>
                      <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setOpen(false); resetNew(); }}>
                      Cancel
                    </Button>
                    <Button onClick={onSaveNew} disabled={creating}>
                      {creating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
variant="destructive"
onClick={onBulkDelete}
disabled={bulkDeleting || selectedIds.length === 0}
className="w-full sm:w-auto"
>
            <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <Input
          placeholder="Search resources..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:max-w-sm"
        />

        <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
          <SelectTrigger className="md:w-52">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type || "all"} onValueChange={(v: any) => setType(v === "all" ? "" : v)}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="file">Files</SelectItem>
            <SelectItem value="link">Links</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 md:ml-auto">
          <Checkbox checked={favoritesOnly} onCheckedChange={(v: any) => setFavoritesOnly(!!v)} />
          <span className="text-sm text-muted-foreground">Favorites only</span>
        </div>
      </div>

      <div className="flex-1 bg-white border rounded-xl overflow-hidden">
        <div className="p-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive p-4">Failed to load resources.</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6">No resources found.</div>
          ) : (
            <>
              {canManage && (
                <>
                  <div className="flex items-center gap-2 px-2 pb-2">
                    <Checkbox checked={allVisibleSelected} onCheckedChange={onToggleAllVisible as any} />
                    <span className="text-sm text-muted-foreground">Select all visible</span>
                  </div>
                  <Separator />
                </>
              )}

              <div className="divide-y">
                {filtered.map((r) => {
                  const isFav = favorites.includes(r.id);
                  return (
<div key={r.id} className="p-4 flex flex-col sm:flex-row gap-3 sm:items-start">
{canManage && (
                        <Checkbox
                          className="mt-1"
                          checked={!!selected[r.id]}
                          onCheckedChange={(v: any) => setSelected((prev) => ({ ...prev, [r.id]: !!v }))}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">
                            {isFav ? "★ " : ""}{r.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{r.category}</div>
                          <div className="text-xs text-muted-foreground uppercase">{r.type}</div>
                        </div>

                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-primary underline break-all inline-flex items-center gap-1 mt-1"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {r.filename && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {r.filename}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto">
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onToggleFavorite(r.id)}
                          disabled={togglingFav}
                        >
{isFav ? <StarOff className="w-4 h-4 sm:mr-1" /> : <Star className="w-4 h-4 sm:mr-1" />}
<span className="hidden sm:inline">{isFav ? "Unfav" : "Fav"}</span>
                        </Button>

                        {canManage && (
                          <Button size="sm" variant="destructive" onClick={() => onDeleteOne(r.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
