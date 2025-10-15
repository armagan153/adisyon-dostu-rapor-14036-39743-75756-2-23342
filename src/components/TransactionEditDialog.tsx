import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/lib/supabaseHelpers";
import {
  updateTransaction,
  deleteTransactionItem,
  createAuditLog,
} from "@/lib/supabaseHelpers";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionUpdated: () => void;
  isAdmin: boolean;
}

export function TransactionEditDialog({
  transaction,
  open,
  onOpenChange,
  onTransactionUpdated,
  isAdmin,
}: TransactionEditDialogProps) {
  const [editedTotal, setEditedTotal] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!transaction) return null;

  const handleDeleteItem = async (itemIndex: number) => {
    setIsLoading(true);
    try {
      const oldItems = [...transaction.items];
      await deleteTransactionItem(transaction.id, itemIndex, transaction);

      await createAuditLog({
        transaction_id: transaction.id,
        edited_by: "admin",
        edit_type: "delete_item",
        old_value: { item: oldItems[itemIndex] },
        description: `Ürün silindi: ${oldItems[itemIndex].name}`,
      });

      toast.success("Ürün silindi");
      onTransactionUpdated();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Ürün silinemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTotal = async () => {
    if (!editedTotal) return;

    const newTotal = parseFloat(editedTotal);
    if (isNaN(newTotal) || newTotal < 0) {
      toast.error("Geçerli bir tutar girin");
      return;
    }

    setIsLoading(true);
    try {
      const oldTotal = transaction.total_amount;
      await updateTransaction(transaction.id, { total_amount: newTotal });

      await createAuditLog({
        transaction_id: transaction.id,
        edited_by: "admin",
        edit_type: "update_total",
        old_value: { total: oldTotal },
        new_value: { total: newTotal },
        description: `Toplam tutar güncellendi: ${oldTotal} ₺ → ${newTotal} ₺`,
      });

      toast.success("Toplam tutar güncellendi");
      setEditedTotal("");
      onTransactionUpdated();
    } catch (error) {
      console.error("Error updating total:", error);
      toast.error("Toplam tutar güncellenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İşlem Detayı - {transaction.table_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Toplam Tutar</p>
              <p className="text-2xl font-bold text-primary">
                {transaction.total_amount.toFixed(2)} ₺
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tarih</p>
              <p className="text-sm">
                {new Date(transaction.completed_at).toLocaleString("tr-TR")}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Ürünler</h3>
            <div className="space-y-2">
              {Array.isArray(transaction.items) &&
                transaction.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}x {(item.price || 0).toFixed(2)} ₺ ={" "}
                        {((item.price || 0) * item.quantity).toFixed(2)} ₺
                      </p>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteItem(index)}
                        disabled={isLoading || transaction.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {isAdmin && (
            <div>
              <h3 className="font-semibold mb-3">Toplam Tutarı Düzenle</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Yeni tutar"
                  value={editedTotal}
                  onChange={(e) => setEditedTotal(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleUpdateTotal}
                  disabled={isLoading || !editedTotal}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
