import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { clubAdminApi, CompletedEvent } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clubSidebarLinks } from "@/lib/clubSidebar";

const ClubCompletedEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CompletedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clubAdminApi.getCompletedEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalParticipants = events.reduce((s, e) => s + e.registration_count, 0);
  const certsIssued = events.filter(e => e.certificate_uploaded).length;

  return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-7 h-7 text-primary" /> Completed Events & Results
          </h1>
          <p className="text-muted-foreground mt-1">Event history with winners and certificates</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Completed Events", value: events.length },
            { label: "Total Participants", value: totalParticipants },
            { label: "Certificates Issued", value: certsIssued },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">No completed events yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {events.map((event, idx) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {event.banner_url && (
                    <img src={event.banner_url} alt={event.title} className="w-full sm:w-28 h-20 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{event.display_date} · {event.venue}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{event.registration_count} participants</Badge>
                        <Badge className={`border text-xs ${event.certificate_uploaded ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                          {event.certificate_uploaded ? "Certificates Issued" : "Certificates Pending"}
                        </Badge>
                      </div>
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>}
                  </div>
                </div>

                {event.winners.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Winners</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {event.winners.map((w, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                          <Trophy className={`w-5 h-5 shrink-0 ${w.position === "1st" ? "text-amber-500" : w.position === "2nd" ? "text-gray-400" : w.position === "3rd" ? "text-amber-700" : "text-primary"}`} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{w.position} — {w.name}</p>
                            <p className="text-xs text-muted-foreground">{w.reg_no}</p>
                            {w.team_name && <p className="text-xs text-muted-foreground">{w.team_name}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClubCompletedEvents;