import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar, CalendarCheck, Award, UserCircle, Search, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { eventsApi, Event } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Browse Events", href: "/events", icon: <Search className="w-5 h-5" /> },
  { label: "My Events", href: "/student/my-events", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "Certificates", href: "/student/certificates", icon: <Award className="w-5 h-5" /> },
  { label: "Leaderboard", href: "/leaderboard", icon: <Award className="w-5 h-5" /> },
  { label: "Venue Finder", href: "/venues", icon: <MapPin className="w-5 h-5" /> },
  { label: "Profile", href: "/student/profile", icon: <UserCircle className="w-5 h-5" /> },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAll()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const registered = events.filter(e => e.is_registered);
  const recommended = events.filter(e => !e.is_registered && e.status === "upcoming").slice(0, 3);
  const userName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Student" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Student" userName={user?.full_name || userName}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening on campus.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Events Registered" value={registered.length} icon={<Calendar className="w-5 h-5" />} />
<StatsCard title="Total Events" value={events.length} icon={<Search className="w-5 h-5" />} description="Available on campus" />
          <StatsCard title="Branch" value={user?.branch || "—"} icon={<UserCircle className="w-5 h-5" />} />
          <StatsCard title="Year" value={user?.year_of_study || "—"} icon={<CalendarCheck className="w-5 h-5" />} />
        </div>

        {registered.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Your Registered Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {registered.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                  <Link to={`/events/${event.slug}`}>
                    <h3 className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{event.tagline}</p>
                  {event.display_date && <p className="text-sm text-muted-foreground mt-3">📅 {event.display_date}</p>}
                  {event.venue && <p className="text-sm text-muted-foreground">📍 {event.venue}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {recommended.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommended.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-5 shadow-card hover:-translate-y-1 transition-all">
                  <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                  <h3 className="font-display font-bold text-lg text-foreground line-clamp-1">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{event.tagline}</p>
                  {event.display_date && <p className="text-sm text-muted-foreground mt-3">📅 {event.display_date}</p>}
                  {event.venue && <p className="text-sm text-muted-foreground">📍 {event.venue}</p>}
                  <Button variant="hero" size="sm" className="w-full rounded-xl mt-4" asChild>
                    <Link to={`/events/${event.slug}`}>Register Now</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;