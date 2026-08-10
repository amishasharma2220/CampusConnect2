import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Crown, Shield, GraduationCap } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { clubAdminApi, ClubAdminMember } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clubSidebarLinks } from "@/lib/clubSidebar";

const roleColors: Record<string, string> = {
  "President": "bg-amber-100 text-amber-800 border-amber-300",
  "Vice President": "bg-violet-100 text-violet-800 border-violet-300",
  "General Secretary": "bg-blue-100 text-blue-800 border-blue-300",
  "Technical Head": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Creative Head": "bg-pink-100 text-pink-800 border-pink-300",
  "Marketing Head": "bg-orange-100 text-orange-800 border-orange-300",
  "Content Head": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "Event Coordinator": "bg-rose-100 text-rose-800 border-rose-300",
  "Core Member": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Executive Member": "bg-gray-100 text-gray-700 border-gray-300",
  "Member": "bg-gray-100 text-gray-600 border-gray-200",
};

const getRoleIcon = (role: string) => {
  if (role === "President") return <Crown className="w-3 h-3" />;
  if (role === "Vice President") return <Shield className="w-3 h-3" />;
  if (role === "General Secretary") return <GraduationCap className="w-3 h-3" />;
  return null;
};

const ClubTeam = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ClubAdminMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clubAdminApi.getMembers()
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const leadership = members.filter(m => ["President", "Vice President", "General Secretary"].includes(m.role));
  const heads = members.filter(m => m.role.includes("Head") || m.role === "Event Coordinator");
  const core = members.filter(m => ["Core Member", "Executive Member", "Member"].includes(m.role));

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" /> Team Structure
          </h1>
          <p className="text-muted-foreground mt-1">Full hierarchy of your club</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No team members yet</h3>
            <p className="text-muted-foreground text-sm">Members will appear here once they join through CampusConnect.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Members", value: members.length },
                { label: "Leadership", value: leadership.length },
                { label: "Department Heads", value: heads.length },
                { label: "Core & Executive", value: core.length },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {leadership.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Leadership</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {leadership.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {initials(m.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{m.full_name}</p>
                        <Badge className={`${roleColors[m.role] || "bg-muted text-muted-foreground"} border text-[10px] mt-1 inline-flex items-center gap-1`}>
                          {getRoleIcon(m.role)}{m.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{m.department} · {m.year}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {heads.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Department Heads</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {heads.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                        {initials(m.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{m.full_name}</p>
                        <Badge className={`${roleColors[m.role] || "bg-muted text-muted-foreground"} border text-[10px]`}>{m.role}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{m.department} · {m.year}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {core.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Core & Executive Members</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {core.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }}
                      className="bg-card border border-border rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-xs mx-auto mb-2">
                        {initials(m.full_name)}
                      </div>
                      <p className="font-medium text-foreground text-sm truncate">{m.full_name}</p>
                      <Badge className={`${roleColors[m.role] || "bg-muted text-muted-foreground"} border text-[10px] mt-1`}>{m.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{m.department} · {m.year}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClubTeam;