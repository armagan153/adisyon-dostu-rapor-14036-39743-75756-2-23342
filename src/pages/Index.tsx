import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/TableCard";
import { AdminLogin } from "@/components/AdminLogin";
import { getTables } from "@/lib/supabaseHelpers";
import type { Table } from "@/lib/supabaseHelpers";
import { UtensilsCrossed, Settings } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const Index = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const { isAdmin, loading } = useAdminAuth();

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      setAdminLoginOpen(true);
    }
  };

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error("Error loading tables:", error);
    }
  };

  const occupiedTables = tables.filter((t) => t.is_occupied).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Can POS</h1>
                <p className="text-sm text-muted-foreground">
                  {occupiedTables} / {tables.length} Masa Dolu
                  {!loading && isAdmin && (
                    <span className="ml-2 text-primary">• Admin Girişi Aktif</span>
                  )}
                </p>
              </div>
            </div>
            <Button onClick={handleAdminClick} size="lg" variant={isAdmin ? "default" : "outline"}>
              <Settings className="w-4 h-4 mr-2" />
              {isAdmin ? "Admin Panel" : "Admin"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={() => navigate(`/table/${table.id}`)}
            />
          ))}
        </div>
      </main>

      <AdminLogin
        open={adminLoginOpen}
        onOpenChange={setAdminLoginOpen}
        onSuccess={() => navigate("/admin")}
      />
    </div>
  );
};

export default Index;
