import { Download, FileText, Clock, User, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAuditTrail } from "@/data/invoice-mock-data";

export function AuditTrailView() {
  const actionColor = (action: string) => {
    if (action.includes("Approved")) return "bg-green-50 text-green-700 border-green-200";
    if (action.includes("Flagged")) return "bg-red-50 text-red-700 border-red-200";
    if (action.includes("Uploaded")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (action.includes("Processing") || action.includes("Generated")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Compliance Audit Trail</h3>
          <p className="text-xs text-muted-foreground">Complete log of all document processing, matching, and approval events</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1">
          <Download className="h-3 w-3" /> Export Audit Packet
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditTrail.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${actionColor(entry.action)}`}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {entry.entityId}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1">
                      {entry.performedBy === "System" ? (
                        <Shield className="h-3 w-3 text-primary" />
                      ) : (
                        <User className="h-3 w-3 text-muted-foreground" />
                      )}
                      {entry.performedBy}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{entry.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Packet Preview */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Downloadable Audit Packet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Each audit packet includes:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Invoice Record", "Attached Documents", "Matching Metadata", "Approval Record"].map((item) => (
              <div key={item} className="border rounded-md p-2 text-center">
                <FileText className="h-5 w-5 mx-auto mb-1 text-primary/60" />
                <span className="text-[10px] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
