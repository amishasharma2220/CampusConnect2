import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowRight, Users, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { differenceInDays, differenceInHours } from "date-fns";

const categories = ["All", "Tech", "Cultural", "Academic", "Sports"] as const;

const events = [
  {
    id: "technova",
    title: "TechNova Hackathon 2026",
    tagline: "48-hour innovation sprint",
    date: "2026-03-22",
    displayDate: "Mar 22, 2026",
    time: "9:00 AM",
    venue: "Innovation Hub, Block A",
    category: "Tech" as const,
    color: "from-primary to-accent",
    attendees: 320,
    maxCapacity: 400,
    club: "ACM Student Chapter",
  },
  {
    id: "rang",
    title: "Rang – Cultural Night",
    tagline: "A celebration of art & music",
    date: "2026-04-05",
    displayDate: "Apr 5, 2026",
    time: "6:00 PM",
    venue: "Open Air Theatre",
    category: "Cultural" as const,
    color: "from-accent to-primary",
    attendees: 1200,
    maxCapacity: 1500,
    club: "Cultural Committee",
  },
  {
    id: "mun",
    title: "MUJ Model United Nations",
    tagline: "Debate, diplomacy & leadership",
    date: "2026-04-15",
    displayDate: "Apr 15, 2026",
    time: "10:00 AM",
    venue: "Seminar Hall, Block B",
    category: "Academic" as const,
    color: "from-secondary to-foreground",
    attendees: 180,
    maxCapacity: 250,
    club: "MUN Society",
  },
  {
    id: "oneiros",
    title: "Sports Carnival – Oneiros",
    tagline: "Compete. Conquer. Celebrate.",
    date: "2026-05-02",
    displayDate: "May 2, 2026",
    time: "8:00 AM",
    venue: "University Stadium",
    category: "Sports" as const,
    color: "from-primary to-accent",
    attendees: 2500,
    maxCapacity: 3000,
    club: "Sports Council",
  },
];

function getCountdown(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();
  const days = differenceInDays(target, now);
  if (days > 0) return `${days}d left`;
  const hours = differenceInHours(target, now);
  if (hours > 0) return `${hours}h left`;
  return "Happening now";
}

const EventsSection = () => {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [, setTick] = useState(0);

  // Re-render every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter);

  return (
    <section id="events" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8"
        >
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              What's Happening
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-3">
              Upcoming Events
            </h2>
          </div>
          <Button variant="hero" size="lg" className="mt-6 sm:mt-0" asChild>
            <Link to="/explore-events">
              View All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((event, index) => {
            const fillPercent = Math.round((event.attendees / event.maxCapacity) * 100);
            const countdown = getCountdown(event.date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 shadow-card hover:shadow-warm transition-all duration-500"
              >
                <Link
                  to={`/events/${event.id}`}
                  aria-label={`View details for ${event.title}`}
                  className="absolute inset-0 z-10"
                />
                {/* Gradient accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${event.color}`} />

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${event.color} opacity-10 blur-3xl`} />
                </div>

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {event.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                        <Flame className="w-3 h-3" />
                        {countdown}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {event.attendees.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 italic">{event.tagline}</p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary/70" />
                      <span className="text-sm">{event.displayDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary/70" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                  </div>

                  {/* Registration progress */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Registration</span>
                      <span className="font-semibold text-foreground">{fillPercent}% filled</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${event.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${fillPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">By {event.club}</p>
                  </div>

                  <div className="flex items-center justify-between relative z-20">
                    <Link
                      to={`/events/${event.id}`}
                      className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all"
                    >
                      Learn more <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Button variant="hero" size="sm" className="rounded-xl text-xs" asChild>
                      <Link to={`/event-register/${event.id}`}>Register Now</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No events in this category right now.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
