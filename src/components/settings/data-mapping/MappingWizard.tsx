import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Plus, Trash2, Wand2,
  Upload, FileJson, AlertTriangle, X, Sparkles,
} from "lucide-react";
import { useDataMapping } from "./DataMappingContext";
import { useCustomFields } from "@/contexts/CustomFieldsContext";
import type {
  MappingProfile, FieldMapping, ValueMapping, SourceType, TransformType,
  MatchMode, UnmappedFieldHandling, UnmappedValueHandling, EOMField, STANDARD_EOM_FIELDS,
} from "./types";
import { STANDARD_EOM_FIELDS as STD_FIELDS, SOURCE_SYSTEMS } from "./types";

interface Props {
  existingProfile?: MappingProfile;
  onDone: () => void;
  onCancel: () => void;
}

type Step = "basic" | "schema" | "mapping" | "values" | "review";
const STEPS: { key: Step; label: string }[] = [
  { key: "basic", label: "Basic Info" },
  { key: "schema", label: "Inbound Schema" },
  { key: "mapping", label: "Field Mapping" },
  { key: "values", label: "Value Mapping" },
  { key: "review", label: "Review & Save" },
];

export default function MappingWizard({ existingProfile, onDone, onCancel }: Props) {
  const { profiles, setProfiles, fieldMappings, setFieldMappings, valueMappings, setValueMappings, getProfileMappings, getFieldValueMappings } = useDataMapping();
  const { fields: customFields } = useCustomFields();

  const isEdit = !!existingProfile;
  const [step, setStep] = useState<Step>("basic");

  // Step A: Basic Info
  const [name, setName] = useState(existingProfile?.name || "");
  const [description, setDescription] = useState(existingProfile?.description || "");
  const [sourceType, setSourceType] = useState<SourceType>(existingProfile?.source_type || "CSV");
  const [sourceSystem, setSourceSystem] = useState(existingProfile?.source_system_name || "");
  const [isActive, setIsActive] = useState(existingProfile?.is_active ?? true);
  const [unmappedFields, setUnmappedFields] = useState<UnmappedFieldHandling>(existingProfile?.unmapped_field_handling || "ignore");
  const [unmappedValues, setUnmappedValues] = useState<UnmappedValueHandling>(existingProfile?.unmapped_value_handling || "flag_error");
  const [defaultValue, setDefaultValue] = useState(existingProfile?.default_value || "");
  const [allowManyToOne, setAllowManyToOne] = useState(existingProfile?.allow_many_to_one || false);

  // Step B: Inbound Schema
  const [inboundFields, setInboundFields] = useState<string[]>(existingProfile?.inbound_fields || []);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>(existingProfile?.sample_rows || []);
  const [newFieldName, setNewFieldName] = useState("");
  const [jsonSample, setJsonSample] = useState("");
  const [csvText, setCsvText] = useState("");

  // Step C: Field Mappings (local draft)
  const existingMappings = isEdit ? getProfileMappings(existingProfile!.id) : [];
  const [draftMappings, setDraftMappings] = useState<FieldMapping[]>(existingMappings);

  // Step D: Value Mappings (local draft)
  const existingValueMappings = isEdit
    ? existingMappings.flatMap((m) => getFieldValueMappings(m.id))
    : [];
  const [draftValueMappings, setDraftValueMappings] = useState<ValueMapping[]>(existingValueMappings);

  // All EOM fields including custom fields
  const allEOMFields: EOMField[] = useMemo(() => {
    const custom: EOMField[] = customFields.map((cf) => ({
      key: `custom_${cf.id}`,
      label: cf.name,
      category: "Custom Field",
      is_enum: cf.type === "dropdown",
      enum_values: cf.options,
    }));
    return [...STD_FIELDS, ...custom];
  }, [customFields]);

  const currentStepIdx = STEPS.findIndex((s) => s.key === step);

  const goNext = () => {
    if (currentStepIdx < STEPS.length - 1) setStep(STEPS[currentStepIdx + 1].key);
  };
  const goBack = () => {
    if (currentStepIdx > 0) setStep(STEPS[currentStepIdx - 1].key);
  };

  // --- Step B helpers ---
  const addManualField = () => {
    const t = newFieldName.trim();
    if (!t) return;
    if (inboundFields.includes(t)) { toast.error("Field already exists"); return; }
    setInboundFields((prev) => [...prev, t]);
    setNewFieldName("");
  };

  const removeInboundField = (f: string) => {
    setInboundFields((prev) => prev.filter((x) => x !== f));
    setDraftMappings((prev) => prev.filter((m) => m.inbound_field_name !== f));
  };

  const parseJSON = () => {
    try {
      const parsed = JSON.parse(jsonSample);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (typeof obj !== "object" || !obj) throw new Error("Invalid");
      const keys = Object.keys(obj);
      setInboundFields((prev) => [...new Set([...prev, ...keys])]);
      if (Array.isArray(parsed)) {
        setSampleRows(parsed.slice(0, 10).map((r: Record<string, unknown>) => {
          const row: Record<string, string> = {};
          for (const [k, v] of Object.entries(r)) row[k] = String(v ?? "");
          return row;
        }));
      }
      toast.success(`Detected ${keys.length} fields from JSON`);
    } catch {
      toast.error("Invalid JSON. Paste a valid object or array.");
    }
  };

  const parseCSV = () => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 1) { toast.error("Paste CSV with at least a header row"); return; }
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    setInboundFields((prev) => [...new Set([...prev, ...headers])]);
    const rows = lines.slice(1, 11).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ""; });
      return row;
    });
    setSampleRows(rows);
    toast.success(`Detected ${headers.length} fields, ${rows.length} sample rows`);
  };

  // --- Step C helpers ---
  const addMapping = (inboundField: string, eomField: EOMField) => {
    if (!allowManyToOne && draftMappings.some((m) => m.eom_field_key === eomField.key)) {
      toast.error(`"${eomField.label}" is already mapped. Enable many-to-one to allow duplicates.`);
      return;
    }
    const existing = draftMappings.find((m) => m.inbound_field_name === inboundField);
    if (existing) {
      setDraftMappings((prev) =>
        prev.map((m) => m.id === existing.id ? { ...m, eom_field_key: eomField.key, eom_field_label: eomField.label, custom_field_id: eomField.category === "Custom Field" ? eomField.key.replace("custom_", "") : null } : m)
      );
    } else {
      const fm: FieldMapping = {
        id: `fm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        mapping_profile_id: existingProfile?.id || "",
        eom_field_key: eomField.key,
        eom_field_label: eomField.label,
        custom_field_id: eomField.category === "Custom Field" ? eomField.key.replace("custom_", "") : null,
        inbound_field_name: inboundField,
        inbound_field_aliases: [],
        transform_type: "none",
      };
      setDraftMappings((prev) => [...prev, fm]);
    }
  };

  const removeMapping = (id: string) => {
    setDraftMappings((prev) => prev.filter((m) => m.id !== id));
    setDraftValueMappings((prev) => prev.filter((vm) => vm.field_mapping_id !== id));
  };

  const updateMappingTransform = (id: string, transform: TransformType) => {
    setDraftMappings((prev) => prev.map((m) => m.id === id ? { ...m, transform_type: transform } : m));
  };

  const addAlias = (mappingId: string, alias: string) => {
    const t = alias.trim();
    if (!t) return;
    setDraftMappings((prev) =>
      prev.map((m) => m.id === mappingId ? { ...m, inbound_field_aliases: [...new Set([...m.inbound_field_aliases, t])] } : m)
    );
  };

  const removeAlias = (mappingId: string, alias: string) => {
    setDraftMappings((prev) =>
      prev.map((m) => m.id === mappingId ? { ...m, inbound_field_aliases: m.inbound_field_aliases.filter((a) => a !== alias) } : m)
    );
  };

  const autoMapExact = () => {
    let count = 0;
    inboundFields.forEach((inf) => {
      if (draftMappings.some((m) => m.inbound_field_name === inf)) return;
      const match = allEOMFields.find((f) => f.key === inf || f.label.toLowerCase() === inf.toLowerCase() || f.key.replace(/_/g, "").toLowerCase() === inf.replace(/[_\s-]/g, "").toLowerCase());
      if (match) { addMapping(inf, match); count++; }
    });
    toast.success(count > 0 ? `Auto-mapped ${count} fields` : "No exact matches found");
  };

  // --- Step D helpers ---
  const addValueMapping = (fieldMappingId: string, inbound: string, mapped: string, matchMode: MatchMode = "exact") => {
    const vm: ValueMapping = {
      id: `vm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      field_mapping_id: fieldMappingId,
      inbound_value: inbound,
      mapped_value: mapped,
      notes: "",
      match_mode: matchMode,
    };
    setDraftValueMappings((prev) => [...prev, vm]);
  };

  const removeValueMapping = (id: string) => {
    setDraftValueMappings((prev) => prev.filter((vm) => vm.id !== id));
  };

  // --- Save ---
  const handleSave = () => {
    if (!name.trim()) { toast.error("Profile name is required"); setStep("basic"); return; }
    const now = new Date().toISOString().split("T")[0];
    const profileId = existingProfile?.id || `mp-${Date.now()}`;

    const profile: MappingProfile = {
      id: profileId,
      name: name.trim(),
      description: description.trim(),
      source_type: sourceType,
      source_system_name: sourceSystem || "Custom",
      is_active: isActive,
      created_at: existingProfile?.created_at || now,
      updated_at: now,
      unmapped_field_handling: unmappedFields,
      unmapped_value_handling: unmappedValues,
      default_value: defaultValue,
      allow_many_to_one: allowManyToOne,
      inbound_fields: inboundFields,
      sample_rows: sampleRows,
    };

    const finalMappings = draftMappings.map((m) => ({ ...m, mapping_profile_id: profileId }));

    if (isEdit) {
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? profile : p)));
      setFieldMappings((prev) => [...prev.filter((m) => m.mapping_profile_id !== profileId), ...finalMappings]);
      setValueMappings((prev) => {
        const oldFmIds = new Set(existingMappings.map((m) => m.id));
        return [...prev.filter((vm) => !oldFmIds.has(vm.field_mapping_id)), ...draftValueMappings];
      });
      toast.success("Mapping profile updated");
    } else {
      setProfiles((prev) => [...prev, profile]);
      setFieldMappings((prev) => [...prev, ...finalMappings]);
      setValueMappings((prev) => [...prev, ...draftValueMappings]);
      toast.success("Mapping profile created");
    }
    onDone();
  };

  // Unmapped inbound fields
  const mappedInbound = new Set(draftMappings.map((m) => m.inbound_field_name));
  const unmappedInboundFields = inboundFields.filter((f) => !mappedInbound.has(f));

  // Enum-mapped fields (for value mapping step)
  const enumMappedFields = draftMappings.filter((m) => {
    const eom = allEOMFields.find((f) => f.key === m.eom_field_key);
    return eom?.is_enum;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Cancel
        </Button>
        <p className="text-sm font-medium">{isEdit ? "Edit" : "Create"} Mapping Profile</p>
        <div className="w-20" />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <button
              onClick={() => setStep(s.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                step === s.key ? "bg-primary text-primary-foreground" : i < currentStepIdx ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStepIdx ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
            <CardDescription>Configure the profile name, source type, and handling rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Profile Name *</Label>
                <Input placeholder="SAP Obligation Import" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Source System</Label>
                <Select value={sourceSystem} onValueChange={setSourceSystem}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Select system…" /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea placeholder="Describe what this profile maps and when it's used…" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Source Type *</Label>
                <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API">🔌 API</SelectItem>
                    <SelectItem value="CSV">📄 CSV Upload</SelectItem>
                    <SelectItem value="FTP">📁 FTP</SelectItem>
                    <SelectItem value="SFTP">🔒 SFTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label className="text-xs">Active</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
            <Separator />
            <p className="text-xs font-medium">Unmapped Handling</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Unmapped Inbound Fields</Label>
                <Select value={unmappedFields} onValueChange={(v) => setUnmappedFields(v as UnmappedFieldHandling)}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore">Ignore</SelectItem>
                    <SelectItem value="store_raw">Store Raw</SelectItem>
                    <SelectItem value="flag_error">Flag Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unmapped Inbound Values</Label>
                <Select value={unmappedValues} onValueChange={(v) => setUnmappedValues(v as UnmappedValueHandling)}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag_error">Flag Error</SelectItem>
                    <SelectItem value="use_default">Use Default</SelectItem>
                    <SelectItem value="leave_blank">Leave Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {unmappedValues === "use_default" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Default Value</Label>
                <Input placeholder="Enter default…" value={defaultValue} onChange={(e) => setDefaultValue(e.target.value)} />
              </div>
            )}
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-xs font-medium">Allow Many-to-One Mapping</Label>
                <p className="text-[10px] text-muted-foreground">Multiple inbound fields can map to the same EOM field.</p>
              </div>
              <Switch checked={allowManyToOne} onCheckedChange={setAllowManyToOne} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === "schema" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Inbound Schema</CardTitle>
            <CardDescription>
              {sourceType === "API"
                ? "Define inbound field names or paste a JSON sample payload to auto-detect keys."
                : "Upload or paste a sample CSV to auto-detect headers, or add fields manually."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceType === "API" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><FileJson className="h-3.5 w-3.5" /> JSON Sample Payload</Label>
                  <Textarea
                    placeholder={'{\n  "invoiceId": "INV-001",\n  "vendorName": "Acme Corp",\n  "amount": 5000\n}'}
                    value={jsonSample}
                    onChange={(e) => setJsonSample(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={parseJSON} className="gap-1.5">
                    <Wand2 className="h-3.5 w-3.5" /> Detect Fields from JSON
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Paste CSV Content</Label>
                  <Textarea
                    placeholder={"SAP_OBL_ID,OBL_NAME,OBL_TYPE,SAP_STATUS\nS-10001,Well Plug A,ARO,ACTIVE"}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={parseCSV} className="gap-1.5">
                    <Wand2 className="h-3.5 w-3.5" /> Detect Headers from CSV
                  </Button>
                </div>
              </div>
            )}

            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs">Add Field Manually</Label>
              <div className="flex gap-2">
                <Input placeholder="field_name" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="text-xs" onKeyDown={(e) => e.key === "Enter" && addManualField()} />
                <Button size="sm" variant="outline" onClick={addManualField}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </div>

            {inboundFields.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Detected Fields ({inboundFields.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {inboundFields.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px] font-mono gap-1 pr-1">
                      {f}
                      <button onClick={() => removeInboundField(f)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {sampleRows.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Sample Data Preview ({sampleRows.length} rows)</p>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {inboundFields.map((f) => <TableHead key={f} className="text-[10px] whitespace-nowrap">{f}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleRows.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          {inboundFields.map((f) => <TableCell key={f} className="text-[10px] font-mono whitespace-nowrap">{row[f] || ""}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "mapping" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Field Mapping</CardTitle>
                <CardDescription>Start by selecting an inbound field, then choose the EOM field it should populate.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={autoMapExact} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Auto-Map
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current mappings */}
            {draftMappings.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Inbound Field</TableHead>
                      <TableHead className="text-xs w-6" />
                      <TableHead className="text-xs">EOM Field</TableHead>
                      <TableHead className="text-xs">Transform</TableHead>
                      <TableHead className="text-xs">Aliases</TableHead>
                      <TableHead className="text-xs w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftMappings.map((m) => (
                      <MappingRow
                        key={m.id}
                        mapping={m}
                        onUpdateTransform={(t) => updateMappingTransform(m.id, t)}
                        onAddAlias={(a) => addAlias(m.id, a)}
                        onRemoveAlias={(a) => removeAlias(m.id, a)}
                        onRemove={() => removeMapping(m.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Unmapped inbound fields */}
            {unmappedInboundFields.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-chart-warning" />
                  Unmapped Inbound Fields ({unmappedInboundFields.length})
                </p>
                <div className="space-y-1.5">
                  {unmappedInboundFields.map((f) => (
                    <div key={f} className="flex items-center gap-2 rounded-md border border-dashed p-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{f}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Select onValueChange={(val) => {
                        const eom = allEOMFields.find((e) => e.key === val);
                        if (eom) addMapping(f, eom);
                      }}>
                        <SelectTrigger className="h-7 text-[10px] w-48"><SelectValue placeholder="Select EOM field…" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(groupBy(allEOMFields, "category")).map(([cat, fields]) => (
                            <div key={cat}>
                              <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground">{cat}</p>
                              {fields.map((ef) => (
                                <SelectItem key={ef.key} value={ef.key} className="text-xs">{ef.label}</SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inboundFields.length === 0 && draftMappings.length === 0 && (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">No inbound fields detected. Go back to the Schema step to add fields.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "values" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Value Mapping</CardTitle>
            <CardDescription>Translate source values into EOM-ready values automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enumMappedFields.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">No enum/status fields mapped. Value mapping is available for fields with predefined options (Status, Type, Condition, etc.).</p>
              </div>
            ) : (
              enumMappedFields.map((fm) => {
                const eom = allEOMFields.find((f) => f.key === fm.eom_field_key);
                const vms = draftValueMappings.filter((vm) => vm.field_mapping_id === fm.id);
                return (
                  <ValueMappingSection
                    key={fm.id}
                    fieldMapping={fm}
                    eomField={eom!}
                    valueMappings={vms}
                    onAdd={(inb, mapped, mode) => addValueMapping(fm.id, inb, mapped, mode)}
                    onRemove={removeValueMapping}
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Review & Save</CardTitle>
            <CardDescription>Review your mapping profile before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReviewItem label="Profile Name" value={name || "—"} />
              <ReviewItem label="Source" value={`${sourceType} / ${sourceSystem || "Custom"}`} />
              <ReviewItem label="Active" value={isActive ? "Yes" : "No"} />
              <ReviewItem label="Many-to-One" value={allowManyToOne ? "Allowed" : "Not Allowed"} />
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-4 text-center">
              <div><p className="text-lg font-bold">{inboundFields.length}</p><p className="text-[10px] text-muted-foreground uppercase">Inbound Fields</p></div>
              <div><p className="text-lg font-bold">{draftMappings.length}</p><p className="text-[10px] text-muted-foreground uppercase">Mapped</p></div>
              <div><p className="text-lg font-bold">{draftMappings.reduce((s, m) => s + m.inbound_field_aliases.length, 0)}</p><p className="text-[10px] text-muted-foreground uppercase">Aliases</p></div>
              <div><p className="text-lg font-bold">{draftValueMappings.length}</p><p className="text-[10px] text-muted-foreground uppercase">Value Mappings</p></div>
            </div>
            {unmappedInboundFields.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-chart-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs">{unmappedInboundFields.length} inbound field(s) are not mapped. Handling: <strong>{unmappedFields}</strong></p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={currentStepIdx === 0 ? onCancel : goBack}>
          {currentStepIdx === 0 ? "Cancel" : "← Back"}
        </Button>
        {step === "review" ? (
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> {isEdit ? "Save Changes" : "Create Profile"}
          </Button>
        ) : (
          <Button size="sm" onClick={goNext} className="gap-1.5">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function MappingRow({ mapping, onUpdateTransform, onAddAlias, onRemoveAlias, onRemove }: {
  mapping: FieldMapping;
  onUpdateTransform: (t: TransformType) => void;
  onAddAlias: (a: string) => void;
  onRemoveAlias: (a: string) => void;
  onRemove: () => void;
}) {
  const [aliasInput, setAliasInput] = useState("");
  return (
    <TableRow>
      <TableCell className="text-xs font-mono">{mapping.inbound_field_name}</TableCell>
      <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
      <TableCell>
        <p className="text-xs font-medium">{mapping.eom_field_label}</p>
        {mapping.custom_field_id && <Badge variant="outline" className="text-[8px] mt-0.5">Custom</Badge>}
      </TableCell>
      <TableCell>
        <Select value={mapping.transform_type} onValueChange={(v) => onUpdateTransform(v as TransformType)}>
          <SelectTrigger className="h-6 text-[10px] w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="trim">Trim</SelectItem>
            <SelectItem value="uppercase">Uppercase</SelectItem>
            <SelectItem value="lowercase">Lowercase</SelectItem>
            <SelectItem value="date-parse">Date Parse</SelectItem>
            <SelectItem value="number-parse">Number Parse</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1">
          {mapping.inbound_field_aliases.map((a) => (
            <Badge key={a} variant="outline" className="text-[10px] font-mono gap-0.5 pr-0.5">
              {a}
              <button onClick={() => onRemoveAlias(a)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
            </Badge>
          ))}
          <div className="flex items-center gap-0.5">
            <Input
              className="h-5 w-16 text-[10px] px-1"
              placeholder="+ alias"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { onAddAlias(aliasInput); setAliasInput(""); } }}
            />
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">Aliases help when source field names vary between files or systems.</p>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ValueMappingSection({ fieldMapping, eomField, valueMappings, onAdd, onRemove }: {
  fieldMapping: FieldMapping;
  eomField: EOMField;
  valueMappings: ValueMapping[];
  onAdd: (inb: string, mapped: string, mode: MatchMode) => void;
  onRemove: (id: string) => void;
}) {
  const [newInbound, setNewInbound] = useState("");
  const [newMapped, setNewMapped] = useState("");
  const [newMode, setNewMode] = useState<MatchMode>("exact");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const handleAdd = () => {
    if (!newInbound.trim() || !newMapped.trim()) return;
    onAdd(newInbound.trim(), newMapped.trim(), newMode);
    setNewInbound("");
    setNewMapped("");
  };

  const handleBulkAdd = () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    let count = 0;
    lines.forEach((line) => {
      const parts = line.split(/[→=>→\t]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) { onAdd(parts[0], parts[1], "exact"); count++; }
    });
    if (count > 0) { toast.success(`Added ${count} value mappings`); setBulkText(""); setShowBulk(false); }
  };

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium">{fieldMapping.inbound_field_name} → {eomField.label}</p>
          {eomField.enum_values && (
            <div className="flex flex-wrap gap-1 mt-1">
              {eomField.enum_values.map((v) => <Badge key={v} variant="outline" className="text-[10px]">{v}</Badge>)}
            </div>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setShowBulk(!showBulk)} className="text-[10px] h-6">
          {showBulk ? "Single Entry" : "Bulk Entry"}
        </Button>
      </div>

      {valueMappings.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Inbound Value</TableHead>
              <TableHead className="text-[10px] w-6" />
              <TableHead className="text-[10px]">EOM Value</TableHead>
              <TableHead className="text-[10px]">Match</TableHead>
              <TableHead className="text-[10px] w-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {valueMappings.map((vm) => (
              <TableRow key={vm.id}>
                <TableCell className="text-[10px] font-mono">{vm.inbound_value}</TableCell>
                <TableCell><ArrowRight className="h-2.5 w-2.5 text-muted-foreground" /></TableCell>
                <TableCell className="text-[10px] font-medium">{vm.mapped_value}</TableCell>
                <TableCell><Badge variant="outline" className="text-[8px]">{vm.match_mode}</Badge></TableCell>
                <TableCell>
                  <button onClick={() => onRemove(vm.id)} className="text-destructive hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {showBulk ? (
        <div className="space-y-1.5">
          <Textarea
            placeholder={"Excellent → 5\nGood → 4\nFair → 3\nPoor → 2\nBad → 1"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={4}
            className="font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">Enter one mapping per line: inbound_value → eom_value</p>
          <Button size="sm" variant="outline" onClick={handleBulkAdd}>Add All</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input className="h-7 text-[10px] flex-1" placeholder="Inbound value" value={newInbound} onChange={(e) => setNewInbound(e.target.value)} />
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          {eomField.enum_values ? (
            <Select value={newMapped} onValueChange={setNewMapped}>
              <SelectTrigger className="h-7 text-[10px] flex-1"><SelectValue placeholder="EOM value" /></SelectTrigger>
              <SelectContent>
                {eomField.enum_values.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input className="h-7 text-[10px] flex-1" placeholder="EOM value" value={newMapped} onChange={(e) => setNewMapped(e.target.value)} />
          )}
          <Select value={newMode} onValueChange={(v) => setNewMode(v as MatchMode)}>
            <SelectTrigger className="h-7 text-[10px] w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="exact">Exact</SelectItem>
              <SelectItem value="case-insensitive">Case-insensitive</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-7" onClick={handleAdd}><Plus className="h-3 w-3" /></Button>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-medium mt-0.5">{value}</p>
    </div>
  );
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
