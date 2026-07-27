import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-secondary p-12 sm:p-16 text-center"
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-secondary-foreground mb-4">
              Ready to Transform Your{" "}
              <span className="text-gradient">Campus Experience?</span>
            </h2>
            <p className="text-secondary-foreground/70 text-lg max-w-xl mx-auto mb-8">
              Join thousands of MUJ students already using CampusConnect to stay in the loop.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/join">
                  Join CampusConnect
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary" asChild>
                <Link to="/learn-more">Learn More</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
