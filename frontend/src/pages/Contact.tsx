import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Message Sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">Get in Touch</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Contact <span className="text-gradient">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Have questions, feedback, or need support? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">Address</h3>
                <p className="text-sm text-muted-foreground">
                  Manipal University Jaipur<br />
                  Dehmi Kalan, Off Jaipur-Ajmer Expressway<br />
                  Jaipur, Rajasthan 303007
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">campusconnect@muj.manipal.edu</p>
                <p className="text-sm text-muted-foreground">support@campusconnect.in</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">+91 141 3999 100</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-card space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@muj.manipal.edu" value={form.email} onChange={handleChange} required className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="What is this about?" value={form.subject} onChange={handleChange} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message..." value={form.message} onChange={handleChange} required className="min-h-[140px] rounded-xl" />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Message</>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;