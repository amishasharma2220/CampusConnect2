 // Example for MyEvents.tsx — repeat pattern for other stubs
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MyEvents = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-display text-2xl font-bold text-foreground mb-4">My Events</h1>
      <p className="text-muted-foreground mb-6">Coming soon.</p>
      <Button variant="hero" asChild><Link to="/student/dashboard">Back to Dashboard</Link></Button>
    </div>
  </div>
);
export default MyEvents;