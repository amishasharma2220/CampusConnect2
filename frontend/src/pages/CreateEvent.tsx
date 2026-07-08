import { useState } from "react";
import {
  LayoutDashboard, PlusCircle, Settings, Calendar,
  Clock, MapPin, AlignLeft, Tag, Send, Users, FileText
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { eventsApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { label: "Dashboard", href: "/club/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Create Event", href: "/club/create-event", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Manage Events", href: "/club/manage-events", icon: <Settings className="w-5 h-5" /> },
];

const CATEGORIES = ["Tech", "Cultural", "Sports", "Academic"];

const COLORS = [
  { label: "Orange → Red", value: "from-primary to-accent" },
  { label: "Blue → Purple", value: "from-blue-500 to-purple-600" },
  { label: "Green → Teal", value: "from-green-500 to-teal-500" },
  { label: "Pink → Orange", value: "from-pink-500 to-orange-400" },
];

const CreateEvent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "Tech",
    maxCapacity: "200",
    isPaid: false,
    ticketPrice: "",
    color: "from-primary to-accent",
    organizerClub: "",
    registrationDeadline: "",
  });

  const update = (k: string, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!form.title || !form.date || !form.venue || !form.category) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Build display date from date input
      const dateObj = new Date(form.date);
      const displayDate = dateObj.toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });

      // Build ISO datetime with time
      const eventDatetime = form.time
        ? new Date(`${form.date}T${form.time}:00`).toISOString()
        : new Date(form.date).toISOString();

      const payload = {
        title: form.title.trim(),
        tagline: form.tagline.trim() || undefined,
        description: form.description.trim() || undefined,
        display_date: displayDate,
        event_date: eventDatetime,
        time: form.time
          ? new Date(`2000-01-01T${form.time}`).toLocaleTimeString("en-US", {
              hour: "numeric", minute: "2-digit", hour12: true
            })
          : undefined,
        venue: form.venue.trim(),
        category: form.category as "Tech" | "Cultural" | "Sports" | "Academic",
        max_capacity: parseInt(form.maxCapacity) || 200,
        is_paid: form.isPaid,
        ticket_price: form.isPaid && form.ticketPrice ? parseFloat(form.ticketPrice) : undefined,
        color: form.color,
        organizer_name: user.full_name || "",
        organizer_club: form.organizerClub.trim() || undefined,
        registration_deadline: form.registrationDeadline
          ? new Date(form.registrationDeadline).toISOString()
          : undefined,
      };

      const created = await eventsApi.create(payload);

      toast({
        title: "Event submitted for approval!",
        description: "A university admin will review and approve your event shortly.",
      });

      // Reset form
      setForm({
        title: "", tagline: "", description: "", date: "", time: "",
        venue: "", category: "Tech", maxCapacity: "200", isPaid: false,
        ticketPrice: "", color: "from-primary to-accent",
        organizerClub: "", registrationDeadline: "",
      });

      // Navigate to manage events
      setTimeout(() => navigate("/club/manage-events"), 1500);

    } catch (err: any) {
      toast({
        title: "Failed to create event",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarLinks={sidebarLinks}
      roleLabel="Club Admin"
      userName={user?.full_name || "Club Admin"}
    >
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Create Event
          </h1>
          <p className="text-muted-foreground mt-1">
            Submit a new event for admin approval
          </p>
        </div>

        {/* Approval notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Admin Approval Required</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All events must be approved by a university administrator before they
              go live and become visible to students.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-5">

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-primary" /> Event Title *
            </Label>
            <Input id="title" placeholder="e.g. HackMUJ 4.0"
              value={form.title} onChange={e => update("title", e.target.value)}
              required className="h-11 rounded-xl" />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Tagline
            </Label>
            <Input id="tagline" placeholder="A short catchy line about your event"
              value={form.tagline} onChange={e => update("tagline", e.target.value)}
              className="h-11 rounded-xl" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Describe your event in detail..."
              value={form.description}
              onChange={e => update("description", e.target.value)}
              className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Date *
              </Label>
              <Input id="date" type="date"
                value={form.date} onChange={e => update("date", e.target.value)}
                required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Time
              </Label>
              <Input id="time" type="time"
                value={form.time} onChange={e => update("time", e.target.value)}
                className="h-11 rounded-xl" />
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Venue *
            </Label>
            <Input id="venue" placeholder="e.g. AB-5 Auditorium, MUJ Campus"
              value={form.venue} onChange={e => update("venue", e.target.value)}
              required className="h-11 rounded-xl" />
          </div>

          {/* Category & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Category *
              </Label>
              <select id="category" value={form.category}
                onChange={e => update("category", e.target.value)} required
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCapacity" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Max Capacity *
              </Label>
              <Input id="maxCapacity" type="number" placeholder="200"
                value={form.maxCapacity} onChange={e => update("maxCapacity", e.target.value)}
                required className="h-11 rounded-xl" min="1" />
            </div>
          </div>

          {/* Organizer Club */}
          <div className="space-y-2">
            <Label htmlFor="organizerClub">Organizing Club</Label>
            <Input id="organizerClub" placeholder="e.g. ACM MUJ"
              value={form.organizerClub} onChange={e => update("organizerClub", e.target.value)}
              className="h-11 rounded-xl" />
          </div>

          {/* Registration Deadline */}
          <div className="space-y-2">
            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
            <Input id="registrationDeadline" type="date"
              value={form.registrationDeadline}
              onChange={e => update("registrationDeadline", e.target.value)}
              className="h-11 rounded-xl" />
          </div>

          {/* Paid event toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div>
              <p className="text-sm font-medium text-foreground">Paid Event</p>
              <p className="text-xs text-muted-foreground">Charge a registration fee</p>
            </div>
            <button type="button"
              onClick={() => update("isPaid", !form.isPaid)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isPaid ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isPaid ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {form.isPaid && (
            <div className="space-y-2">
              <Label htmlFor="ticketPrice">Ticket Price (₹)</Label>
              <Input id="ticketPrice" type="number" placeholder="e.g. 99"
                value={form.ticketPrice} onChange={e => update("ticketPrice", e.target.value)}
                className="h-11 rounded-xl" min="1" />
            </div>
          )}

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Event Card Color</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLORS.map(c => (
                <button key={c.value} type="button"
                  onClick={() => update("color", c.value)}
                  className={`h-10 rounded-xl bg-gradient-to-r ${c.value} flex items-center justify-center text-white text-xs font-medium border-2 transition-all ${form.color === c.value ? "border-foreground scale-105" : "border-transparent"}`}>
                  {form.color === c.value ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`h-2 rounded-full bg-gradient-to-r ${form.color}`} />

          <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit for Approval
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;