import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { getAuditLogs } from "@/lib/supabaseHelpers";
import { useEffect, useState } from "react";
import type { AuditLog } from "@/lib/supabaseHelpers";
import { isAdminLoggedIn } from "@/lib/adminAuth";

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/");
      return;
    }
    loadLogs();
  }, [navigate]);

  const loadLogs = async () => {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate("/report")} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold">Değişiklik Kayıtları</h1>
          <div className="w-24" />
        </div>

        <Card className="p-6">
          {logs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Henüz değişiklik kaydı yok
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold capitalize">
                            {log.edit_type.replace("_", " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.edited_by}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      {log.description && (
                        <p className="text-sm mb-2">{log.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {log.old_value && (
                          <div className="p-2 bg-background rounded">
                            <p className="text-xs text-muted-foreground mb-1">
                              Eski Değer
                            </p>
                            <pre className="text-xs">
                              {JSON.stringify(log.old_value, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_value && (
                          <div className="p-2 bg-background rounded">
                            <p className="text-xs text-muted-foreground mb-1">
                              Yeni Değer
                            </p>
                            <pre className="text-xs">
                              {JSON.stringify(log.new_value, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;
