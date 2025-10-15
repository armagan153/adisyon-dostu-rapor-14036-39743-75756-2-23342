import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { MediaLibrary } from "./MediaLibrary";
import type { ProductGroup } from "@/lib/supabaseHelpers";

interface ProductGroupFormProps {
  group?: ProductGroup;
  onSave: (group: Omit<ProductGroup, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

export const ProductGroupForm = ({ group, onSave, onCancel }: ProductGroupFormProps) => {
  const [name, setName] = useState(group?.name || "");
  const [imageUrl, setImageUrl] = useState(group?.image_url || "");
  const [orderIndex, setOrderIndex] = useState(group?.order_index || 0);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setImageUrl(group.image_url || "");
      setOrderIndex(group.order_index);
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      image_url: imageUrl || null,
      order_index: orderIndex,
    });
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Grup Adı</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Grup adını girin"
            required
          />
        </div>

        <div>
          <Label htmlFor="order">Sıra</Label>
          <Input
            id="order"
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div>
          <Label>Grup Resmi</Label>
          <div className="space-y-2">
            {imageUrl && (
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Grup resmi"
                  className="w-32 h-32 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={handleRemoveImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Resim URL'si girin"
              />
              <MediaLibrary
                onSelectImage={setImageUrl}
                selectedImage={imageUrl}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {group ? "Güncelle" : "Kaydet"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        </div>
      </form>
    </Card>
  );
};
