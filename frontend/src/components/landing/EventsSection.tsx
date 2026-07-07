import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { eventsApi, Event } from "@/lib/api";

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    eventsApi.getAll({ status: "upcoming" })
      .then((data) => setEvents(data.slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);

  return (
    <section className="py-24 bg-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">
              Upcoming <span className="text-gradient">Events</span>
            </h2>
            <p className="text-muted-foreground">What's happening on campus this month</p>
          </div>
          <Button variant="heroOutline" asChild>
            <Link to="/events">View All <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${event.color || "from-primary to-accent"}`} />
              <div className="p-6">
                <Badge variant="secondary" className="mb-3">{event.category}</Badge>
                <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.tagline}</p>
                <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                  {event.display_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />{event.display_date}
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />{event.venue}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />{event.registration_count} registered
                  </div>
                </div>
                <Button variant="hero" size="sm" className="w-full rounded-xl" asChild>
                  <Link to={`/events/${event.slug}`}>Register Now</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;