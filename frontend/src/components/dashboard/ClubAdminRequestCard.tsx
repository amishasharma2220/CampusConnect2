import { useEffect, useMemo, useState } from "react";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { clubAdminRequestsApi, type ClubAdminRequest } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { clubs } from "@/data/clubsData";

/** Lets a student ask a university admin to make them the admin of a club. */
const ClubAdminRequestCard = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ClubAdminRequest[] | null>(null);
  const [positions, setPositions] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [clubSlug, setClubSlug] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clubAdminRequestsApi.mine().then(setRequests).catch(() => setRequests([]));
    clubAdminRequestsApi.positions().then(setPositions).catch(() => {});
  }, []);

  const sortedClubs = useMemo(() => [...clubs].sort((a, b) => a.name.localeCompare(b.name)), []);
  const latest = requests?.[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubSlug || !position) {
      toast({ title: "Pick a club and your position", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const created = await clubAdminRequestsApi.create({ club_slug: clubSlug, position, message: message || undefined });
      setRequests(prev => [created, ...(prev ?? [])]);
      setShowForm(false);
      setMessage("");
      toast({ title: "Request sent", description: "A university admin will review it." });
    } catch (err: unknown) {
      toast({ title: "Couldn't send request", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (requests === null) return null;

  const statusBox = latest && (
    <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
      <p className="font-medium text-foreground flex items-center gap-2">
        {latest.status === "pending" && <><Clock className="w-4 h-4 text-amber-500" /> Request pending review</>}
        {latest.status === "approved" && <><CheckCircle className="w-4 h-4 text-green-500" /> Approved — you're now a club admin</>}
        {latest.status === "rejected" && <><XCircle className="w-4 h-4 text-destructive" /> Request not approved</>}
      </p>
      <p className="text-muted-foreground">{latest.club_name} · {latest.position} · sent {new Date(latest.created_at).toLocaleDateString("en-IN")}</p>
      {latest.admin_notes && <p className="text-muted-foreground">Admin note: “{latest.admin_notes}”</p>}
      {latest.status === "approved" && <p className="text-muted-foreground">Log out and log back in to open your Club Dashboard.</p>}
    </div>
  );

  const canRequest = !latest || latest.status === "rejected";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Run a club?
          </h2>
          <p className="text-sm text-muted-foreground">Ask a university admin to give you club admin access so you can create events and manage your club.</p>
        </div>
        {canRequest && !showForm && (
          <Button variant="outline" className="rounded-xl shrink-0" onClick={() => setShowForm(true)}>Request access</Button>
        )}
      </div>

      {statusBox}

      {showForm && canRequest && (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="req-club">Club *</Label>
              <Select value={clubSlug} onValueChange={setClubSlug}>
                <SelectTrigger id="req-club" className="rounded-xl"><SelectValue placeholder="Choose your club" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {sortedClubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-position">Your position *</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger id="req-position" className="rounded-xl"><SelectValue placeholder="e.g. President" /></SelectTrigger>
                <SelectContent>
                  {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-message">Anything the admin should know? (optional)</Label>
            <textarea id="req-message" value={message} onChange={e => setMessage(e.target.value)} maxLength={1000}
              placeholder="e.g. I was elected President in August; faculty advisor: Dr. …"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none min-h-[70px]" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="hero" className="rounded-xl" disabled={submitting}>{submitting ? "Sending…" : "Send request"}</Button>
            <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClubAdminRequestCard;
