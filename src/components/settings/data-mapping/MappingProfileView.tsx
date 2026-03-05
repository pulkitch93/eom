import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, ArrowRight } from "lucide-react";
import { useDataMapping } from "./DataMappingContext";
import type { MappingProfile, FieldMapping } from "./types";

interface Props {
  profile: MappingProfile;
  onBack: () => void;
  onEdit: () => void;
}

export default function MappingProfileView({ profile, onBack, onEdit }: Props) {
  const { getProfileMappings, getFieldValueMappings } = useDataMapping();
  const mappings = getProfileMappings(profile.id);
  const totalAliases = mappings.reduce((s, m) => s + m.inbound_field_aliases.length, 0);
  const totalValueMappings = mappings.reduce((s, m) => s + getFieldValueMappings(m.id).length, 0);
  const unmappedInbound = profile.inbound_fields.filter((f) => !mappings.some((m) => m.inbound_field_name === f));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Profiles
        </Button>
        <Button size="sm" onClick={onEdit} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{profile.name}</CardTitle>
            <Badge variant={profile.is_active ? "default" : "outline"} className={`text-[10px] ${profile.is_active ? "bg-chart-success/10 text-chart-success border-chart-success/30" : ""}`}>
              {profile.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {profile.description && <p className="text-muted-foreground text-xs">{profile.description}</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Source Type" value={profile.source_type} />
            <InfoTile label="Source System" value={profile.source_system_name} />
            <InfoTile label="Created" value={profile.created_at} />
            <InfoTile label="Last Updated" value={profile.updated_at} />
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-4">
            <StatTile label="Inbound Fields" value={profile.inbound_fields.length} />
            <StatTile label="Mapped Fields" value={mappings.length} />
            <StatTile label="Aliases" value={totalAliases} />
            <StatTile label="Value Mappings" value={totalValueMappings} />
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unmapped Fields</p>
              <p className="font-medium mt-0.5">{profile.unmapped_field_handling}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unmapped Values</p>
              <p className="font-medium mt-0.5">{profile.unmapped_value_handling}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Many-to-One</p>
              <p className="font-medium mt-0.5">{profile.allow_many_to_one ? "Allowed" : "Not Allowed"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Mappings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Field Mappings ({mappings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Inbound Field</TableHead>
                <TableHead className="text-xs w-8" />
                <TableHead className="text-xs">EOM Field</TableHead>
                <TableHead className="text-xs">Transform</TableHead>
                <TableHead className="text-xs">Aliases</TableHead>
                <TableHead className="text-xs">Value Mappings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((m) => {
                const vms = getFieldValueMappings(m.id);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs font-mono">{m.inbound_field_name}</TableCell>
                    <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium">{m.eom_field_label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{m.eom_field_key}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {m.transform_type !== "none" ? (
                        <Badge variant="secondary" className="text-[10px]">{m.transform_type}</Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.inbound_field_aliases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.inbound_field_aliases.map((a) => (
                            <Badge key={a} variant="outline" className="text-[10px] font-mono">{a}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vms.length > 0 ? (
                        <Badge variant="secondary" className="text-[10px]">{vms.length} mappings</Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {mappings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                    No field mappings configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unmapped inbound fields */}
      {unmappedInbound.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-chart-warning">Unmapped Inbound Fields ({unmappedInbound.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {unmappedInbound.map((f) => (
                <Badge key={f} variant="outline" className="text-[10px] font-mono border-chart-warning/40 text-chart-warning">{f}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value Mappings Detail */}
      {mappings.filter((m) => getFieldValueMappings(m.id).length > 0).map((m) => {
        const vms = getFieldValueMappings(m.id);
        return (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Value Mappings: {m.eom_field_label}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Inbound Value</TableHead>
                    <TableHead className="text-xs w-8" />
                    <TableHead className="text-xs">EOM Value</TableHead>
                    <TableHead className="text-xs">Match Mode</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vms.map((vm) => (
                    <TableRow key={vm.id}>
                      <TableCell className="text-xs font-mono">{vm.inbound_value}</TableCell>
                      <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                      <TableCell className="text-xs font-medium">{vm.mapped_value}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{vm.match_mode}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{vm.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-medium mt-0.5">{value}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
