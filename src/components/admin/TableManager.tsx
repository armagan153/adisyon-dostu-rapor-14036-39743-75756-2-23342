import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getTables, createTable, updateTableName, deleteTable } from "@/lib/supabaseHelpers";
import type { Table } from "@/lib/supabaseHelpers";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      toast.error("Masalar yüklenemedi");
    }
  };

  const handleAdd = () => {
    const nextId = Math.max(...tables.map(t => t.id), 0) + 1;
    setEditingTable(null);
    setFormData({
      id: nextId,
      name: `Masa ${nextId}`,
    });
    setIsAddEditOpen(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      id: table.id,
      name: table.name,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Masa adı gerekli");
      return;
    }

    setIsLoading(true);
    try {
      if (editingTable) {
        await updateTableName(editingTable.id, formData.name);
        toast.success("Masa güncellendi");
      } else {
        await createTable({
          id: formData.id,
          name: formData.name,
        });
        toast.success("Masa eklendi");
      }

      await loadTables();
      setIsAddEditOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (table: Table) => {
    if (table.is_occupied) {
      toast.error("Dolu masa silinemez!");
      return;
    }

    if (!confirm(`${table.name} masasını silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteTable(table.id);
      toast.success("Masa silindi");
      await loadTables();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Masalar</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Masa Ekle
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">Masa {table.id}</p>
                <p className="text-sm text-muted-foreground">{table.name}</p>
              </div>
              <Badge variant={table.is_occupied ? "default" : "outline"}>
                {table.is_occupied ? "Dolu" : "Boş"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(table)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => handleDelete(table)}
                disabled={table.is_occupied}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Masa Düzenle" : "Yeni Masa Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingTable && (
              <div className="space-y-2">
                <Label htmlFor="id">Masa Numarası</Label>
                <Input
                  id="id"
                  type="number"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Masa Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masa adını girin"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddEditOpen(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
