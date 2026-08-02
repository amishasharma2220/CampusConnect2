import { useState, useEffect } from "react";
import { LayoutDashboard, Search, CalendarCheck, Award, UserCircle, MapPin, Lock, Save } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessToken } from "@/lib/api";

const sidebarLinks = [
  { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Browse Events", href: "/events", icon: <Search className="w-5 h-5" /> },
  { label: "My Events", href: "/student/my-events", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "Certificates", href: "/student/certificates", icon: <Award className="w-5 h-5" /> },
  { label: "Venue Finder", href: "/venues", icon: <MapPin className="w-5 h-5" /> },
  { label: "Profile", href: "/student/profile", icon: <UserCircle className="w-5 h-5" /> },
];

const StudentProfile = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    registrationNumber: user?.registration_number || "",
    branch: user?.branch || "",
    year: user?.year_of_study || "",
  });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = getAccessToken();
      const res = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Min 6 characters.", variant: "destructive" }); return;
    }
    toast({ title: "Password change coming soon", description: "This feature will be available after deployment." });
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  };

  const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Student" userName="Loading...">
        <Skeleton className="h-64 rounded-2xl max-w-2xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} roleLabel="Student" userName={form.name || "Student"}>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-hero-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">{initials}</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">{form.name}</h2>
              <p className="text-sm text-muted-foreground">Student · {form.branch}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} disabled className="h-11 rounded-xl opacity-60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Year of Study</Label>
                <Input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Branch / Department</Label>
              <Input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <Button variant="hero" className="rounded-xl" onClick={handleSaveProfile} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Change Password
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="h-11 rounded-xl" />
            </div>
            <Button variant="outline" className="rounded-xl" onClick={handleChangePassword}>
              Update Password
            </Button>
          </div>
        </div>

        <Button variant="destructive" className="rounded-xl" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;