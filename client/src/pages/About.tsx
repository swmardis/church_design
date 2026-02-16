import { usePageContent, getSectionContent } from "@/hooks/use-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function About() {
  const { data: sections, isLoading } = usePageContent("about");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 space-y-12">
        <Skeleton className="h-96 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const intro = getSectionContent(sections, "intro", {
    title: "Who We Are",
    body: "We are a community of believers passionate about sharing the love of Christ.",
    imageUrl: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80"
  });

  const values = getSectionContent(sections, "values", {
    title: "What to Expect",
    body: "Join us for a time of worship, teaching, and fellowship. Come as you are!",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80"
  });

  const team = getSectionContent(sections, "team", {
    leaders: [
      { name: "Pastor John Doe", role: "Lead Pastor", imageUrl: "" },
      { name: "Jane Smith", role: "Worship Leader", imageUrl: "" }
    ]
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero / Intro */}
      <section className="relative py-24 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="font-display text-4xl md:text-6xl font-bold">{intro.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {intro.body}
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={intro.imageUrl} 
                alt="About Us" 
                className="rounded-2xl shadow-2xl w-full object-cover aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values / Expect */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="font-display text-3xl md:text-5xl font-bold">{values.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {values.body}
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={values.imageUrl} 
                alt="Worship" 
                className="rounded-2xl shadow-xl w-full object-cover aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-16">Our Leadership</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.leaders.map((leader: any, i: number) => (
              <div key={i} className="flex flex-col items-center p-6 bg-background rounded-2xl shadow-sm border border-border/50">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={leader.imageUrl} alt={leader.name} />
                  <AvatarFallback>{leader.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <h3 className="font-display text-xl font-bold">{leader.name}</h3>
                <p className="text-primary font-medium">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
