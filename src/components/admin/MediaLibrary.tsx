import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getMediaLibrary, addMediaToLibrary, deleteMediaFromLibrary } from "@/lib/supabaseHelpers";
import type { MediaLibraryItem } from "@/lib/supabaseHelpers";
import { Upload, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (imageUrl: string) => void;
  selectedImageUrl?: string;
}

export function MediaLibrary({ isOpen, onClose, onSelect, selectedImageUrl }: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MediaLibraryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    try {
      const data = await getMediaLibrary();
      setMediaItems(data);
    } catch (error) {
      toast.error("Medya yüklenemedi");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Lütfen bir görsel dosyası seçin");
      return;
    }

    setIsUploading(true);
    try {
      await addMediaToLibrary(file);
      toast.success("Görsel kütüphaneye eklendi");
      await loadMedia();
      e.target.value = '';
    } catch (error) {
      toast.error("Yükleme başarısız");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (item: MediaLibraryItem) => {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    try {
      await deleteMediaFromLibrary(deletingItem.id, deletingItem.file_url);
      toast.success("Görsel silindi");
      await loadMedia();
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (imageUrl: string) => {
    if (onSelect) {
      onSelect(imageUrl);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Medya Kütüphanesi</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground">
                Önerilen: Kare resimler (1:1), minimum 512x512px
              </p>
              <label className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
              </label>
              <Button disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Yükleniyor..." : "Yeni Görsel Yükle"}
              </Button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto flex-1 pr-2">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative group border rounded-lg overflow-hidden">
                  <div 
                    className="aspect-square cursor-pointer relative bg-secondary"
                    onClick={() => handleSelect(item.file_url)}
                  >
                    <img
                      src={item.file_url}
                      alt={item.file_name}
                      className="w-full h-full object-contain"
                    />
                    {selectedImageUrl === item.file_url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-primary rounded-full p-2">
                          <Check className="w-6 h-6 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-2 bg-background">
                    <p className="text-xs truncate" title={item.file_name}>
                      {item.file_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görseli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
    </>
  );
}
