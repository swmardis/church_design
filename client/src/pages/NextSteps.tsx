import { usePageContent, getSectionContent } from "@/hooks/use-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function NextSteps() {
  const { data: sections, isLoading } = usePageContent("next-steps");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="h-12 w-1/2 mb-12 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const steps = getSectionContent(sections, "steps", {
    list: [
      { title: "Attend a Service", description: "Join us this Sunday.", buttonText: "Plan Visit", buttonUrl: "/", imageUrl: "" },
      { title: "Join a Group", description: "Find community.", buttonText: "Find Group", buttonUrl: "/events", imageUrl: "" },
      { title: "Start Serving", description: "Make a difference.", buttonText: "Join Team", buttonUrl: "/contact", imageUrl: "" }
    ]
  });

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Your Next Steps</h1>
          <p className="text-xl text-muted-foreground">
            Everyone has a next step. We want to help you find yours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.list.map((step: any, i: number) => (
            <div key={i} className="flex flex-col h-full bg-card rounded-2xl shadow-lg overflow-hidden border border-border/50 hover:shadow-xl transition-shadow">
              <div className="h-48 bg-muted relative">
                 {step.imageUrl ? (
                   <img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                     <CheckCircle className="w-16 h-16" />
                   </div>
                 )}
              </div>
              <div className="p-8 flex-1 flex flex-col items-start">
                <h3 className="font-display text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{step.description}</p>
                <Button asChild className="w-full">
                  <Link href={step.buttonUrl}>
                    {step.buttonText} <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
