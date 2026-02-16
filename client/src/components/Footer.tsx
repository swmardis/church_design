import { Link } from "wouter";
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-white">
              Grace<span className="text-primary-foreground/80">Church</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A community of believers dedicated to loving God and loving people. Join us this Sunday!
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link href="/events" className="hover:text-primary-foreground transition-colors">Events</Link></li>
              <li><Link href="/next-steps" className="hover:text-primary-foreground transition-colors">Next Steps</Link></li>
              <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-bold text-white mb-6">Service Times</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><span className="text-white font-medium block">Sundays</span> 9:00 AM & 11:00 AM</li>
              <li><span className="text-white font-medium block">Wednesdays</span> 7:00 PM (Youth & Kids)</li>
              <li className="pt-2">Online streaming available for all Sunday services.</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>1234 Faith Avenue<br/>Springfield, ST 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hello@gracechurch.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Grace Church. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/leader/login" className="hover:text-slate-300 transition-colors">Leader Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
