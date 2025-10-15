import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2, DoorClosed } from "lucide-react";
import { AddItemFromMenu } from "@/components/AddItemFromMenu";
import { getTable, getTableItems, deleteTableItem, createTransaction, clearTableItems, updateTableStatus } from "@/lib/supabaseHelpers";
import type { Table, TableItem } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

const TableDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState<Table | null>(null);
  const [items, setItems] = useState<TableItem[]>([]);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [closeTableOpen, setCloseTableOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadTableData();
    }
  }, [id]);

  const loadTableData = async () => {
    if (!id) return;
    
    try {
      const [tableData, itemsData] = await Promise.all([
        getTable(parseInt(id)),
        getTableItems(parseInt(id)),
      ]);
      
      setTable(tableData);
      setItems(itemsData);
    } catch (error) {
      console.error("Error loading table data:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await deleteTableItem(itemId);
      toast.success("Ürün silindi");
      await loadTableData();
    } catch (error) {
      toast.error("Ürün silinemedi");
    }
  };

  // Admin kontrolü kaldırıldı, tüm authenticated kullanıcılar masayı kapatabilir
  const handleCloseTable = async () => {
    if (!table) return;

    try {
      const total = items.reduce(
        (sum, item) => sum + (item.product_price || 0) * item.quantity,
        0
      );

      // 1. Transaction oluşturma
      if (items.length > 0) {
        try {
          await createTransaction({
            table_id: table.id,
            table_name: table.name,
            total_amount: total,
            items: items.map((item) => ({
              name: item.product_name,
              price: item.product_price,
              quantity: item.quantity,
            })),
          });
        } catch (err: any) {
          console.error("Transaction oluşturulamadı:", err);
          toast.error("Transaction oluşturulamadı: " + (err?.message || err));
          return;
        }

        // 2. Table items silme
        try {
          await clearTableItems(table.id);
        } catch (err: any) {
          console.error("Table items silinemedi:", err);
          toast.error("Table items silinemedi: " + (err?.message || err));
          return;
        }
      }

      // 3. Masa durumunu güncelleme
      try {
        await updateTableStatus(table.id, false, null);
      } catch (err: any) {
        console.error("Masa durumu güncellenemedi:", err);
        toast.error("Masa durumu güncellenemedi: " + (err?.message || err));
        return;
      }

      toast.success("Masa kapatıldı!");
      navigate("/");
    } catch (error: any) {
      console.error("Masa kapatılamadı:", error);
      toast.error("Masa kapatılamadı: " + (error?.message || error));
    }
  };

  if (!table) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Masa bulunamadı</p>
      </div>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product_price || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate("/")} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold">{table.name}</h1>
          <div className="w-24" />
        </div>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Adisyon</h2>
            <Button onClick={() => setAddItemOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ürün Ekle
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Henüz ürün eklenmedi
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {(item.product_price || 0).toFixed(2)} ₺
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">
                      {((item.product_price || 0) * item.quantity).toFixed(2)} ₺
                    </p>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Toplam:</span>
              <span className="text-primary">{total.toFixed(2)} ₺</span>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full"
          onClick={() => setCloseTableOpen(true)}
        >
          <DoorClosed className="w-5 h-5 mr-2" />
          Masayı Kapat
        </Button>
      </div>

      <AddItemFromMenu
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        tableId={table.id}
        onSuccess={loadTableData}
      />

      <AlertDialog open={closeTableOpen} onOpenChange={setCloseTableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masa Kapat</AlertDialogTitle>
            <AlertDialogDescription>
              {items.length > 0 ? (
                <>
                  Toplam: <span className="text-2xl font-bold text-primary">{total.toFixed(2)} ₺</span>
                  <br />
                  <br />
                  Masayı kapatmak ve ödemeyi almak istiyor musunuz?
                </>
              ) : (
                <>Masada ürün yok. Masayı kapatmak istiyor musunuz?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseTable}>
              Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TableDetail;
