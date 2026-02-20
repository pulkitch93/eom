import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import AROModule from "./pages/AROModule";
import EROModule from "./pages/EROModule";
import PlanModule from "./pages/PlanModule";
import SettlementModule from "./pages/SettlementModule";
import AssuranceModule from "./pages/AssuranceModule";
import FinancialReporting from "./pages/FinancialReporting";
import RegulatoryIntelligence from "./pages/RegulatoryIntelligence";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/aro" element={<AROModule />} />
            <Route path="/ero" element={<EROModule />} />
            <Route path="/plan" element={<PlanModule />} />
            <Route path="/settlement" element={<SettlementModule />} />
            <Route path="/assurance" element={<AssuranceModule />} />
            <Route path="/reporting" element={<FinancialReporting />} />
            <Route path="/regulatory" element={<RegulatoryIntelligence />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
