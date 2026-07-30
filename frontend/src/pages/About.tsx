import { motion } from "framer-motion";
import { ArrowLeft, Target, Users, Zap, Heart, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const values = [
  { icon: <Target className="w-6 h-6" />, title: "Mission-Driven", description: "We aim to make campus life accessible, organized, and memorable for every student at MUJ." },
  { icon: <Users className="w-6 h-6" />, title: "Community First", description: "Built by students, for students. Every feature is designed to strengthen the campus community." },
  { icon: <Zap className="w-6 h-6" />, title: "Innovation", description: "Leveraging modern technology to solve real campus problems — no more WhatsApp forwards for event updates." },
  { icon: <Heart className="w-6 h-6" />, title: "Inclusivity", description: "Every student deserves to know about every opportunity. We make sure no event goes unnoticed." },
  { icon: <Globe className="w-6 h-6" />, title: "Transparency", description: "Open event management with clear approval processes and visible registration data." },
  { icon: <Shield className="w-6 h-6" />, title: "Trust", description: "Verified events, legitimate certificates, and a secure platform you can rely on." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">About CampusConnect</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Connecting <span className="text-gradient">Campus Life</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CampusConnect is the unified event management platform for Manipal University Jaipur. We bring together students, clubs, and administration to create a vibrant campus experience.
            </p>
          </motion.div>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">What is CampusConnect?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                CampusConnect is a comprehensive event management platform designed specifically for Manipal University Jaipur. It serves as a one-stop solution for discovering, organizing, and managing campus events.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For <strong className="text-foreground">students</strong>, it provides a curated feed of all campus events — from hackathons and cultural fests to sports tournaments and academic workshops. Register with one click, track your participation, and download certificates.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For <strong className="text-foreground">clubs and organizers</strong>, it offers powerful tools to create events, manage registrations, and reach the entire student body. Every event goes through an admin approval process to ensure quality and legitimacy.
              </p>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Why CampusConnect?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Before CampusConnect, event information was scattered across WhatsApp groups, Instagram pages, and word of mouth. Students missed events they cared about, organizers struggled to reach their audience, and there was no central record of participation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                CampusConnect solves this by creating a single, verified platform where all campus events live. No more spam, no more missed deadlines — just a clean, reliable way to stay connected with your campus.
              </p>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {values.map((value, index) => (
                <div key={index} className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-warm transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="text-center mt-16">
            <Button variant="hero" size="lg" className="rounded-xl" asChild>
              <Link to="/register">Join CampusConnect</Link>
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;