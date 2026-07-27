import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">CC</span>
              </div>
              <span className="font-display font-bold text-xl text-secondary-foreground">
                CampusConnect
              </span>
            </div>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed">
              The official event management platform for Manipal University Jaipur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-secondary-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Explore Events", to: "/explore-events" },
                { label: "Clubs", to: "/clubs" },
                { label: "Calendar", to: "/calendar" },
                { label: "My Tickets", to: "/student/my-events" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-secondary-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Event Guidelines", to: "/event-guidelines" },
                { label: "Host an Event", to: "/host-event" },
                { label: "Join a Club", to: "/join-club" },
                { label: "Learn More", to: "/learn-more" },
                { label: "Help Center", to: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-secondary-foreground mb-4">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/60">
              <li>Manipal University Jaipur</li>
              <li>Dehmi Kalan, Jaipur</li>
              <li>Rajasthan 303007</li>
              <li className="pt-1">
                <a href="mailto:campusconnect@muj.manipal.edu" className="hover:text-primary transition-colors">
                  campusconnect@muj.manipal.edu
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © 2026 CampusConnect. Made for MUJ.
          </p>
          <p className="text-sm text-secondary-foreground/50 flex items-center gap-1">
            Built by MUJ Students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
