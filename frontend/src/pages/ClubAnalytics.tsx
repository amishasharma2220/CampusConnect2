import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Award } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { clubAdminApi, ClubStats, ClubAdminEvent } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clubSidebarLinks } from "@/lib/clubSidebar";

const ClubAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [events, setEvents] = useState<ClubAdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([clubAdminApi.getStats(), clubAdminApi.getEvents()])
      .then(([s, e]) => { setStats(s); setEvents(e); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryCount = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEvent = events.reduce((top, e) => e.registration_count > (top?.registration_count || 0) ? e : top, events[0]);

  return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" /> Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Performance insights for your club</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Events", value: stats?.total_events || 0, icon: <Calendar className="w-5 h-5" />, color: "text-primary" },
                { label: "Total Registrations", value: stats?.total_registrations || 0, icon: <Users className="w-5 h-5" />, color: "text-blue-500" },
                { label: "Approval Rate", value: `${stats?.total_events ? Math.round((stats.approved_events / stats.total_events) * 100) : 0}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-green-500" },
                { label: "Certificates Issued", value: stats?.certificates_issued || 0, icon: <Award className="w-5 h-5" />, color: "text-amber-500" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${s.color} mb-3`}>{s.icon}</div>
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h3 className="font-display font-bold text-foreground mb-4">Events by Category</h3>
                {Object.entries(categoryCount).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(categoryCount).map(([cat, count]) => {
                      const pct = Math.round((count / events.length) * 100);
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground font-medium">{cat}</span>
                            <span className="text-muted-foreground">{count} events · {pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-hero-gradient transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h3 className="font-display font-bold text-foreground mb-4">Event Performance</h3>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events yet.</p>
                ) : (
                  <div className="space-y-3">
                    {events.slice(0, 5).map(e => {
                      const fill = Math.min(Math.round((e.registration_count / e.max_capacity) * 100), 100);
                      return (
                        <div key={e.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground font-medium truncate max-w-[60%]">{e.title}</span>
                            <span className="text-muted-foreground shrink-0">{e.registration_count}/{e.max_capacity} · {fill}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${e.color || "from-primary to-accent"} transition-all duration-700`} style={{ width: `${fill}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {topEvent && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Most Popular Event</p>
                    <p className="font-semibold text-foreground">{topEvent.title}</p>
                    <p className="text-sm text-muted-foreground">{topEvent.registration_count} registrations</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClubAnalytics;