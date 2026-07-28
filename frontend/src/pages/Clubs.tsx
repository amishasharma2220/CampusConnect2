import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { clubsApi, Club } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CATEGORIES = ["All", "Technical", "Cultural", "Sports", "Literary", "Social", "Professional", "Media", "Wellness"];

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    clubsApi.getAll()
      .then(setClubs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clubs.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Campus Clubs</span>
              <h1 className="font-display text-5xl font-bold text-secondary-foreground mt-3 mb-4">
                Clubs & Societies
              </h1>
              <p className="text-secondary-foreground/70 text-lg">
                {clubs.length} clubs across all faculties at Manipal University Jaipur
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search clubs by name, department..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl max-w-md" />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/30"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No clubs found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((club, i) => (
                  <motion.div key={club.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: (i % 8) * 0.04 }}
                    className="bg-card border border-border rounded-2xl p-5 shadow-card hover:-translate-y-1 transition-all hover:border-primary/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
                        <span className="text-primary-foreground font-display font-bold text-sm">
                          {club.short_name ? club.short_name.slice(0, 2) : club.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{club.category}</Badge>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-sm leading-tight mb-1">
                      {club.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {club.description || `${club.category} club under ${club.faculty}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{club.members_count} members</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{club.department}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Clubs;