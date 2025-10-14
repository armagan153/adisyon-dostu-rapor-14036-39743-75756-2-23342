import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Receipt, DollarSign } from "lucide-react";
import { getTodayTransactions } from "@/lib/supabaseHelpers";
import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/supabaseHelpers";

const Report = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTodayTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalTables = transactions.length;
  const averageCheck = totalTables > 0 ? totalSales / totalTables : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate("/")} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold">Gün Sonu Raporu</h1>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Satış</p>
                <p className="text-2xl font-bold">{totalSales.toFixed(2)} ₺</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Receipt className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Masa Sayısı</p>
                <p className="text-2xl font-bold">{totalTables}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Hesap</p>
                <p className="text-2xl font-bold">{averageCheck.toFixed(2)} ₺</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
          {transactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Bugün henüz işlem yapılmadı
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{transaction.table_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.completed_at).toLocaleTimeString("tr-TR")}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {transaction.total_amount.toFixed(2)} ₺
                    </p>
                  </div>
                  <div className="space-y-1">
                    {Array.isArray(transaction.items) && transaction.items.map((item: any, index: number) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.name} - {((item.price || 0) * item.quantity).toFixed(2)} ₺
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Report;
