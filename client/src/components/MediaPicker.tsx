import { useState } from "react";
import { useMedia, useUploadMedia } from "@/hooks/use-media";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Upload, Loader2, Check } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
  value?: string;
}

export function MediaPicker({ onSelect, trigger, value }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: media, isLoading } = useMedia();
  const { mutate: upload, isPending: isUploading } = useUploadMedia();
  const [activeTab, setActiveTab] = useState("library");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      upload(acceptedFiles[0], {
        onSuccess: () => setActiveTab("library")
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="relative group cursor-pointer border-2 border-dashed border-border rounded-lg p-4 h-48 flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors">
            {value ? (
              <img src={value} alt="Selected" className="h-full w-full object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <span>Select Image</span>
              </div>
            )}
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b bg-muted/10">
            <TabsList>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="library" className="flex-1 p-0 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : media?.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No images found. Upload one to get started.
                  </div>
                ) : (
                  media?.map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "group relative aspect-square rounded-lg border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all",
                        value === item.url && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        onSelect(item.url);
                        setIsOpen(false);
                      }}
                    >
                      <img 
                        src={item.url} 
                        alt={item.filename} 
                        className="w-full h-full object-cover"
                      />
                      {value === item.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="upload" className="flex-1 p-6 m-0">
            <div 
              {...getRootProps()} 
              className={cn(
                "h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                  <p>Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">Drag & drop an image here</p>
                  <p className="text-sm mt-2">or click to browse files</p>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
