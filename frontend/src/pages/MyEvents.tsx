import { useEffect, useState } from "react";
import { CalendarCheck, Calendar, MapPin, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Search, MapPin as MapPinIcon, UserCircle } from "lucide-react";
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
  { label: "Venue Finder", href: "/venues", icon: <MapPinIcon className="w-5 h-5" /> },
  { label: "Profile", href: "/student/profile", icon: <UserCircle className="w-5 h-5" /> },
];

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAll()
      .then(data => setEvents(data.filter(e => e.is_registered)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter(e => e.status === "upcoming");
  const completed = events.filter(e => e.status === "completed");

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Student" userName={user?.full_name || "Student"}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-muted-foreground mt-1">Events you've registered for</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground text-sm mb-6">You haven't registered for any events yet.</p>
            <Button variant="hero" asChild><Link to="/events">Browse Events</Link></Button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Upcoming ({upcoming.length})</h2>
                <div className="space-y-4">
                  {upcoming.map(event => (
                    <div key={event.id} className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-1.5 self-stretch rounded-full bg-gradient-to-b ${event.color || "from-primary to-accent"} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{event.category}</Badge>
                          <Badge variant="default">Upcoming</Badge>
                        </div>
                        <h3 className="font-display font-bold text-foreground">{event.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                          {event.display_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.display_date}</span>}
                          {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>}
                        </div>
                      </div>
                      <Button variant="heroOutline" size="sm" className="rounded-xl shrink-0" asChild>
                        <Link to={`/events/${event.slug}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Completed ({completed.length})</h2>
                <div className="space-y-4">
                  {completed.map(event => (
                    <div key={event.id} className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4 opacity-75">
                      <div className={`w-1.5 self-stretch rounded-full bg-muted shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{event.category}</Badge>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                        <h3 className="font-display font-bold text-foreground">{event.title}</h3>
                        {event.display_date && <p className="text-sm text-muted-foreground mt-1">{event.display_date}</p>}
                      </div>
                      {event.certificate_uploaded && (
                        <Button variant="heroOutline" size="sm" className="rounded-xl shrink-0" asChild>
                          <Link to="/student/certificates">Get Certificate</Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyEvents;