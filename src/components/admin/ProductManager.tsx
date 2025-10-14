import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAllProducts, getProductGroups, createProduct, updateProduct, deleteProduct } from "@/lib/supabaseHelpers";
import type { Product, ProductGroup } from "@/lib/supabaseHelpers";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    group_id: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, groupsData] = await Promise.all([
        getAllProducts(),
        getProductGroups(),
      ]);
      setProducts(productsData);
      setGroups(groupsData);
    } catch (error) {
      toast.error("Veriler yüklenemedi");
    }
  };

  const filteredProducts = selectedGroupId === "all"
    ? products
    : products.filter((p) => p.group_id === selectedGroupId);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      group_id: groups[0]?.id || "",
      is_active: true,
    });
    setIsAddEditOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price?.toString() || "",
      group_id: product.group_id,
      is_active: product.is_active,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Ürün adı gerekli");
      return;
    }

    if (!formData.group_id) {
      toast.error("Grup seçimi gerekli");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        name: formData.name,
        price: formData.price ? parseFloat(formData.price) : null,
        group_id: formData.group_id,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success("Ürün güncellendi");
      } else {
        await createProduct(data);
        toast.success("Ürün eklendi");
      }

      await loadData();
      setIsAddEditOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      await deleteProduct(product.id);
      toast.success("Ürün silindi");
      await loadData();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      await loadData();
    } catch (error) {
      toast.error("Güncelleme başarısız");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ürünler</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ürün Ekle
        </Button>
      </div>

      <Tabs value={selectedGroupId} onValueChange={setSelectedGroupId}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          {groups.map((group) => (
            <TabsTrigger key={group.id} value={group.id}>
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left">Ürün Adı</th>
                <th className="px-4 py-3 text-left">Grup</th>
                <th className="px-4 py-3 text-left">Fiyat</th>
                <th className="px-4 py-3 text-center">Aktif</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">
                    {product.product_groups?.name}
                  </td>
                  <td className="px-4 py-3">
                    {product.price !== null ? (
                      `${product.price.toFixed(2)} ₺`
                    ) : (
                      <Badge variant="outline" className="text-warning">
                        Fiyatsız
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => handleToggleActive(product)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ürün adını girin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Grup *</Label>
              <Select
                value={formData.group_id}
                onValueChange={(value) => setFormData({ ...formData, group_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Grup seçin" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Fiyat (₺) <span className="text-muted-foreground text-sm">(Opsiyonel)</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Fiyat girin veya boş bırakın"
              />
              {!formData.price && (
                <p className="text-sm text-muted-foreground">
                  Fiyatsız ürünler için ekleme sırasında fiyat sorulacak
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktif</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
