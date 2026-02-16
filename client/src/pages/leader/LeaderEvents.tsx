import { useState } from "react";
import { useEvents, useCreateEvent, useDeleteEvent } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "@/components/MediaPicker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEventSchema } from "@shared/schema";

// Form schema with coercions
const formSchema = insertEventSchema.extend({
  date: z.coerce.date(),
});

export default function LeaderEvents() {
  const { data: events, isLoading } = useEvents();
  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      time: "",
      imageUrl: "",
      tags: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createEvent(values, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
        toast({ title: "Event created", description: "The event has been added to the calendar." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
      }
    });
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(id, {
        onSuccess: () => toast({ title: "Event deleted" }),
      });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Events Manager</h1>
          <p className="text-muted-foreground">Create and manage church events.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sunday Service" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10:00 AM" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Main Sanctuary" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Event details..." className="resize-none h-24" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <MediaPicker 
                          value={field.value || undefined}
                          onSelect={(url) => field.onChange(url)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Event
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No events scheduled. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y">
            {events?.map((event) => (
              <div key={event.id} className="p-6 flex items-center gap-6 hover:bg-muted/30 transition-colors group">
                <div className="w-16 h-16 rounded-lg bg-muted flex flex-col items-center justify-center border shrink-0">
                  <span className="text-xs font-bold text-red-500 uppercase">{format(event.date, "MMM")}</span>
                  <span className="text-xl font-bold">{format(event.date, "d")}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                    {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>}
                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
