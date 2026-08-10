import { useEffect, useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { clubAdminApi, AttendanceData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clubSidebarLinks } from "@/lib/clubSidebar";

const ClubAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clubAdminApi.getAttendance()
      .then(setAttendance)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgRate = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.attendance_rate, 0) / attendance.length)
    : 0;

  return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" /> Attendance
          </h1>
          <p className="text-muted-foreground mt-1">Attendance tracking across all your events</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Events", value: attendance.length },
            { label: "Total Registered", value: attendance.reduce((s, a) => s + a.total_registered, 0) },
            { label: "Avg Attendance Rate", value: `${avgRate}%` },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No events with attendance data yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendance.map((item, i) => (
              <motion.div key={item.event_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{item.event_title}</h3>
                    <p className="text-sm text-muted-foreground">{item.display_date}</p>
                  </div>
                  <Badge variant={item.status === "completed" ? "outline" : "default"}>{item.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>{item.total_registered} registered</span>
                  <span>·</span>
                  <span>{item.total_attended} attended</span>
                  <span className="flex items-center gap-1 text-primary font-medium ml-auto">
                    <TrendingUp className="w-4 h-4" />{item.attendance_rate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-hero-gradient"
                    initial={{ width: 0 }} animate={{ width: `${item.attendance_rate}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClubAttendance;