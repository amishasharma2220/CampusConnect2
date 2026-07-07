import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirmPassword: "",
    registration_number: "", branch: "", year_of_study: "",
  });
  const { toast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (!form.email.endsWith("@muj.manipal.edu")) {
      toast({ title: "Use your MUJ email (@muj.manipal.edu)", variant: "destructive" }); return;
    }
    setIsLoading(true);
    try {
      await register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        role: "student",
        registration_number: form.registration_number || undefined,
        branch: form.branch || undefined,
        year_of_study: form.year_of_study || undefined,
      });
      toast({ title: "Account created!", description: "Welcome to CampusConnect." });
      navigate("/student/dashboard");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">CC</span>
          </div>
          <span className="font-display font-bold text-xl">
            Campus<span className="text-gradient">Connect</span>
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-8">Join CampusConnect with your MUJ student email</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="Amisha Sharma" value={form.full_name}
                onChange={e => update("full_name", e.target.value)} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input placeholder="220301120001" value={form.registration_number}
                onChange={e => update("registration_number", e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>MUJ Email *</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="name.regno@muj.manipal.edu" value={form.email}
                onChange={e => update("email", e.target.value)} required className="pl-10 h-11 rounded-xl" />
            </div>
            <p className="text-xs text-muted-foreground">Only @muj.manipal.edu addresses accepted</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input placeholder="Computer Science & Engineering" value={form.branch}
                onChange={e => update("branch", e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Year of Study</Label>
              <Input placeholder="2nd Year" value={form.year_of_study}
                onChange={e => update("year_of_study", e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Password *</Label>
            <Input type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={e => update("password", e.target.value)} required className="h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password *</Label>
            <Input type="password" placeholder="Repeat your password" value={form.confirmPassword}
              onChange={e => update("confirmPassword", e.target.value)} required className="h-11 rounded-xl" />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:text-primary/80">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;