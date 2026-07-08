import { useEffect, useState } from "react";
import {
  LayoutDashboard, PlusCircle, Settings, Users,
  Calendar, TrendingUp, CheckCircle, Clock
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
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

const ClubDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAll()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = events.filter(e => e.approval_status === "approved");
  const pending = events.filter(e => e.approval_status === "pending");
  const totalRegistrations = events.reduce((sum, e) => sum + e.registration_count, 0);

  if (loading) return (
    <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Club Admin" userName="Loading...">
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      sidebarLinks={sidebarLinks}
      roleLabel="Club Admin"
      userName={user?.full_name || "Club Admin"}
    >
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Club Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your club's events and activities
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Events" value={events.length} icon={<Calendar className="w-5 h-5" />} />
          <StatsCard title="Approved" value={approved.length} icon={<CheckCircle className="w-5 h-5" />} description="Live on platform" />
          <StatsCard title="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} description="Awaiting review" />
          <StatsCard title="Total Registrations" value={totalRegistrations} icon={<Users className="w-5 h-5" />} />
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button variant="hero" asChild>
            <Link to="/club/create-event">
              <PlusCircle className="w-4 h-4 mr-2" /> Create Event
            </Link>
          </Button>
          <Button variant="heroOutline" asChild>
            <Link to="/club/manage-events">
              <Settings className="w-4 h-4 mr-2" /> Manage Events
            </Link>
          </Button>
        </div>

        {events.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Recent Events</h2>
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <div key={event.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-1 self-stretch rounded-full bg-gradient-to-b ${event.color || "from-primary to-accent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.display_date} · {event.registration_count} registered</p>
                  </div>
                  <Badge variant={event.approval_status === "approved" ? "default" : "secondary"}>
                    {event.approval_status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClubDashboard;