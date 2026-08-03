import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Bell, LayoutDashboard, User, CalendarCheck, Award, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const dashboardPath =
    user?.role === "university_admin" ? "/university-admin"
    : user?.role === "club_admin" ? "/club/dashboard"
    : "/student/dashboard";

  const roleLabel =
    user?.role === "university_admin" ? "University Admin"
    : user?.role === "club_admin" ? "Club Admin"
    : "Student";

  const studentMenuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, href: "/student/dashboard" },
    { label: "My Events", icon: <CalendarCheck className="w-4 h-4" />, href: "/student/my-events" },
    { label: "Certificates", icon: <Award className="w-4 h-4" />, href: "/student/certificates" },
    { label: "Profile", icon: <User className="w-4 h-4" />, href: "/student/profile" },
  ];

  const clubAdminMenuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, href: "/club/dashboard" },
    { label: "Create Event", icon: <CalendarCheck className="w-4 h-4" />, href: "/club/create-event" },
    { label: "Manage Events", icon: <Settings className="w-4 h-4" />, href: "/club/manage-events" },
  ];

  const adminMenuItems = [
    { label: "Dashboard", icon: <Shield className="w-4 h-4" />, href: "/university-admin" },
  ];

  const menuItems =
    user?.role === "university_admin" ? adminMenuItems
    : user?.role === "club_admin" ? clubAdminMenuItems
    : studentMenuItems;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-background/80 backdrop-blur-sm"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">CC</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Campus<span className="text-gradient">Connect</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/clubs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Clubs</Link>
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Events</Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification bell */}
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                  <Bell className="w-5 h-5" />
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-hero-gradient flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-xs">{initials}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight">{user.full_name?.split(" ")[0]}</p>
                      <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-card overflow-hidden"
                      >
                        <div className="p-3 border-b border-border">
                          <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{roleLabel}</span>
                        </div>
                        <div className="p-1">
                          {menuItems.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                            >
                              {item.icon}
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="p-1 border-t border-border">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
                <Button variant="hero" size="sm" className="rounded-xl" asChild>
                  <Link to="/register">Join CampusConnect</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              <Link to="/clubs" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted">Clubs</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted">Events</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted">About</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted">Contact</Link>

              <div className="pt-2 border-t border-border">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-hero-gradient flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">{initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{roleLabel}</p>
                      </div>
                    </div>
                    {menuItems.map((item) => (
                      <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted">
                        {item.icon}{item.label}
                      </Link>
                    ))}
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full mt-1">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted">Sign In</Link>
                    <Button variant="hero" size="sm" className="rounded-xl mx-3" asChild>
                      <Link to="/register" onClick={() => setMenuOpen(false)}>Join CampusConnect</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;