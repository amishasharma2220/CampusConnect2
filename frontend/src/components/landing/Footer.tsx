import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground py-12 border-t border-border">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">CC</span>
            </div>
            <span className="font-display font-bold text-xl">
              Campus<span className="text-gradient">Connect</span>
            </span>
          </div>
          <p className="text-secondary-foreground/60 text-sm leading-relaxed max-w-sm">
            The official event management platform for Manipal University Jaipur. Connecting students, clubs, and campus life.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-secondary-foreground/50">Platform</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/events" className="hover:text-primary transition-colors">Events</Link></li>
            <li><Link to="/clubs" className="hover:text-primary transition-colors">Clubs</Link></li>
            <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            <li><Link to="/venues" className="hover:text-primary transition-colors">Venues</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-secondary-foreground/50">Info</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/event-guidelines" className="hover:text-primary transition-colors">Guidelines</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 pt-6 text-center text-sm text-secondary-foreground/40">
        © 2026 CampusConnect · Manipal University Jaipur · Built by students, for students
      </div>
    </div>
  </footer>
);

export default Footer;