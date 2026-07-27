import { motion } from "framer-motion";
import { CalendarCheck, Bell, Users, MapPin, Trophy, Ticket } from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Smart Event Discovery",
    description: "Browse events filtered by category, date, or department. Never miss what matters to you.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Get real-time alerts for new events, registration deadlines, and last-minute changes.",
  },
  {
    icon: Ticket,
    title: "One-Tap Registration",
    description: "Register for events in seconds with your student profile. No forms, no hassle.",
  },
  {
    icon: Users,
    title: "Club Management",
    description: "Clubs can create, manage, and promote events with built-in analytics and attendance tracking.",
  },
  {
    icon: MapPin,
    title: "Campus Maps",
    description: "Find event venues across campus with interactive maps and directions.",
  },
  {
    icon: Trophy,
    title: "Leaderboards & Rewards",
    description: "Earn points for attending events and climb the leaderboard. Top participants get campus perks.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Why CampusConnect
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-3 mb-4">
            Everything Your Campus Needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete event management ecosystem designed for the MUJ community.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-warm transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
