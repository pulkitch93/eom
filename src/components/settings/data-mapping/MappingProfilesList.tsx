import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye, Copy, ArrowUpDown, Database } from "lucide-react";
import { useDataMapping } from "./DataMappingContext";
import type { MappingProfile, SourceType } from "./types";

interface Props {
  onCreateNew: () => void;
  onEdit: (profile: MappingProfile) => void;
  onView: (profile: MappingProfile) => void;
}

const sourceTypeIcon: Record<SourceType, string> = {
  API: "🔌",
  CSV: "📄",
  FTP: "📁",
  SFTP: "🔒",
};

export default function MappingProfilesList({ onCreateNew, onEdit, onView }: Props) {
  const { profiles, setProfiles, getProfileMappings } = useDataMapping();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = profiles.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.source_system_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (sourceFilter !== "all" && p.source_type !== sourceFilter) return false;
    if (activeFilter === "active" && !p.is_active) return false;
    if (activeFilter === "inactive" && p.is_active) return false;
    return true;
  });

  const handleDuplicate = (profile: MappingProfile) => {
    const dup: MappingProfile = {
      ...profile,
      id: `mp-${Date.now()}`,
      name: `${profile.name} (Copy)`,
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0],
    };
    setProfiles((prev) => [...prev, dup]);
    toast.success(`Duplicated "${profile.name}"`);
  };

  const handleDelete = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    toast.success("Mapping profile deleted");
  };

  const handleToggleActive = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active, updated_at: new Date().toISOString().split("T")[0] } : p))
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" /> Mapping Profiles
          </CardTitle>
          <CardDescription>
            Reusable profiles that translate incoming ERP/API/CSV fields into EOM fields.
          </CardDescription>
        </div>
        <Button size="sm" onClick={onCreateNew} className="gap-1.5 shrink-0">
          <Plus className="h-3.5 w-3.5" /> New Profile
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search profiles…" className="pl-8 h-9 w-52 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="FTP">FTP</SelectItem>
              <SelectItem value="SFTP">SFTP</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="h-9 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed p-10 text-center space-y-2">
            <Database className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {profiles.length === 0
                ? "No mapping profiles yet. Create one to translate incoming ERP/API/CSV fields into EOM fields."
                : "No profiles match your filters."}
            </p>
            {profiles.length === 0 && (
              <Button size="sm" variant="outline" onClick={onCreateNew} className="mt-2 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Create First Profile
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Source Type</TableHead>
                  <TableHead className="text-xs">Source System</TableHead>
                  <TableHead className="text-xs">Mappings</TableHead>
                  <TableHead className="text-xs">Active</TableHead>
                  <TableHead className="text-xs">Last Updated</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((profile) => {
                  const mappingCount = getProfileMappings(profile.id).length;
                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <button onClick={() => onView(profile)} className="text-left">
                          <p className="text-xs font-medium text-primary hover:underline">{profile.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{profile.description}</p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          {sourceTypeIcon[profile.source_type]} {profile.source_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{profile.source_system_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{mappingCount} fields</Badge>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => handleToggleActive(profile.id)}>
                          <Badge
                            variant={profile.is_active ? "default" : "outline"}
                            className={`text-[10px] cursor-pointer ${profile.is_active ? "bg-chart-success/10 text-chart-success border-chart-success/30 hover:bg-chart-success/20" : ""}`}
                          >
                            {profile.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{profile.updated_at}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(profile)} title="View">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(profile)} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(profile)} title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(profile.id)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
