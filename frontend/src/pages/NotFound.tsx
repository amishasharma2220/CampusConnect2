import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-display text-8xl font-bold text-primary mb-4">404</h1>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
      <Button variant="hero" asChild><Link to="/">Go Home</Link></Button>
    </div>
  </div>
);

export default NotFound;