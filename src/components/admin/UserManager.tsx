import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Key, UserCheck, UserX } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AppUser {
  id: string;
  username: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function UserManager() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Güncelleme
        const { error } = await supabase
          .from("app_users")
          .update({
            username: formData.username,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedUser.id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Kullanıcı güncellendi",
        });
      } else {
        // Yeni kullanıcı - bcrypt hash'leme için SQL fonksiyonu kullan
        const { data, error } = await supabase.rpc("create_user_with_password", {
          username: formData.username,
          password: formData.password
        });

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Kullanıcı oluşturuldu",
        });
      }

      setDialogOpen(false);
      setFormData({ username: "", password: "" });
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı kaydedilirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const { data, error } = await supabase.rpc("update_user_password", {
        user_id: selectedUser.id,
        new_password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Şifre güncellendi",
      });

      setResetPasswordOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Hata",
        description: "Şifre güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (user: AppUser) => {
    try {
      const { error } = await supabase
        .from("app_users")
        .update({
          is_active: !user.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Kullanıcı ${!user.is_active ? "aktif edildi" : "pasif edildi"}`,
      });

      loadUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (!confirm(`"${user.username}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kullanıcı silindi",
      });

      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı silinirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kullanıcı Yönetimi</CardTitle>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setFormData({ username: "", password: "" });
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı Adı</TableHead>
                <TableHead>Oluşturan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturma Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.created_by}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleActive(user)}
                        disabled={user.username === "admin"}
                      />
                      {user.is_active ? (
                        <UserCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <UserX className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData({
                            username: user.username,
                            password: "",
                          });
                          setDialogOpen(true);
                        }}
                        disabled={user.username === "admin"}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordOpen(true);
                        }}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        disabled={user.username === "admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Kullanıcı Ekleme/Düzenleme Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Kullanıcı adı girin"
                required
              />
            </div>
            {!selectedUser && (
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Şifre girin"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {selectedUser ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Şifre Sıfırlama Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Sıfırla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedUser?.username} kullanıcısı için yeni şifre belirleyin
            </p>
            <div>
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifre girin"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetPasswordOpen(false);
                setNewPassword("");
              }}
            >
              İptal
            </Button>
            <Button onClick={handleResetPassword}>Şifreyi Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
