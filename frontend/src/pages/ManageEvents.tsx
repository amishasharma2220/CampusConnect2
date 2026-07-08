import { useEffect, useState } from "react";
import { LayoutDashboard, PlusCircle, Settings, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { eventsApi, Event } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { label: "Dashboard", href: "/club/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Create Event", href: "/club/create-event", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Manage Events", href: "/club/manage-events", icon: <Settings className="w-5 h-5" /> },
];

const statusIcon = (approval: string) => {
  if (approval === "approved") return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (approval === "rejected") return <XCircle className="w-4 h-4 text-destructive" />;
  return <Clock className="w-4 h-4 text-yellow-500" />;
};

const statusColor = (approval: string) => {
  if (approval === "approved") return "default";
  if (approval === "rejected") return "destructive";
  return "secondary";
};

const ManageEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all events and filter by created_by on client side for now
    eventsApi.getAll()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      sidebarLinks={sidebarLinks}
      roleLabel="Club Admin"
      userName={user?.full_name || "Club Admin"}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Manage Events
            </h1>
            <p className="text-muted-foreground mt-1">Track your submitted events</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/club/create-event">
              <PlusCircle className="w-4 h-4 mr-2" /> New Event
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Settings className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first event to get started.</p>
            <Button variant="hero" asChild>
              <Link to="/club/create-event">Create Event</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-1.5 self-stretch rounded-full bg-gradient-to-b ${event.color || "from-primary to-accent"} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-foreground truncate">{event.title}</h3>
                    {statusIcon(event.approval_status)}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {event.display_date && <span>📅 {event.display_date}</span>}
                    {event.venue && <span>📍 {event.venue}</span>}
                    <span>👥 {event.registration_count} registered</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={statusColor(event.approval_status) as any}>
                    {event.approval_status}
                  </Badge>
                  <Badge variant="outline">{event.status}</Badge>
                  <Button variant="heroOutline" size="sm" className="rounded-xl" asChild>
                    <Link to={`/events/${event.slug}`}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageEvents;