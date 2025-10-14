import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkAdminPassword, setAdminSession } from "@/lib/adminAuth";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdminLogin({ open, onOpenChange, onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await checkAdminPassword(password.trim());
      
      if (isValid) {
        setAdminSession();
        toast.success("Giriş başarılı!");
        onOpenChange(false);
        setPassword("");
        onSuccess();
      } else {
        toast.error("Hatalı parola!");
      }
    } catch (error) {
      toast.error("Bir hata oluştu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Girişi
          </DialogTitle>
          <DialogDescription>Admin paneline erişmek için parolayı girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Parola</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin parolasını girin"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Kontrol ediliyor..." : "Giriş Yap"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
