import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Calendar, ClipboardList,
  Shield, CheckCircle, XCircle, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi, Proposal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    eventsApi.getProposals()
      .then(setProposals)
      .catch(() => toast({ title: "Failed to load proposals", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (proposalId: string, status: "approved" | "rejected") => {
    setActionLoading(proposalId + status);
    try {
      await eventsApi.reviewProposal(proposalId, {
        status,
        admin_notes: adminNotes[proposalId] || undefined,
      });
      setProposals(prev => prev.filter(p => p.proposal_id !== proposalId));
      toast({
        title: status === "approved" ? "Event approved!" : "Event rejected",
        description: status === "approved"
          ? "The event is now live and visible to students."
          : "The club admin will be notified.",
      });
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const pending = proposals.filter(p => p.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-secondary-foreground/60 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl font-bold text-secondary-foreground">
                Admin Dashboard
              </h1>
              <p className="text-secondary-foreground/60 mt-1">
                Signed in as {user?.full_name} · University Admin
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending Approvals</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">82</p>
              <p className="text-xs text-muted-foreground">Active Clubs</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {proposals.length - pending.length}
              </p>
              <p className="text-xs text-muted-foreground">Reviewed Today</p>
            </div>
          </div>
        </div>

        {/* Pending Event Proposals */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Pending Event Proposals
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : pending.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                All caught up!
              </h3>
              <p className="text-muted-foreground">No pending event proposals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(proposal => (
                <div key={proposal.proposal_id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-lg text-foreground">
                          {proposal.event_title}
                        </h3>
                        <Badge variant="secondary">{proposal.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {proposal.event_date && (
                          <span>📅 {proposal.event_date}</span>
                        )}
                        {proposal.venue && (
                          <span>📍 {proposal.venue}</span>
                        )}
                        <span>👤 Submitted by {proposal.submitted_by}</span>
                        <span>🕐 {new Date(proposal.submitted_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">
                      Pending Review
                    </Badge>
                  </div>

                  {/* Admin notes */}
                  <div className="mt-4">
                    <textarea
                      placeholder="Add notes for the club admin (optional)..."
                      value={adminNotes[proposal.proposal_id] || ""}
                      onChange={e => setAdminNotes(prev => ({
                        ...prev,
                        [proposal.proposal_id]: e.target.value
                      }))}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none min-h-[70px]"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                      disabled={actionLoading === proposal.proposal_id + "approved"}
                      onClick={() => handleReview(proposal.proposal_id, "approved")}
                    >
                      {actionLoading === proposal.proposal_id + "approved" ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-1" /> Approve Event</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={actionLoading === proposal.proposal_id + "rejected"}
                      onClick={() => handleReview(proposal.proposal_id, "rejected")}
                    >
                      {actionLoading === proposal.proposal_id + "rejected" ? (
                        <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                      ) : (
                        <><XCircle className="w-4 h-4 mr-1" /> Reject</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/clubs" className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-foreground text-sm">View All Clubs</p>
          </Link>
          <Link to="/events" className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-foreground text-sm">All Events</p>
          </Link>
          <Link to="/event-guidelines" className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all text-center">
            <ClipboardList className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-foreground text-sm">Event Guidelines</p>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;