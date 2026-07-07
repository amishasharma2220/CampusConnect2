import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi, Event } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    eventsApi.getBySlug(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 space-y-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Event not found</h1>
        <Button variant="hero" asChild><Link to="/events">Browse Events</Link></Button>
      </div>
    </div>
  );

  const spotsLeft = Math.max(event.max_capacity - event.registration_count, 0);
  const fillPercent = Math.min(Math.round((event.registration_count / event.max_capacity) * 100), 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className={`pt-16 bg-gradient-to-r ${event.color || "from-primary to-accent"} py-16`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <Badge className="mb-3 bg-primary-foreground/20 text-primary-foreground border-0">{event.category}</Badge>
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-2">{event.title}</h1>
          {event.tagline && <p className="text-primary-foreground/80 text-lg italic">{event.tagline}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-lg font-bold">Event Details</h3>
              {event.display_date && <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="w-5 h-5 text-primary" />{event.display_date}</div>}
              {event.time && <div className="flex items-center gap-3 text-muted-foreground"><Clock className="w-5 h-5 text-primary" />{event.time}</div>}
              {event.venue && <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="w-5 h-5 text-primary" />{event.venue}</div>}
              <div className="flex items-center gap-3 text-muted-foreground"><Users className="w-5 h-5 text-primary" />{event.registration_count} registered</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-3">Registration Status</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold">{fillPercent}% filled</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
                <motion.div className={`h-full rounded-full bg-gradient-to-r ${event.color || "from-primary to-accent"}`}
                  initial={{ width: 0 }} animate={{ width: `${fillPercent}%` }} transition={{ duration: 1 }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {spotsLeft === 0 ? "Event is full" : `${spotsLeft} spots remaining`}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            {event.description && (
              <div className="bg-card border border-border rounded-2xl p-8 mb-6">
                <h2 className="font-display text-xl font-bold mb-4">About this Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            )}

            {event.is_registered ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">You're Registered!</h2>
                <p className="text-muted-foreground">You've already registered for this event.</p>
              </div>
            ) : event.status !== "completed" && spotsLeft > 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <h2 className="font-display text-2xl font-bold mb-4">Ready to join?</h2>
                <Button variant="hero" size="lg" className="rounded-xl" asChild>
                  <Link to={`/event-register/${event.slug}`}>Register for this Event</Link>
                </Button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <p className="text-muted-foreground text-lg">
                  {event.status === "completed" ? "This event has ended." : "Registration is closed."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;