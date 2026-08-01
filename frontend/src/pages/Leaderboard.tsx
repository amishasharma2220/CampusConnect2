import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  events: number;
  branch: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Rahul Sharma", points: 850, events: 12, branch: "CSE" },
  { rank: 2, name: "Priya Patel", points: 720, events: 10, branch: "ECE" },
  { rank: 3, name: "Arjun Singh", points: 680, events: 9, branch: "IT" },
  { rank: 4, name: "Sneha Gupta", points: 590, events: 8, branch: "CSE" },
  { rank: 5, name: "Vikram Nair", points: 540, events: 7, branch: "ME" },
  { rank: 6, name: "Ananya Joshi", points: 480, events: 7, branch: "CSE" },
  { rank: 7, name: "Karthik Menon", points: 430, events: 6, branch: "ECE" },
  { rank: 8, name: "Divya Reddy", points: 390, events: 5, branch: "MBA" },
  { rank: 9, name: "Rohit Kumar", points: 340, events: 5, branch: "CE" },
  { rank: 10, name: "Meera Shah", points: 290, events: 4, branch: "BCA" },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Rankings</span>
              <h1 className="font-display text-5xl font-bold text-secondary-foreground mt-3 mb-4">
                Campus Leaderboard
              </h1>
              <p className="text-secondary-foreground/70 text-lg">
                Top students by event participation and achievements
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            {/* Top 3 podium */}
            {!loading && (
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]].map((entry, i) => (
                  <motion.div key={entry.rank}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`bg-card border rounded-2xl p-4 text-center shadow-card ${
                      entry.rank === 1 ? "border-yellow-500/30 bg-yellow-500/5" : "border-border"
                    } ${i === 1 ? "order-2" : i === 0 ? "order-1" : "order-3"}`}>
                    <div className="flex justify-center mb-2">{rankIcon(entry.rank)}</div>
                    <div className="w-10 h-10 rounded-full bg-hero-gradient flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary-foreground font-bold text-sm">{entry.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <p className="font-display font-bold text-foreground text-sm">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.branch}</p>
                    <p className="text-primary font-bold mt-1">{entry.points} pts</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Full list */}
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
            ) : (
              <div className="space-y-3">
                {mockLeaderboard.map((entry, i) => (
                  <motion.div key={entry.rank}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`bg-card border rounded-2xl px-5 py-4 flex items-center gap-4 shadow-card ${
                      user?.full_name === entry.name ? "border-primary/30 bg-primary/5" : "border-border"
                    }`}>
                    <div className="w-8 flex justify-center shrink-0">{rankIcon(entry.rank)}</div>
                    <div className="w-9 h-9 rounded-full bg-hero-gradient flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-bold text-xs">{entry.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.branch} · {entry.events} events</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-bold text-foreground">{entry.points}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-8">
              Points are awarded for event attendance, wins, and club activity. Updated after each event.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;