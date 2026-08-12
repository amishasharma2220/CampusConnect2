import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, Users, Calendar, ClipboardList,
  CheckCircle, XCircle, Clock, Search, Filter,
  BarChart3, BookOpen, Trophy, UserCheck, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi, adminApi, AdminStats, AdminEvent, AdminStudent, AdminClub, Proposal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "overview" | "approvals" | "events" | "clubs" | "students";

const FACULTIES = ["All", "FoSTA", "FoMCA", "FoL", "FoHS", "DSW"];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      eventsApi.getProposals(),
    ]).then(([s, p]) => {
      setStats(s);
      setProposals(p);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "events" && events.length === 0) {
      adminApi.getEvents().then(setEvents).catch(() => {});
    }
    if (tab === "students" && students.length === 0) {
      adminApi.getStudents().then(setStudents).catch(() => {});
    }
    if (tab === "clubs" && clubs.length === 0) {
      adminApi.getClubs().then(setClubs).catch(() => {});
    }
  }, [tab]);

  const handleReview = async (proposalId: string, status: "approved" | "rejected") => {
    setActionLoading(proposalId + status);
    try {
      await eventsApi.reviewProposal(proposalId, { status, admin_notes: adminNotes[proposalId] });
      setProposals(prev => prev.filter(p => p.proposal_id !== proposalId));
      setStats(prev => prev ? { ...prev, pending_proposals: Math.max(0, prev.pending_proposals - 1) } : prev);
      toast({ title: status === "approved" ? "Event approved!" : "Event rejected", description: status === "approved" ? "Now live for students." : "Club admin will be notified." });
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const pending = proposals.filter(p => p.status === "pending");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "approvals", label: "Event Approvals", count: pending.length },
    { key: "events", label: "All Events" },
    { key: "clubs", label: "All Clubs" },
    { key: "students", label: "Students" },
  ];

  const filteredEvents = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || (e.organizer_club || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredClubs = clubs.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.department.toLowerCase().includes(search.toLowerCase());
    const matchFaculty = facultyFilter === "All" || c.faculty === facultyFilter;
    return matchSearch && matchFaculty;
  });

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.registration_number || "").includes(search)
  );

  const maxCatCount = Math.max(...(stats?.events_by_category.map(c => c.count) || [1]));
  const maxFacCount = Math.max(...(stats?.clubs_by_faculty.map(f => f.count) || [1]));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-secondary-foreground/60 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-secondary-foreground">University Administration</h1>
              <p className="text-secondary-foreground/60 text-sm">Manage events, clubs, students, and campus activities</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary-foreground/10 text-secondary-foreground/70 hover:bg-secondary-foreground/20"
                }`}>
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <>
            {/* Stats grid */}
            {loading ? (
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Active Clubs", value: stats?.total_clubs || 0, icon: <Users className="w-5 h-5" />, color: "text-primary" },
                  { label: "Faculties", value: stats?.faculties || 0, icon: <BookOpen className="w-5 h-5" />, color: "text-accent" },
                  { label: "Departments", value: stats?.departments || 0, icon: <Layers className="w-5 h-5" />, color: "text-blue-500" },
                  { label: "Pending Events", value: stats?.pending_proposals || 0, icon: <Clock className="w-5 h-5" />, color: "text-amber-500" },
                  { label: "Total Students", value: stats?.total_students || 0, icon: <UserCheck className="w-5 h-5" />, color: "text-violet-500" },
                  { label: "Total Events", value: stats?.total_events || 0, icon: <Calendar className="w-5 h-5" />, color: "text-emerald-500" },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color} shrink-0`}>{s.icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Events by Category
                </h3>
                {loading ? <Skeleton className="h-32" /> : (
                  <div className="space-y-3">
                    {stats?.events_by_category.map(c => (
                      <div key={c.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{c.category}</span>
                          <span className="text-muted-foreground">{c.count} events</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <motion.div className="h-full rounded-full bg-hero-gradient"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((c.count / maxCatCount) * 100)}%` }}
                            transition={{ duration: 0.8 }} />
                        </div>
                      </div>
                    ))}
                    {!stats?.events_by_category.length && <p className="text-muted-foreground text-sm">No events yet.</p>}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Faculty Distribution
                </h3>
                {loading ? <Skeleton className="h-32" /> : (
                  <div className="space-y-3">
                    {stats?.clubs_by_faculty.map(f => (
                      <div key={f.faculty}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{f.faculty}</span>
                          <span className="text-muted-foreground">{f.count} clubs</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((f.count / maxFacCount) * 100)}%` }}
                            transition={{ duration: 0.8 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Browse All Clubs", desc: `${stats?.total_clubs || 82} active clubs`, icon: <Users className="w-5 h-5" />, action: () => setTab("clubs") },
                { label: "All Events", desc: "View and manage events", icon: <Calendar className="w-5 h-5" />, action: () => setTab("events") },
                { label: "Event Approvals", desc: `${pending.length} pending`, icon: <ClipboardList className="w-5 h-5" />, action: () => setTab("approvals") },
                { label: "Students", desc: `${stats?.total_students || 0} registered`, icon: <UserCheck className="w-5 h-5" />, action: () => setTab("students") },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-card transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">{item.icon}</div>
                  <p className="font-display font-bold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── EVENT APPROVALS ──────────────────────────────────────── */}
        {tab === "approvals" && (
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Pending Event Proposals
              {pending.length > 0 && <Badge className="bg-amber-100 text-amber-700 border border-amber-200">{pending.length} pending</Badge>}
            </h2>
            {pending.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending event proposals.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(proposal => (
                  <motion.div key={proposal.proposal_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg text-foreground">{proposal.event_title}</h3>
                          <Badge variant="secondary">{proposal.category}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {proposal.event_date && <span>📅 {proposal.event_date}</span>}
                          {proposal.venue && <span>📍 {proposal.venue}</span>}
                          <span>👤 {proposal.submitted_by}</span>
                          <span>🕐 {new Date(proposal.submitted_at).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">Pending Review</Badge>
                    </div>
                    <textarea
                      placeholder="Add notes for the club admin (optional)..."
                      value={adminNotes[proposal.proposal_id] || ""}
                      onChange={e => setAdminNotes(prev => ({ ...prev, [proposal.proposal_id]: e.target.value }))}
                      className="w-full mt-4 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none min-h-[60px]"
                    />
                    <div className="flex gap-3 mt-4">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        disabled={actionLoading === proposal.proposal_id + "approved"}
                        onClick={() => handleReview(proposal.proposal_id, "approved")}>
                        {actionLoading === proposal.proposal_id + "approved" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : <><CheckCircle className="w-4 h-4 mr-1" />Approve Event</>}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={actionLoading === proposal.proposal_id + "rejected"}
                        onClick={() => handleReview(proposal.proposal_id, "rejected")}>
                        {actionLoading === proposal.proposal_id + "rejected" ? (
                          <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                        ) : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── ALL EVENTS ───────────────────────────────────────────── */}
        {tab === "events" && (
          <section>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {events.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 font-semibold text-foreground">Event</th>
                        <th className="text-left p-3 font-semibold text-foreground">Date</th>
                        <th className="text-left p-3 font-semibold text-foreground">Category</th>
                        <th className="text-left p-3 font-semibold text-foreground">Organizer</th>
                        <th className="text-left p-3 font-semibold text-foreground">Registrations</th>
                        <th className="text-left p-3 font-semibold text-foreground">Status</th>
                        <th className="text-left p-3 font-semibold text-foreground">Approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map(event => (
                        <tr key={event.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium text-foreground max-w-[200px] truncate">{event.title}</td>
                          <td className="p-3 text-muted-foreground text-xs">{event.display_date || "—"}</td>
                          <td className="p-3"><Badge variant="secondary" className="text-xs">{event.category}</Badge></td>
                          <td className="p-3 text-muted-foreground text-xs truncate max-w-[120px]">{event.organizer_club || event.created_by_name}</td>
                          <td className="p-3 text-foreground">{event.registration_count}/{event.max_capacity}</td>
                          <td className="p-3"><Badge variant="outline" className="text-xs">{event.status}</Badge></td>
                          <td className="p-3">
                            <Badge className={`text-xs ${
                              event.approval_status === "approved" ? "bg-green-100 text-green-700 border-green-200" :
                              event.approval_status === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
                              "bg-amber-100 text-amber-700 border-amber-200"
                            } border`}>{event.approval_status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-border text-xs text-muted-foreground">
                  Showing {filteredEvents.length} of {events.length} events
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── ALL CLUBS ────────────────────────────────────────────── */}
        {tab === "clubs" && (
          <section>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search clubs by name or department..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {FACULTIES.map(f => (
                  <button key={f} onClick={() => setFacultyFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      facultyFilter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                    }`}>{f}</button>
                ))}
              </div>
            </div>

            {clubs.length === 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filteredClubs.length} clubs found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredClubs.map(club => (
                    <div key={club.id} className="bg-card border border-border rounded-2xl p-4 shadow-card hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center shrink-0">
                          <span className="text-primary-foreground font-bold text-xs">
                            {club.short_name?.slice(0, 3) || club.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{club.category}</Badge>
                      </div>
                      <h3 className="font-display font-bold text-foreground text-sm leading-tight mb-1">{club.name}</h3>
                      <p className="text-xs text-muted-foreground">{club.faculty} · {club.department}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />{club.members_count}
                        </span>
                        <Badge className={`text-[10px] ${club.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"} border`}>
                          {club.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ── STUDENTS ─────────────────────────────────────────────── */}
        {tab === "students" && (
          <section>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, or reg number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
              </div>
            </div>

            {students.length === 0 ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 font-semibold text-foreground">Student</th>
                        <th className="text-left p-3 font-semibold text-foreground">Reg No</th>
                        <th className="text-left p-3 font-semibold text-foreground">Branch</th>
                        <th className="text-left p-3 font-semibold text-foreground">Year</th>
                        <th className="text-left p-3 font-semibold text-foreground">Events</th>
                        <th className="text-left p-3 font-semibold text-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-hero-gradient flex items-center justify-center shrink-0">
                                <span className="text-primary-foreground font-bold text-[10px]">
                                  {s.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{s.full_name}</p>
                                <p className="text-xs text-muted-foreground">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-xs">{s.registration_number || "—"}</td>
                          <td className="p-3 text-muted-foreground text-xs">{s.branch || "—"}</td>
                          <td className="p-3 text-muted-foreground text-xs">{s.year_of_study || "—"}</td>
                          <td className="p-3">
                            <Badge variant={s.events_registered > 0 ? "default" : "outline"} className="text-xs">{s.events_registered} events</Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{new Date(s.created_at).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 border-t border-border text-xs text-muted-foreground">
                    {filteredStudents.length} of {students.length} students
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;