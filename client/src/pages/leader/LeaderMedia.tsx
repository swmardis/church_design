import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/use-media";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, Copy, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export default function LeaderMedia() {
  const { data: media, isLoading } = useMedia();
  const { mutate: upload, isPending: isUploading } = useUploadMedia();
  const { mutate: deleteMedia } = useDeleteMedia();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      upload(file, {
        onSuccess: () => toast({ title: "Uploaded", description: "Image added to library" }),
        onError: () => toast({ title: "Error", description: "Upload failed", variant: "destructive" })
      });
    });
  }, [upload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const copyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "Image URL copied to clipboard" });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this image? This cannot be undone.")) {
      deleteMedia(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">Manage your images and documents.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-xl p-8 mb-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
            <p>Uploading files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="font-medium">Drag & drop images here, or click to select</p>
            <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WEBP up to 5MB</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : media?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Library is empty.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media?.map((item) => (
              <div key={item.id} className="group relative aspect-square bg-muted rounded-lg border overflow-hidden">
                <img 
                  src={item.url} 
                  alt={item.filename} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full h-8 text-xs"
                    onClick={() => copyUrl(item.id, item.url)}
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedId === item.id ? "Copied" : "Copy URL"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="w-full h-8 text-xs"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
