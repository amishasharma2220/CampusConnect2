import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { clubAdminRequestsApi, type ClubAdminRequestForAdmin } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

interface Props {
  onCountChange?: (count: number) => void;
}

/** University admin view of pending club admin requests, with approve / reject. */
const ClubAdminRequestsPanel = ({ onCountChange }: Props) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ClubAdminRequestForAdmin[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    clubAdminRequestsApi.listForAdmin("pending")
      .then(setRequests)
      .catch((err: unknown) => {
        setRequests([]);
        toast({ title: "Couldn't load requests", description: getErrorMessage(err), variant: "destructive" });
      });
  }, [toast]);

  useEffect(() => {
    if (requests) onCountChange?.(requests.length);
  }, [requests, onCountChange]);

  const review = async (req: ClubAdminRequestForAdmin, status: "approved" | "rejected") => {
    setBusy(req.id + status);
    try {
      await clubAdminRequestsApi.review(req.id, { status, admin_notes: notes[req.id] || undefined });
      // Approving closes other pending requests for the same club on the server; mirror that here.
      setRequests(prev => (prev ?? []).filter(r => r.id !== req.id && !(status === "approved" && r.club_slug === req.club_slug)));
      toast({
        title: status === "approved" ? `${req.student_name || req.student_email} is now admin of ${req.club_name}` : "Request rejected",
        description: status === "approved" ? "They'll get the Club Dashboard after logging in again." : undefined,
      });
    } catch (err: unknown) {
      toast({ title: "Action failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" /> Club Admin Requests
        {requests && requests.length > 0 && (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200">{requests.length} pending</Badge>
        )}
      </h2>

      {requests === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">No pending requests</h3>
          <p className="text-muted-foreground">Students can request club admin access from their dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-foreground">{req.student_name || req.student_email}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>🏛 {req.club_name}</span>
                    <span>🎖 {req.position}</span>
                    <span>✉️ {req.student_email}</span>
                    {req.registration_number && <span>🆔 {req.registration_number}</span>}
                    <span>🕐 {new Date(req.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  {req.message && <p className="text-sm text-foreground pt-2">“{req.message}”</p>}
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">Pending</Badge>
              </div>
              <textarea
                placeholder="Note for the student (optional)..."
                value={notes[req.id] || ""}
                onChange={e => setNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                className="w-full mt-4 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none min-h-[60px]"
              />
              <div className="flex gap-3 mt-4">
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                  disabled={busy !== null} onClick={() => review(req, "approved")}>
                  <CheckCircle className="w-4 h-4 mr-1" />{busy === req.id + "approved" ? "Approving…" : "Approve"}
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={busy !== null} onClick={() => review(req, "rejected")}>
                  <XCircle className="w-4 h-4 mr-1" />{busy === req.id + "rejected" ? "Rejecting…" : "Reject"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ClubAdminRequestsPanel;
