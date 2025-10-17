import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProductGroups, getProducts, addTableItem, updateTableStatus } from "@/lib/supabaseHelpers";
import type { ProductGroup, Product } from "@/lib/supabaseHelpers";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface AddItemFromMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: number;
  onSuccess: () => void;
}

export function AddItemFromMenu({ open, onOpenChange, tableId, onSuccess }: AddItemFromMenuProps) {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadGroups();
      setSelectedGroup(null);
      setSelectedProduct(null);
      setQuantity(1);
      setCustomPrice("");
    }
  }, [open]);

  useEffect(() => {
    if (selectedGroup) {
      loadProducts(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const data = await getProductGroups();
      setGroups(data);
    } catch (error) {
      toast.error("Gruplar yüklenemedi");
    }
  };

  const loadProducts = async (groupId: string) => {
    try {
      const allProducts = await getProducts();
      const filteredProducts = allProducts.filter(p => p.group_id === groupId);
      setProducts(filteredProducts);
    } catch (error) {
      toast.error("Ürünler yüklenemedi");
    }
  };

  const handleGroupSelect = (group: ProductGroup) => {
    setSelectedGroup(group);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCustomPrice("");
  };

  const handleAddItem = async () => {
    if (!selectedProduct) return;

    const price = selectedProduct.price !== null 
      ? selectedProduct.price 
      : parseFloat(customPrice) || null;

    if (selectedProduct.price === null && !customPrice) {
      toast.error("Lütfen fiyat girin");
      return;
    }

    setIsLoading(true);
    try {
      await addTableItem({
        table_id: tableId,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_price: price,
        quantity,
      });

      await updateTableStatus(tableId, true, new Date().toISOString());
      
      toast.success("Ürün eklendi");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Ürün eklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
    } else if (selectedGroup) {
      setSelectedGroup(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {(selectedGroup || selectedProduct) && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle>
              {selectedProduct
                ? "Miktar Seçin"
                : selectedGroup
                ? selectedGroup.name
                : "Ürün Grubu Seçin"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {!selectedGroup && !selectedProduct && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupSelect(group)}
                className="p-4 border rounded-lg hover:bg-secondary transition-colors text-left"
              >
                {group.image_url && (
                  <div className="w-full h-32 bg-secondary rounded-md mb-2 overflow-hidden">
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <p className="font-semibold text-center">{group.name}</p>
              </button>
            ))}
          </div>
        )}

        {selectedGroup && !selectedProduct && (
          <div className="space-y-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="w-full p-4 border rounded-lg hover:bg-secondary transition-colors text-left flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  {product.price !== null ? (
                    <p className="text-sm text-muted-foreground">
                      {product.price.toFixed(2)} ₺
                    </p>
                  ) : (
                    <p className="text-sm text-warning">Fiyatsız - Girilecek</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-semibold text-lg">{selectedProduct.name}</p>
              {selectedProduct.price !== null && (
                <p className="text-muted-foreground">
                  {selectedProduct.price.toFixed(2)} ₺
                </p>
              )}
            </div>

            {selectedProduct.price === null && (
              <div className="space-y-2">
                <Label htmlFor="price">Fiyat (₺)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Fiyat girin"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Miktar</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddItem}
              disabled={isLoading || (selectedProduct.price === null && !customPrice)}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
