import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto"
      >
        <h2 className="font-display text-4xl font-bold text-foreground mb-4">
          Ready to <span className="text-gradient">get involved?</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Join CampusConnect and never miss an event at MUJ again.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/register">Create Account</Link>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;