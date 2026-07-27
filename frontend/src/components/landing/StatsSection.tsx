import { motion } from "framer-motion";

const stats = [
  { value: "25,000+", label: "Students on Campus" },
  { value: "150+", label: "Events Per Year" },
  { value: "50+", label: "Active Clubs" },
  { value: "98%", label: "Student Satisfaction" },
];

const StatsSection = () => {
  return (
    <section id="about" className="py-20 bg-hero-gradient relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-primary-foreground/70 text-sm sm:text-base font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
