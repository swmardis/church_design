import { usePageContent, getSectionContent } from "@/hooks/use-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export default function Contact() {
  const { data: sections, isLoading } = usePageContent("contact");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="h-12 w-1/3 mb-12" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const info = getSectionContent(sections, "info", {
    address: "123 Main St, Anytown, USA",
    email: "info@church.com",
    phone: "(555) 123-4567",
    serviceTimes: "Sundays at 9:00 AM & 11:00 AM"
  });

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-12 text-center">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6">Get in Touch</h2>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Location</h3>
                  <p className="text-muted-foreground">{info.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-muted-foreground">{info.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Phone</h3>
                  <p className="text-muted-foreground">{info.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Service Times</h3>
                  <p className="text-muted-foreground">{info.serviceTimes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Placeholder / Map */}
          <div className="h-full min-h-[400px] bg-muted rounded-2xl flex items-center justify-center border border-border/50">
             <div className="text-center p-8">
               <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
               <p className="text-muted-foreground">Map Integration Coming Soon</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
