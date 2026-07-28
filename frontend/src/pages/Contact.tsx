import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20">
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Get in Touch</span>
            <h1 className="font-display text-5xl font-bold text-secondary-foreground mt-3 mb-4">Contact Us</h1>
            <p className="text-secondary-foreground/70 text-lg">We're here to help with any questions about CampusConnect.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            {[
              { icon: <Mail className="w-5 h-5 text-primary" />, title: "Email", lines: ["campusconnect@muj.manipal.edu", "For general enquiries and support"] },
              { icon: <MapPin className="w-5 h-5 text-primary" />, title: "Location", lines: ["Manipal University Jaipur", "Dehmi Kalan, Jaipur, Rajasthan 303007"] },
              { icon: <Phone className="w-5 h-5 text-primary" />, title: "Student Affairs", lines: ["DSW Office, MUJ", "Available on campus during working hours"] },
              { icon: <Clock className="w-5 h-5 text-primary" />, title: "Response Time", lines: ["Within 24 hours on weekdays", "Weekends may take longer"] },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">{item.icon}</div>
                  <h3 className="font-display font-bold text-foreground">{item.title}</h3>
                </div>
                {item.lines.map(l => <p key={l} className="text-muted-foreground text-sm">{l}</p>)}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
    <Footer />
  </div>
);

export default Contact;