import { motion } from "framer-motion";
import { Calendar, Users, Award, MapPin, Bell, Shield } from "lucide-react";

const features = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Event Discovery",
    description: "Browse and filter all campus events by category, club, or date. Never miss what matters.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Club Management",
    description: "Club admins can create events, track attendance, manage budgets, and issue certificates.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Certificates",
    description: "Automatically issued digital certificates for events you attend or win.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Venue Finder",
    description: "Find available venues on campus with capacity, facilities, and directions.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Notifications",
    description: "Get notified about upcoming events, registration deadlines, and announcements.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Admin Controls",
    description: "University admins can approve events, manage clubs, and view platform analytics.",
  },
];

const FeaturesSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-4xl font-bold text-foreground mb-4">
          Everything you need for <span className="text-gradient">campus life</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From event discovery to certificate issuance — CampusConnect handles the entire lifecycle.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-card hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              {f.icon}
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;