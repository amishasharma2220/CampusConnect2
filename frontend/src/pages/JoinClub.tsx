import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { clubs, faculties, categoryConfig, getClubById, DEFAULT_CLUB_FEE } from "@/data/clubsData";
import type { PaymentState } from "@/pages/Payment";

const JoinClub = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedClubId = searchParams.get("club") || "";

  const [selectedClub, setSelectedClub] = useState(preselectedClubId);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txnId, setTxnId] = useState<string | null>(null);
  

  const club = useMemo(() => getClubById(selectedClub), [selectedClub]);
  const fee = club?.fee ?? DEFAULT_CLUB_FEE;

  // Handle return from /payment
  useEffect(() => {
    const st = location.state as { paid?: boolean; txnId?: string; meta?: { clubId?: string } } | null;
    if (st?.paid) {
      setTxnId(st.txnId ?? null);
      setSubmitted(true);
      // clear state so refresh doesn't re-trigger
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) {
      toast({ title: "Select a Club", description: "Please choose a club to register for.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Kick off checkout — payment page will return with { paid: true }
    const payment: PaymentState = {
      amount: fee,
      title: `Join ${club?.name ?? "Club"}`,
      subtitle: "Freshers' membership fee (one-time)",
      returnTo: `/join-club?club=${selectedClub}`,
      meta: { clubId: selectedClub },
    };
    setTimeout(() => {
      setLoading(false);
      navigate("/payment", { state: payment });
    }, 300);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Payment Successful — You're In!</h1>
          <p className="text-muted-foreground">
            Your membership fee of <span className="font-semibold text-foreground">₹{fee}</span> for{" "}
            <span className="font-semibold text-foreground">{club?.name}</span> has been received.
            {txnId && <span className="block text-xs mt-2 font-mono">Ref: {txnId}</span>}
          </p>
          <p className="text-sm text-muted-foreground">The club coordinator will reach out within 3–5 working days.</p>
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/clubs"><Button variant="outline" className="rounded-xl">Browse More Clubs</Button></Link>
            <Link to="/"><Button className="bg-hero-gradient text-primary-foreground rounded-xl">Go Home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-8">
          <Link to="/clubs" className="inline-flex items-center gap-2 text-secondary-foreground/60 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Clubs
          </Link>
          <h1 className="font-display text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Join a Club
          </h1>
          <p className="text-secondary-foreground/60 mt-2">Register as a member of any student club at MUJ</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Selected Club Preview */}
        {club && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-center gap-4">
            <img src={club.logo} alt={club.name} className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1">
              <h3 className="font-display font-bold text-foreground">{club.name}</h3>
              <p className="text-sm text-muted-foreground">{club.faculty} · {club.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${categoryConfig[club.category]?.color}`}>{club.category}</Badge>
                {club.members && <span className="text-xs text-muted-foreground">{club.members} members</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Membership fee</p>
              <p className="font-display text-xl font-bold text-primary inline-flex items-center">
                <IndianRupee className="w-4 h-4" />{fee}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6">
          {/* Club Selection */}
          <div className="space-y-2">
            <Label>Select Club *</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub} required>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose a club to join" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {faculties.map((fac) => (
                  <div key={fac.shortName}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{fac.shortName}</div>
                    {fac.departments.map((dept) =>
                      dept.clubs.map((clubId) => {
                        const c = clubs.find((cl) => cl.id === clubId);
                        if (!c) return null;
                        return <SelectItem key={c.id} value={c.id}>{c.name} ({dept.shortName})</SelectItem>;
                      })
                    )}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" placeholder="Your full name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNo">Registration Number *</Label>
              <Input id="regNo" placeholder="e.g. 220301120045" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="name@muj.manipal.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year of Study *</Label>
              <Select required>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                  <SelectItem value="5">5th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch / Program *</Label>
              <Input id="branch" placeholder="e.g. B.Tech CSE, BBA, BA LLB" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why do you want to join this club?</Label>
            <Textarea id="reason" placeholder="Share your interest, skills, or past experience..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Relevant Skills (optional)</Label>
            <Input id="skills" placeholder="e.g. Python, Photography, Public Speaking" />
          </div>

          <Button type="submit" className="w-full bg-hero-gradient text-primary-foreground rounded-xl h-11" disabled={loading}>
            {loading ? "Redirecting…" : `Proceed to Payment · ₹${fee}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            The freshers' membership fee is charged one-time. You'll be taken to a secure checkout to complete payment.
          </p>
        </form>
      </div>
    </div>
  );
};

export default JoinClub;
