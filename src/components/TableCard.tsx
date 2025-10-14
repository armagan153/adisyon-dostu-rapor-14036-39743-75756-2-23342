import { Card } from "@/components/ui/card";
import type { Table } from "@/lib/supabaseHelpers";
import { Clock, UtensilsCrossed } from "lucide-react";

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

export const TableCard = ({ table, onClick }: TableCardProps) => {
  const getOpenDuration = () => {
    if (!table.opened_at) return null;
    const now = new Date();
    const opened = new Date(table.opened_at);
    const diffMs = now.getTime() - opened.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const openDuration = getOpenDuration();

  return (
    <Card
      onClick={onClick}
      className={`p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
        table.is_occupied
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card hover:bg-secondary"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <UtensilsCrossed className="w-8 h-8" />
        <div className="text-center">
          <h3 className="text-2xl font-bold">{table.name}</h3>
          {openDuration !== null && (
            <div className="flex items-center justify-center gap-1 text-xs mt-2">
              <Clock className="w-3 h-3" />
              <span>{openDuration} dk</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
