import { Award, Download, Calendar } from "lucide-react";
import { LayoutDashboard, Search, CalendarCheck, MapPin, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi, Event } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Browse Events", href: "/events", icon: <Search className="w-5 h-5" /> },
  { label: "My Events", href: "/student/my-events", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "Certificates", href: "/student/certificates", icon: <Award className="w-5 h-5" /> },
  { label: "Venue Finder", href: "/venues", icon: <MapPin className="w-5 h-5" /> },
  { label: "Profile", href: "/student/profile", icon: <UserCircle className="w-5 h-5" /> },
];

const Certificates = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAll()
      .then(data => setEvents(data.filter(e => e.is_registered && e.status === "completed" && e.certificate_uploaded)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Student" userName={user?.full_name || "Student"}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground mt-1">Your participation and achievement certificates</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No certificates yet</h3>
            <p className="text-muted-foreground text-sm">
              Certificates are issued after events you've attended are marked complete.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="default">Certificate</Badge>
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{event.organizer_club}</p>
                {event.display_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Calendar className="w-3 h-3" />{event.display_date}
                  </div>
                )}
                <Button variant="hero" size="sm" className="w-full rounded-xl">
                  <Download className="w-4 h-4 mr-2" /> Download Certificate
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Certificates;