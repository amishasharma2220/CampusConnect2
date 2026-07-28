import { motion } from "framer-motion";
import { Users, Calendar, Award, MapPin, Heart, Shield } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const stats = [
  { value: "25,000+", label: "Students on Campus" },
  { value: "82+", label: "Clubs & Societies" },
  { value: "150+", label: "Events Per Year" },
  { value: "2026", label: "Platform Launched" },
];

const values = [
  { icon: <Heart className="w-6 h-6" />, title: "Student-First", desc: "Built by MUJ students, for MUJ students. Every feature is designed around the campus experience." },
  { icon: <Shield className="w-6 h-6" />, title: "Transparent", desc: "All events go through an admin approval process to ensure quality and safety on campus." },
  { icon: <Users className="w-6 h-6" />, title: "Inclusive", desc: "From tech fests to cultural nights — we support every kind of campus activity and club." },
  { icon: <Award className="w-6 h-6" />, title: "Recognition", desc: "Students earn points, certificates, and leaderboard rankings for active participation." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">About Us</span>
            <h1 className="font-display text-5xl font-bold text-secondary-foreground mt-3 mb-6">
              The Campus Platform Built for <span className="text-gradient">MUJ</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg leading-relaxed">
              CampusConnect is a unified event management ecosystem for Manipal University Jaipur.
              We connect students with clubs, events, and opportunities — making it easier than ever
              to discover, organize, and participate in campus life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-hero-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="font-display text-4xl font-bold text-primary-foreground mb-1">{s.value}</p>
                <p className="text-primary-foreground/70 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Mission</span>
              <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-6">
                No student should miss an event they'd love
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Before CampusConnect, event discovery at MUJ was fragmented — WhatsApp groups, physical posters,
                word of mouth. Students missed events they would have loved. Club admins struggled to reach
                their audience.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built CampusConnect to solve this. One platform where every event, every club,
                and every opportunity is a single tap away for every MUJ student.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {values.map((v, i) => (
                <div key={v.title} className="bg-card border border-border rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    {v.icon}
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* University info */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Manipal University Jaipur</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Dehmi Kalan, Near GVK Toll Plaza, Jaipur–Ajmer Expressway, Jaipur, Rajasthan 303007
          </p>
        </div>
      </section>
    </div>
    <Footer />
  </div>
);

export default About;