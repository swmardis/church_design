import { usePageContent, getSectionContent } from "@/hooks/use-content";
import { useEvents } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useTheme } from "@/hooks/use-theme";

export default function Home() {
  useTheme(); // Apply global styles
  const { data: sections, isLoading } = usePageContent("home");
  const { data: events, isLoading: isEventsLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <div className="h-[80vh] bg-muted/20 w-full animate-pulse" />
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const hero = getSectionContent(sections, "hero", {
    title: "Welcome Home",
    subtitle: "A place to belong, believe, and become.",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop",
    primaryButtonText: "Plan Your Visit",
    primaryButtonUrl: "/next-steps",
    secondaryButtonText: "Watch Online",
    secondaryButtonUrl: "/events"
  });

  const schedule = getSectionContent(sections, "schedule", {
    title: "Join Us This Sunday",
    description: "We have something for everyone in the family. Come as you are!",
    image: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80",
    times: [
      { label: "Classic Service", time: "9:00 AM" },
      { label: "Modern Service", time: "11:00 AM" }
    ]
  });

  const featured = getSectionContent(sections, "featured", {
    cards: [
      { title: "I'm New Here", description: "First time? We'd love to meet you.", link: "/next-steps" },
      { title: "Connect Groups", description: "Find community and grow together.", link: "/events" },
      { title: "Prayer Requests", description: "How can we pray for you today?", link: "/contact" }
    ]
  });

  const serviceTypes = getSectionContent(sections, "service_types", { items: [] });

  // Get upcoming 3 events
  const upcomingEvents = events
    ?.filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={hero.imageUrl} 
            alt="Church Gathering" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="animate-in-up">
            {hero.useLogo && hero.logoImage ? (
              <div className="mb-6 flex justify-center">
                <img src={hero.logoImage} alt="Logo" className="max-h-40 md:max-h-56 lg:max-h-64 w-auto object-contain drop-shadow-lg" />
              </div>
            ) : (
              <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-lg leading-tight text-balance">
                {hero.title}
              </h1>
            )}
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed text-balance">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:scale-105 transition-all" asChild>
                <Link href={hero.primaryButtonUrl}>{hero.primaryButtonText}</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md transition-all" asChild>
                <Link href={hero.secondaryButtonUrl}>{hero.secondaryButtonText}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Cards */}
      <section className="relative -mt-24 z-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.cards.map((card: any, i: number) => (
              <Link key={i} href={card.link}>
                <div className="bg-card hover:bg-card/90 border border-border/50 shadow-xl rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer h-full flex flex-col justify-between group">
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-3 text-primary group-hover:text-primary/80 transition-colors">{card.title}</h3>
                    <p className="text-muted-foreground">{card.description}</p>
                  </div>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    Learn More <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Schedule Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-50" />
                {/* Image of service */}
                <img 
                  src={schedule.image} 
                  alt="Worship Service" 
                  className="relative rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">{schedule.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{schedule.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schedule.times?.map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{t.time}</div>
                      <div className="text-sm text-muted-foreground">{t.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button size="lg" variant="secondary" className="mt-4" asChild>
                 <Link href="/contact">Get Directions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Service Types Section (New) */}
      {serviceTypes.items && serviceTypes.items.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-left">Service Types</h2>
            <div className="space-y-16">
              {serviceTypes.items.map((item: any, i: number) => (
                <div key={i} className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
                   <div className="md:w-1/2">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="rounded-2xl shadow-lg w-full aspect-video object-cover" />
                      ) : (
                        <div className="rounded-2xl bg-muted w-full aspect-video flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                   </div>
                   <div className="md:w-1/2 space-y-4">
                      <h3 className="text-3xl font-bold font-display">{item.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Events Strip */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <section className="py-24 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display text-3xl font-bold mb-2">Upcoming Events</h2>
                <p className="text-muted-foreground">See what's happening at Grace Church.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/events">View All Events</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href="/events">
                  <div className="group cursor-pointer">
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-muted">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-primary/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                      <Calendar className="w-4 h-4" />
                      {format(event.date, "MMM d, yyyy")}
                      {event.time && <span className="text-muted-foreground">• {event.time}</span>}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
