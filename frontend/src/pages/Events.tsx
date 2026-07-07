import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { eventsApi, Event } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CATEGORIES = ["All", "Tech", "Cultural", "Sports", "Academic"];

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    eventsApi.getAll()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.tagline || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Campus <span className="text-gradient">Events</span>
            </h1>
            <p className="text-muted-foreground">Discover and register for events at MUJ</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search events..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <Button key={cat} variant={category === cat ? "hero" : "heroOutline"} size="sm"
                  className="rounded-full" onClick={() => setCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:-translate-y-1 transition-all">
                  <div className={`h-2 bg-gradient-to-r ${event.color || "from-primary to-accent"}`} />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{event.category}</Badge>
                      <Badge variant={event.status === "completed" ? "outline" : "default"}>
                        {event.status}
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.tagline}</p>
                    <div className="space-y-1.5 text-sm text-muted-foreground mb-5">
                      {event.display_date && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{event.display_date}</div>}
                      {event.venue && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</div>}
                      <div className="flex items-center gap-2"><Users className="w-4 h-4" />{event.registration_count}/{event.max_capacity} registered</div>
                    </div>
                    <Button variant="hero" size="sm" className="w-full rounded-xl"
                      disabled={event.status === "completed"} asChild>
                      <Link to={`/events/${event.slug}`}>
                        {event.status === "completed" ? "Event Ended" : event.is_registered ? "View Details" : "Register Now"}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;