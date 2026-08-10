import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, TrendingDown, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { clubAdminApi, BudgetData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clubSidebarLinks } from "@/lib/clubSidebar";

const CATEGORIES = ["Sponsorship","Registration Fees","Ticket Sales","Venue & Logistics","Prizes","Food & Beverages","Speaker Fees","Production","Marketing","Miscellaneous"];

const ClubBudget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ event_name: "", type: "inflow", category: "Sponsorship", amount: "", date: new Date().toISOString().split("T")[0], description: "" });

  const fetchBudget = () => {
    clubAdminApi.getBudget().then(setData).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBudget(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_name || !form.amount) {
      toast({ title: "Fill all required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await clubAdminApi.addBudgetEntry({
        event_name: form.event_name, type: form.type, category: form.category,
        amount: parseFloat(form.amount), date: form.date,
        description: form.description || undefined,
      });
      toast({ title: "Budget entry added!" });
      setShowForm(false);
      setForm({ event_name: "", type: "inflow", category: "Sponsorship", amount: "", date: new Date().toISOString().split("T")[0], description: "" });
      fetchBudget();
    } catch (err: any) {
      toast({ title: "Failed to add entry", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout sidebarLinks={clubSidebarLinks} roleLabel="Club Admin" userName={user?.full_name || "Club Admin"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Budget & Finance</h1>
          <Button variant="hero" size="sm" className="rounded-xl" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />{showForm ? "Cancel" : "Add Entry"}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-700 font-medium">Total Inflow</p>
              <p className="font-display text-2xl font-bold text-green-800">₹{(data?.total_inflow || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-red-700 font-medium">Total Outflow</p>
              <p className="font-display text-2xl font-bold text-red-800">₹{(data?.total_outflow || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className={`${(data?.net_balance || 0) >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} border rounded-xl p-4 text-center`}>
              <IndianRupee className={`w-5 h-5 ${(data?.net_balance || 0) >= 0 ? "text-blue-600" : "text-orange-600"} mx-auto mb-1`} />
              <p className={`text-xs ${(data?.net_balance || 0) >= 0 ? "text-blue-700" : "text-orange-700"} font-medium`}>Net Balance</p>
              <p className={`font-display text-2xl font-bold ${(data?.net_balance || 0) >= 0 ? "text-blue-800" : "text-orange-800"}`}>
                ₹{Math.abs(data?.net_balance || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-foreground">Add Budget Entry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input placeholder="e.g. HackMUJ 3.0" value={form.event_name} onChange={e => setForm(p => ({...p, event_name: e.target.value}))} className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="inflow">Inflow (Income)</option>
                  <option value="outflow">Outflow (Expense)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <Input type="number" placeholder="e.g. 50000" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} className="h-11 rounded-xl" required min="1" />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Optional note" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="h-11 rounded-xl" />
              </div>
            </div>
            <Button type="submit" variant="hero" className="rounded-xl" disabled={submitting}>
              {submitting ? "Adding..." : "Add Entry"}
            </Button>
          </form>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
          {!data?.entries?.length ? (
            <p className="text-center text-muted-foreground py-8">No budget entries yet. Add your first entry above.</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground px-3 py-2">
                <span>Event</span><span>Category</span><span>Type</span><span className="text-right">Amount</span><span className="text-right">Date</span>
              </div>
              {data.entries.map(entry => (
                <div key={entry.id} className="grid grid-cols-5 items-center text-sm px-3 py-2.5 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground truncate">{entry.event_name}</span>
                  <span className="text-muted-foreground text-xs">{entry.category}</span>
                  <Badge variant="outline" className={`text-xs w-fit ${entry.type === "inflow" ? "text-green-700 border-green-300 bg-green-50" : "text-red-700 border-red-300 bg-red-50"}`}>
                    {entry.type === "inflow" ? "↑ In" : "↓ Out"}
                  </Badge>
                  <span className={`text-right font-semibold ${entry.type === "inflow" ? "text-green-700" : "text-red-700"}`}>₹{entry.amount.toLocaleString("en-IN")}</span>
                  <span className="text-right text-muted-foreground text-xs">{entry.date}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ClubBudget;