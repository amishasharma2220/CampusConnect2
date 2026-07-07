import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

const StatsCard = ({ title, value, icon, description }: StatsCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
  </div>
);

export default StatsCard;