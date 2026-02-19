import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const [discountRate, setDiscountRate] = useState("5.0");
  const [inflation, setInflation] = useState("2.5");
  const [currency, setCurrency] = useState("USD");

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Financial Assumptions</CardTitle>
          <CardDescription>Default values used for obligation calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Default Discount Rate (%)</Label>
              <Input type="number" step="0.1" value={discountRate} onChange={e => setDiscountRate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Inflation Assumption (%)</Label>
              <Input type="number" step="0.1" value={inflation} onChange={e => setInflation(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Reporting Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Site Hierarchy</CardTitle>
          <CardDescription>Manage sites, facilities, and asset templates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Hierarchy management will be available in a future release. Current sites and facilities are configured in the system data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
