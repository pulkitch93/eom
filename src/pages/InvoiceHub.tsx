import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileCheck, List, BarChart3, Shield, HelpCircle } from "lucide-react";
import { BulkUploadFlow } from "@/components/invoice/BulkUploadFlow";
import { ReviewQueue } from "@/components/invoice/ReviewQueue";
import { InvoiceListView } from "@/components/invoice/InvoiceListView";
import { DataQualityDashboard } from "@/components/invoice/DataQualityDashboard";
import { AuditTrailView } from "@/components/invoice/AuditTrailView";
import { GuidedTour } from "@/components/invoice/GuidedTour";
import { Button } from "@/components/ui/button";

export default function InvoiceHub() {
  const [showTour, setShowTour] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Document Management</h1>
          <p className="text-sm text-muted-foreground">AI-powered document matching, review, and audit compliance</p>
        </div>
        {!showTour && (
          <Button size="sm" variant="outline" onClick={() => setShowTour(true)} className="gap-1">
            <HelpCircle className="h-3 w-3" /> Tour
          </Button>
        )}
      </div>

      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Upload
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-1.5 text-xs">
            <FileCheck className="h-3.5 w-3.5" /> Review Queue
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5 text-xs">
            <List className="h-3.5 w-3.5" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Data Quality
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload"><BulkUploadFlow /></TabsContent>
        <TabsContent value="review"><ReviewQueue /></TabsContent>
        <TabsContent value="invoices"><InvoiceListView /></TabsContent>
        <TabsContent value="quality"><DataQualityDashboard /></TabsContent>
        <TabsContent value="audit"><AuditTrailView /></TabsContent>
      </Tabs>
    </div>
  );
}
