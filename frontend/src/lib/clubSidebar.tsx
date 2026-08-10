import { LayoutDashboard, PlusCircle, Settings, Users, Trophy, BarChart3, Eye, IndianRupee } from "lucide-react";

export const clubSidebarLinks = [
  { label: "Dashboard", href: "/club/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Team Structure", href: "/club/team", icon: <Users className="w-5 h-5" /> },
  { label: "Completed Events", href: "/club/completed", icon: <Trophy className="w-5 h-5" /> },
  { label: "Attendance", href: "/club/attendance", icon: <Users className="w-5 h-5" /> },
  { label: "Budget & Finance", href: "/club/budget", icon: <IndianRupee className="w-5 h-5" /> },
  { label: "Create Event", href: "/club/create-event", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Manage Events", href: "/club/manage-events", icon: <Settings className="w-5 h-5" /> },
  { label: "Analytics", href: "/club/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Venue Finder", href: "/venues", icon: <Eye className="w-5 h-5" /> },
];