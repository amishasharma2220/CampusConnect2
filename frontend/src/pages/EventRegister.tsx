import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { eventsApi, Event } from "@/lib/api";

const EventRegister = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", year: "", branch: "" });

  useEffect(() => {
    if (!id) return;
    eventsApi.getBySlug(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, name: user.full_name || "", email: user.email || "" }));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
  const isFull = spotsLeft === 0;
  const fillPercent = Math.min(Math.round((event.registration_count / event.max_capacity) * 100), 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!form.name || !form.email) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await eventsApi.register(event.slug, {
        full_name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        year_of_study: form.year || undefined,
        branch: form.branch || undefined,
      });
      setSubmitted(true);
      toast({ title: "Registration successful!", description: `You're registered for ${event.title}` });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-background">
      <div className={`bg-gradient-to-r ${event.color || "from-primary to-accent"} py-16`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">{event.title}</h1>
          {event.tagline && <p className="text-primary-foreground/80 italic">{event.tagline}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <h3 className="font-display text-lg font-bold">Event Details</h3>
              {event.display_date && <div className="flex items-center gap-3 text-muted-foreground text-sm"><Calendar className="w-4 h-4 text-primary" />{event.display_date}</div>}
              {event.time && <div className="flex items-center gap-3 text-muted-foreground text-sm"><Clock className="w-4 h-4 text-primary" />{event.time}</div>}
              {event.venue && <div className="flex items-center gap-3 text-muted-foreground text-sm"><MapPin className="w-4 h-4 text-primary" />{event.venue}</div>}
              <div className="flex items-center gap-3 text-muted-foreground text-sm"><Users className="w-4 h-4 text-primary" />{event.registration_count} registered</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-3">Capacity</h3>
              <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
                <div className={`h-full rounded-full bg-gradient-to-r ${event.color || "from-primary to-accent"}`}
                  style={{ width: `${fillPercent}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {isFull ? "Event is full" : `${spotsLeft} spots remaining`}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
                <h2 className="font-display text-3xl font-bold mb-3">You're In!</h2>
                <p className="text-muted-foreground mb-8">Registration confirmed for <strong>{event.title}</strong></p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button variant="hero" asChild><Link to="/student/dashboard">Go to Dashboard</Link></Button>
                  <Button variant="heroOutline" asChild><Link to="/events">Explore More</Link></Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold mb-6">Register for this Event</h2>
                {!user && (
                  <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm"><Link to="/login" className="text-primary font-semibold">Sign in</Link> to auto-fill your details.</p>
                  </div>
                )}
                {isFull && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">This event is at full capacity.</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input placeholder="Your full name" value={form.name} onChange={e => update("name", e.target.value)} className="h-11 rounded-xl" required disabled={isFull} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" placeholder="your@muj.manipal.edu" value={form.email} onChange={e => update("email", e.target.value)} className="h-11 rounded-xl" required disabled={isFull} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => update("phone", e.target.value)} className="h-11 rounded-xl" disabled={isFull} />
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Study</Label>
                      <Input placeholder="2nd Year" value={form.year} onChange={e => update("year", e.target.value)} className="h-11 rounded-xl" disabled={isFull} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input placeholder="Computer Science & Engineering" value={form.branch} onChange={e => update("branch", e.target.value)} className="h-11 rounded-xl" disabled={isFull} />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={submitting || isFull}>
                    {submitting ? "Registering..." : isFull ? "Registration Closed" : "Confirm Registration"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegister;