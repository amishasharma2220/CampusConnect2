import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, GraduationCap, Users, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Role = "student" | "club_admin" | "university_admin";

const STUDENT_EMAIL = /^[a-zA-Z0-9._%+-]+@muj\.manipal\.edu$/;
const FACULTY_EMAIL = /^[a-zA-Z0-9._%+-]+@jaipur\.manipal\.edu$/;

const validateEmailForRole = (email: string, role: Role): string | null => {
  const v = email.trim().toLowerCase();
  if (role === "student" && !STUDENT_EMAIL.test(v))
    return "Use your MUJ student email (name.regno@muj.manipal.edu).";
  if (role === "university_admin" && !FACULTY_EMAIL.test(v))
    return "Use your faculty email (firstname.lastname@jaipur.manipal.edu).";
  if (role === "club_admin" && !STUDENT_EMAIL.test(v) && !FACULTY_EMAIL.test(v))
    return "Use an official MUJ email.";
  return null;
};

const roles = [
  { key: "student" as Role, label: "Student", icon: <GraduationCap className="w-5 h-5" />, desc: "Events & clubs" },
  { key: "club_admin" as Role, label: "Club Admin", icon: <Users className="w-5 h-5" />, desc: "Manage club" },
  { key: "university_admin" as Role, label: "Univ. Admin", icon: <Shield className="w-5 h-5" />, desc: "Faculty / Dean" },
];

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmailForRole(form.email, role);
    if (err) { toast({ title: "Invalid email", description: err, variant: "destructive" }); return; }
    setIsLoading(true);
    try {
      const res = await login(form.email.trim().toLowerCase(), form.password);
      toast({ title: "Welcome back!" });
      if (res.role === "university_admin") navigate("/university-admin");
      else if (res.role === "club_admin") navigate("/club/dashboard");
      else navigate("/student/dashboard");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-secondary">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-base">CC</span>
            </div>
            <span className="font-display font-bold text-2xl text-secondary-foreground">
              Campus<span className="text-gradient">Connect</span>
            </span>
          </Link>
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25 mb-8">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-secondary-foreground/80">Manipal University Jaipur</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-secondary-foreground leading-tight mb-6">
              Welcome Back to <span className="text-gradient">Campus</span>
            </h1>
            <p className="text-secondary-foreground/60 text-lg leading-relaxed">
              Sign in with your official MUJ email to access events, certificates, and community.
            </p>
          </div>
          <p className="text-sm text-secondary-foreground/40">© 2026 CampusConnect · Made for MUJ</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Sign In</h2>
          <p className="text-muted-foreground mb-6">Select your role and enter your MUJ credentials</p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button key={r.key} type="button" onClick={() => setRole(r.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                  role === r.key ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
                }`}>
                {r.icon}
                <span className="text-xs font-semibold">{r.label}</span>
                <span className="text-[10px] opacity-70">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name.regno@muj.manipal.edu"
                  value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  required className="pl-10 h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  required className="pl-10 pr-10 h-12 rounded-xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={isLoading}>
              {isLoading ? "Signing in..." : `Sign In as ${roles.find(r => r.key === role)?.label}`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:text-primary/80">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;