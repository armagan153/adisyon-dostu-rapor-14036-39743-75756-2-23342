import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGroupManager } from "@/components/admin/ProductGroupManager";
import { ProductManager } from "@/components/admin/ProductManager";
import { TableManager } from "@/components/admin/TableManager";
import { ArrowLeft, LogOut, Settings, FileText } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, logout } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Admin Paneli</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/report")}>
                <FileText className="w-4 h-4 mr-2" />
                Rapor
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="groups">Ürün Grupları</TabsTrigger>
            <TabsTrigger value="products">Ürünler</TabsTrigger>
            <TabsTrigger value="tables">Masalar</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <ProductGroupManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          <TabsContent value="tables">
            <TableManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
