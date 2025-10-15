import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { UserAuthProvider } from "@/context/UserAuthContext";
import Index from "./pages/Index";
import TableDetail from "./pages/TableDetail";
import AdminPanel from "./pages/AdminPanel";
import Report from "./pages/Report";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <UserAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/table/:id" element={<TableDetail />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserAuthProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
