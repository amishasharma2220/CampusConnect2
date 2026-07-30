import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Users, ChevronDown, ChevronUp, ArrowLeft, Building2, GraduationCap, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clubs, faculties, categoryConfig, type Club } from "@/data/clubsData";
import { motion, AnimatePresence } from "framer-motion";

const allCategories = ["All", ...Object.keys(categoryConfig)];

const Clubs = () => {
  const [search, setSearch] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>("FoSTA");
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const matchClub = (c: Club) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.faculty.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    return matchSearch && matchCat;
  };

  const filtered = useMemo(() => clubs.filter(matchClub), [search, filterCategory]);
  const totalClubs = clubs.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-secondary-foreground/60 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold">Clubs & Chapters at MUJ</h1>
              <p className="text-secondary-foreground/60 mt-2 max-w-2xl">
                Explore {totalClubs}+ student clubs across all faculties and departments of Manipal University Jaipur.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalClubs}</p>
                <p className="text-secondary-foreground/50">Active Clubs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{faculties.length}</p>
                <p className="text-secondary-foreground/50">Faculties</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {faculties.reduce((sum, f) => sum + f.departments.length, 0)}
                </p>
                <p className="text-secondary-foreground/50">Departments</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/join-club">
              <Button className="bg-hero-gradient text-primary-foreground rounded-xl h-11 px-6">
                Join a Club
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search clubs, departments, or faculties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {allCategories.map((cat) => (
              <Button key={cat} variant={filterCategory === cat ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setFilterCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Faculty → Department → Club Hierarchy */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Browse by Faculty & Department
          </h2>
          <div className="space-y-3">
            {faculties.map((fac) => {
              const isFacExpanded = expandedFaculty === fac.shortName;
              const facClubCount = fac.departments.reduce((sum, dept) => {
                return sum + dept.clubs.filter((id) => {
                  const club = clubs.find((c) => c.id === id);
                  return club ? matchClub(club) : false;
                }).length;
              }, 0);

              return (
                <div key={fac.shortName} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedFaculty(isFacExpanded ? null : fac.shortName)}
                    className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="font-display font-semibold text-foreground">{fac.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{fac.shortName}</Badge>
                          <span className="text-muted-foreground text-xs">{fac.departments.length} depts · {facClubCount} clubs</span>
                        </div>
                      </div>
                    </div>
                    {isFacExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {isFacExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-4 pb-5 md:px-5 space-y-2">
                          <p className="text-muted-foreground text-sm mb-3">{fac.description}</p>

                          {fac.departments.map((dept) => {
                            const deptClubs = dept.clubs
                              .map((id) => clubs.find((c) => c.id === id))
                              .filter((c): c is Club => !!c && matchClub(c));
                            const isDeptExpanded = expandedDept === `${fac.shortName}-${dept.shortName}`;
                            const deptKey = `${fac.shortName}-${dept.shortName}`;

                            return (
                              <div key={deptKey} className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
                                <button
                                  onClick={() => setExpandedDept(isDeptExpanded ? null : deptKey)}
                                  className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-muted/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Layers className="w-4 h-4 text-primary/70" />
                                    <div className="text-left">
                                      <span className="font-medium text-foreground text-sm">{dept.name}</span>
                                      <span className="text-muted-foreground text-xs ml-2">({deptClubs.length} clubs)</span>
                                    </div>
                                  </div>
                                  {isDeptExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </button>

                                <AnimatePresence>
                                  {isDeptExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                      <div className="px-3 pb-4 md:px-4">
                                        {deptClubs.length === 0 ? (
                                          <p className="text-muted-foreground text-sm italic">No clubs match your filters.</p>
                                        ) : (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {deptClubs.map((club) => (
                                              <Link
                                                key={club.id}
                                                to={`/clubs`}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 hover:shadow-card transition-all"
                                              >
                                                <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-lg object-cover shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-semibold text-foreground text-sm leading-tight">{club.name}</p>
                                                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{club.description}</p>
                                                  <div className="flex items-center gap-2 mt-1.5">
                                                    <Badge variant="outline" className={`text-[10px] ${categoryConfig[club.category]?.color}`}>
                                                      {club.category}
                                                    </Badge>
                                                    {club.members && (
                                                      <span className="text-[10px] text-muted-foreground">{club.members} members</span>
                                                    )}
                                                  </div>
                                                </div>
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Flat Grid */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Clubs ({filtered.length})
          </h2>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No clubs found matching your search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((club, i) => (
                <motion.div key={club.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                  <Link
                    to={`/clubs`}
                    className="block rounded-xl border border-border bg-card p-4 space-y-2.5 hover:shadow-warm hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-foreground text-sm leading-tight truncate">{club.name}</h3>
                        <span className="text-muted-foreground text-xs">{club.faculty} · {club.department}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{club.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${categoryConfig[club.category]?.color}`}>{club.category}</Badge>
                      {club.members && <span className="text-[10px] text-muted-foreground">{club.members} members</span>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* DSW Contact */}
        <section className="rounded-xl border border-border bg-card p-6 text-center">
          <h3 className="font-display font-bold text-foreground">Directorate of Students' Welfare</h3>
          <p className="text-muted-foreground text-sm mt-1">Dr. Sanchit Anand — Assistant Director, DSW</p>
          <p className="text-muted-foreground text-xs mt-1">Room No. 001 AB1 · sanchit.anand@jaipur.manipal.edu · 0141-3999100 Ext:552</p>
        </section>
      </div>
    </div>
  );
};

export default Clubs;
