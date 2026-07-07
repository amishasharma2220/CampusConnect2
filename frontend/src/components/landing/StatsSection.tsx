import { motion } from "framer-motion";

const stats = [
  { value: "82+", label: "Clubs & Societies" },
  { value: "150+", label: "Events Per Year" },
  { value: "5,000+", label: "Active Students" },
  { value: "100%", label: "MUJ Official" },
];

const StatsSection = () => (
  <section className="py-20 bg-hero-gradient">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="font-display text-4xl font-bold text-primary-foreground mb-2">{s.value}</p>
            <p className="text-primary-foreground/70 text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;