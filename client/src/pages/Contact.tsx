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

  const mapQuery = encodeURIComponent(info.address || "Church");
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-12 text-center" data-testid="text-contact-title">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6" data-testid="text-get-in-touch">Get in Touch</h2>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Location</h3>
                  <p className="text-muted-foreground" data-testid="text-address">{info.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-muted-foreground" data-testid="text-email">{info.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Phone</h3>
                  <p className="text-muted-foreground" data-testid="text-phone">{info.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Service Times</h3>
                  <p className="text-muted-foreground" data-testid="text-service-times">{info.serviceTimes}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full min-h-[400px] rounded-2xl overflow-hidden border border-border/50 shadow-lg relative" data-testid="map-container">
            <iframe
              title="Church Location Map"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
              data-testid="map-iframe"
            />
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm text-sm px-4 py-2 rounded-lg shadow-md border border-border hover:bg-background transition-colors"
              data-testid="link-open-maps"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
