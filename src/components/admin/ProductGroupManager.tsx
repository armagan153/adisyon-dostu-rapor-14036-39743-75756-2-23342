import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getProductGroups, createProductGroup, updateProductGroup, deleteProductGroup } from "@/lib/supabaseHelpers";
import type { ProductGroup } from "@/lib/supabaseHelpers";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MediaLibrary } from "./MediaLibrary";

export function ProductGroupManager() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ProductGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    order_index: 0,
  });
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getProductGroups();
      setGroups(data);
    } catch (error) {
      toast.error("Gruplar yüklenemedi");
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setFormData({ name: "", order_index: groups.length });
    setSelectedImageUrl(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (group: ProductGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      order_index: group.order_index,
    });
    setSelectedImageUrl(group.image_url);
    setIsAddEditOpen(true);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Grup adı gerekli");
      return;
    }

    setIsLoading(true);
    try {
      if (editingGroup) {
        await updateProductGroup(editingGroup.id, {
          name: formData.name,
          order_index: formData.order_index,
          image_url: selectedImageUrl,
        });
        toast.success("Grup güncellendi");
      } else {
        await createProductGroup({
          name: formData.name,
          order_index: formData.order_index,
          image_url: selectedImageUrl,
        });
        toast.success("Grup eklendi");
      }

      await loadGroups();
      setIsAddEditOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (group: ProductGroup) => {
    setDeletingGroup(group);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return;

    setIsLoading(true);
    try {
      await deleteProductGroup(deletingGroup.id);
      toast.success("Grup silindi");
      await loadGroups();
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ürün Grupları</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Grup Ekle
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded-lg p-4 space-y-3">
            {group.image_url ? (
              <div className="w-full h-32 bg-secondary rounded-md overflow-hidden">
                <img
                  src={group.image_url}
                  alt={group.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <p className="font-semibold text-center">{group.name}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(group)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => handleDeleteClick(group)}
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
              {editingGroup ? "Grup Düzenle" : "Yeni Grup Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Grup Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Grup adını girin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Sıra Numarası</Label>
              <Input
                id="order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Resim</Label>
              <p className="text-xs text-muted-foreground">
                Önerilen: Kare (1:1) format, minimum 512x512px
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsMediaLibraryOpen(true)}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Kütüphaneden Seç
              </Button>
              {selectedImageUrl && (
                <div className="w-full h-48 bg-secondary rounded-md overflow-hidden">
                  <img
                    src={selectedImageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
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

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grubu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu grubu silmek istediğinize emin misiniz? Bu gruptaki tüm ürünler de silinecektir!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MediaLibrary
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleImageSelect}
        selectedImageUrl={selectedImageUrl || undefined}
      />
    </div>
  );
}
