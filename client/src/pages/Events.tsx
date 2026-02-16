import { useEvents } from "@/hooks/use-events";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredEvents = events
    ?.filter(e => {
      const eventDate = new Date(e.date);
      const now = new Date();
      // Reset hours to compare just dates roughly
      now.setHours(0, 0, 0, 0);
      return filter === "upcoming" ? eventDate >= now : eventDate < now;
    })
    .sort((a, b) => {
      // Ascending for upcoming, Descending for past
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filter === "upcoming" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect, grow, and serve with us. There's always something happening.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            <button
              onClick={() => setFilter("upcoming")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-all",
                filter === "upcoming" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-all",
                filter === "past" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row group"
              >
                {/* Date Badge (Mobile) / Image (Desktop) */}
                <div className="md:w-2/5 relative h-48 md:h-auto bg-muted">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                      <Calendar className="w-12 h-12" />
                    </div>
                  )}
                  {/* Date Overlay */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-sm rounded-lg px-3 py-2 text-center min-w-[60px]">
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wide">
                      {format(event.date, "MMM")}
                    </div>
                    <div className="text-xl font-bold text-slate-900 leading-none mt-0.5">
                      {format(event.date, "d")}
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                    {event.isPlanningCenter && (
                      <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                        PCO Event
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-muted-foreground mb-6">
                    {event.time && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary/60" /> {event.time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary/60" /> {event.location}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 line-clamp-2 mb-6 text-sm leading-relaxed">
                    {event.description}
                  </p>

                  <Button variant="default" className="w-full sm:w-auto self-start">
                    Details & Registration
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-foreground">No events found</h3>
            <p className="text-muted-foreground mt-2">Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
