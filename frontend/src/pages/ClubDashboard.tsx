import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle2, Clock, AlertTriangle, Mail, GraduationCap, Trophy, FileCheck, UserPlus, Ticket, BarChart3, PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { clubAdminApi, ClubAdminProfile, ClubStats, ClubAdminEvent } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clubSidebarLinks } from "@/lib/clubSidebar";

const ClubDashboard = () => {
  const { user } = useAuth();
  const [club, setClub] = useState<ClubAdminProfile | null>(null);
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [events, setEvents] = useState<ClubAdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clubAdminApi.getMyClub(),
      clubAdminApi.getStats(),
      clubAdminApi.getEvents(),
    ]).then(([c, s, e]) => {
      setClub(c);
      setStats(s);
      setEvents(e);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pending = events.filter(e => e.approval_status === "pending");
  const upcoming = events.filter(e => e.status === "upcoming");
  const shortName = club?.short_name || club?.name?.slice(0, 3).toUpperCase() || "CLB";

  if (loading) return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-8">

        {/* Club Identity Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-hero-gradient flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-display font-bold text-xl lg:text-2xl">{shortName}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">{club?.name}</h1>
              <p className="text-muted-foreground mt-1">{club?.description}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {club?.faculty && <Badge variant="outline" className="text-xs"><GraduationCap className="w-3 h-3 mr-1" />{club.faculty} · {club.department}</Badge>}
                {club?.founded_year && <Badge variant="outline" className="text-xs"><Calendar className="w-3 h-3 mr-1" />Est. {club.founded_year}</Badge>}
                <Badge variant="outline" className="text-xs"><Users className="w-3 h-3 mr-1" />{club?.members_count} members</Badge>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-sm shrink-0">
              <p className="text-muted-foreground text-xs">Admin</p>
              <p className="font-semibold text-foreground">{club?.admin_name}</p>
              <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />{club?.admin_email}
              </p>
              {club?.admin_reg_no && <p className="text-muted-foreground text-xs mt-1">Reg: {club.admin_reg_no}</p>}
            </div>
          </div>
        </motion.div>

        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Events" value={stats?.total_events || 0} icon={<Calendar className="w-6 h-6" />} description="Click to manage →" />
          <StatsCard title="Events Completed" value={stats?.completed_events || 0} icon={<Trophy className="w-6 h-6" />} description="Click to view →" />
          <StatsCard title="Approved Events" value={stats?.approved_events || 0} icon={<CheckCircle2 className="w-6 h-6" />} description="Live on platform" />
          <StatsCard title="Pending Approval" value={stats?.pending_approval || 0} icon={<Clock className="w-6 h-6" />} description="Awaiting review" />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">Total Registrations</p>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users className="w-5 h-5" /></div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stats?.total_registrations || 0}</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><UserPlus className="w-3 h-3" />Club Members</span>
                <span className="font-semibold">{stats?.member_registrations || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Ticket className="w-3 h-3" />Event Registrations</span>
                <span className="font-semibold">{stats?.event_registrations || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">Club Members</p>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users className="w-5 h-5" /></div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stats?.club_members || 0}</p>
            <Link to="/club/team" className="text-xs text-primary mt-2 block">Click to view team →</Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">Certificates Issued</p>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><FileCheck className="w-5 h-5" /></div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stats?.certificates_issued || 0}</p>
            {(stats?.certificates_pending || 0) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{stats?.certificates_pending} pending upload</p>
            )}
          </div>
        </div>

        {/* Pending alert */}
        {pending.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-semibold text-yellow-800">Events Pending Approval</h3>
              <p className="text-sm text-yellow-700 mt-1">{pending.length} event(s) waiting for admin approval.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {pending.map(e => <Badge key={e.id} className="bg-yellow-100 text-yellow-800 border-yellow-300 border text-xs">{e.title}</Badge>)}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground">Your Upcoming Events</h2>
            <Button variant="hero" size="sm" className="rounded-xl" asChild>
              <Link to="/club/create-event"><PlusCircle className="w-4 h-4 mr-1" />Create Event</Link>
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming events. Create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {upcoming.map(event => (
                <div key={event.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                  <div className={`h-1.5 bg-gradient-to-r ${event.color || "from-primary to-accent"}`} />
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                    <h3 className="font-display font-bold text-foreground line-clamp-1">{event.title}</h3>
                    {event.display_date && <p className="text-sm text-muted-foreground mt-1">📅 {event.display_date}</p>}
                    {event.venue && <p className="text-sm text-muted-foreground">📍 {event.venue}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{event.registration_count}/{event.max_capacity} registered</p>
                    <Badge className={`mt-2 text-xs ${event.approval_status === "approved" ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"} border`}>
                      {event.approval_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubDashboard;