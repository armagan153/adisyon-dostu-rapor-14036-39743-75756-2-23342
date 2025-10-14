import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Receipt, DollarSign, Calendar, FileText } from "lucide-react";
import { getTransactions } from "@/lib/supabaseHelpers";
import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/supabaseHelpers";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TransactionEditDialog } from "@/components/TransactionEditDialog";
import { isAdminLoggedIn } from "@/lib/adminAuth";

const Report = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isAdmin = isAdminLoggedIn();

  useEffect(() => {
    loadTransactions();
  }, [selectedDate]);

  const loadTransactions = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      const data = await getTransactions(startDate, endDate);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (isAdmin) {
      setSelectedTransaction(transaction);
      setIsEditDialogOpen(true);
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
          <h1 className="text-3xl font-bold">Rapor</h1>
          <div className="w-24" />
        </div>

        <div className="flex gap-2 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                {format(selectedDate, "PPP", { locale: tr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={tr}
              />
            </PopoverContent>
          </Popover>

          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => navigate("/audit-logs")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Değişiklik Kayıtları
            </Button>
          )}
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
              Seçili tarihte işlem yapılmadı
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "p-4 bg-secondary rounded-lg",
                    isAdmin && "cursor-pointer hover:bg-secondary/80 transition-colors"
                  )}
                  onClick={() => handleTransactionClick(transaction)}
                >
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

        <TransactionEditDialog
          transaction={selectedTransaction}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onTransactionUpdated={loadTransactions}
        />
      </div>
    </div>
  );
};

export default Report;
