import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { uploadFile, getMediaFiles, deleteMediaFile } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void;
  selectedImage?: string;
}

export const MediaLibrary = ({ onSelectImage, selectedImage }: MediaLibraryProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMediaFiles();
    }
  }, [isOpen]);

  const loadMediaFiles = async () => {
    try {
      const files = await getMediaFiles();
      setMediaFiles(files);
    } catch (error) {
      console.error("Error loading media files:", error);
      toast.error("Medya dosyaları yüklenirken hata oluştu");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Sadece resim dosyaları yüklenebilir");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    setIsUploading(true);
    try {
      await uploadFile(file);
      toast.success("Dosya başarıyla yüklendi");
      loadMediaFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Dosya yüklenirken hata oluştu");
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (id: string, fileUrl: string) => {
    try {
      await deleteMediaFile(id, fileUrl);
      toast.success("Dosya silindi");
      loadMediaFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Dosya silinirken hata oluştu");
    }
  };

  const handleSelectImage = (url: string) => {
    if (onSelectImage) {
      onSelectImage(url);
      setIsOpen(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ImageIcon className="w-4 h-4 mr-2" />
          Medya Kütüphanesi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Medya Kütüphanesi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <Card className="p-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Yeni Dosya Yükle</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button disabled={isUploading} size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Yükleniyor..." : "Yükle"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sadece resim dosyaları, maksimum 5MB
              </p>
            </div>
          </Card>

          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaFiles.map((file) => (
              <Card key={file.id} className="p-2">
                <div className="aspect-square relative mb-2">
                  <img
                    src={file.file_url}
                    alt={file.file_name}
                    className={`w-full h-full object-cover rounded cursor-pointer transition-all ${
                      selectedImage === file.file_url 
                        ? 'ring-2 ring-primary' 
                        : 'hover:opacity-80'
                    }`}
                    onClick={() => handleSelectImage(file.file_url)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => handleDeleteFile(file.id, file.file_url)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium truncate" title={file.file_name}>
                    {file.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {mediaFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Henüz medya dosyası yüklenmemiş</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
