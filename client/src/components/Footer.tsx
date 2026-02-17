import { Link } from "wouter";
import { MapPin, Mail, Phone } from "lucide-react";
import { SiFacebook, SiInstagram, SiYoutube, SiVimeo, SiTiktok, SiX, SiLinkedin } from "react-icons/si";
import { usePageContent, getSectionContent } from "@/hooks/use-content";
import { useSettings } from "@/hooks/use-settings";

const SOCIAL_ICON_MAP: Record<string, any> = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  youtube: SiYoutube,
  vimeo: SiVimeo,
  tiktok: SiTiktok,
  twitter: SiX,
  linkedin: SiLinkedin,
};

function getVal(settings: any[] | undefined, key: string, fallback = "") {
  if (!settings) return fallback;
  const s = settings.find((s: any) => s.key === key);
  return s ? s.value : fallback;
}

export function Footer() {
  const { data: globalSections } = usePageContent("global");
  const { data: settings } = useSettings();
  const socialData = getSectionContent(globalSections, "social_links", { links: [] });
  const siteName = getVal(settings, "site_name", "Grace Church");

  return (
    <footer className="bg-slate-900 text-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-white">
              {siteName}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">You're Here On Purpose</p>
            {socialData.links && socialData.links.length > 0 && (
              <div className="flex gap-4 pt-2">
                {socialData.links.map((link: any, i: number) => {
                  const Icon = SOCIAL_ICON_MAP[link.platform];
                  if (!Icon) return null;
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      data-testid={`social-icon-${link.platform}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link href="/events" className="hover:text-primary-foreground transition-colors">Events</Link></li>
              <li><Link href="/next-steps" className="hover:text-primary-foreground transition-colors">Next Steps</Link></li>
              <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Service Times</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><span className="text-white font-medium block">Wednesdays</span> 6:30 PM</li>
              <li className="pt-2">Online streaming available.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>154 Lakeside Dr<br/>Canton, GA 30115</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>sarah@newlifecanton.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/leader/dashboard" className="hover:text-slate-300 transition-colors" data-testid="link-leader-portal">Leader Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
