import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Type, ChevronDown, CheckCircle2 } from "lucide-react";

interface CustomField {
  id: string;
  name: string;
  type: "text" | "dropdown";
  required: boolean;
  options?: string[];
  createdAt: string;
}

const INITIAL_FIELDS: CustomField[] = [
  { id: "cf-1", name: "Permit Number", type: "text", required: true, createdAt: "2026-02-10" },
  { id: "cf-2", name: "Risk Category", type: "dropdown", required: false, options: ["Low", "Medium", "High", "Critical"], createdAt: "2026-02-15" },
  { id: "cf-3", name: "Regulatory Region", type: "dropdown", required: true, options: ["US Federal", "US State", "EU", "UK", "Canada"], createdAt: "2026-03-01" },
];

export default function CustomFieldsManager() {
  const [fields, setFields] = useState<CustomField[]>(INITIAL_FIELDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  // Form state
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<"text" | "dropdown">("text");
  const [required, setRequired] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState("");

  const resetForm = () => {
    setFieldName("");
    setFieldType("text");
    setRequired(false);
    setDropdownOptions("");
    setEditingField(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (field: CustomField) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldType(field.type);
    setRequired(field.required);
    setDropdownOptions(field.options?.join("\n") ?? "");
    setDialogOpen(true);
  };

  const handleSave = () => {
    const trimmedName = fieldName.trim();
    if (!trimmedName) {
      toast.error("Field name is required");
      return;
    }
    if (trimmedName.length > 100) {
      toast.error("Field name must be less than 100 characters");
      return;
    }

    const options =
      fieldType === "dropdown"
        ? dropdownOptions
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    if (fieldType === "dropdown" && (!options || options.length < 2)) {
      toast.error("Dropdown fields require at least 2 options");
      return;
    }

    if (editingField) {
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingField.id
            ? { ...f, name: trimmedName, type: fieldType, required, options }
            : f
        )
      );
      toast.success("Custom field updated");
    } else {
      const newField: CustomField = {
        id: `cf-${Date.now()}`,
        name: trimmedName,
        type: fieldType,
        required,
        options,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setFields((prev) => [...prev, newField]);
      toast.success(
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Custom field created
          </div>
          <p className="text-xs text-muted-foreground">
            You can manage or edit this field anytime in Settings → Custom Fields.
          </p>
        </div>
      );
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast.success("Custom field removed");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Custom Fields</CardTitle>
            <CardDescription>
              Add fields to capture the information your team cares about. Choose whether it's free text or fixed values.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">No custom fields yet. Click "Add Field" to create one.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Field Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{field.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 text-xs font-normal">
                          {field.type === "text" ? (
                            <><Type className="h-3 w-3" /> Free Text</>
                          ) : (
                            <><ChevronDown className="h-3 w-3" /> Dropdown</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <Badge variant="default" className="text-xs font-normal">Yes</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {field.options ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options.slice(0, 3).map((opt) => (
                              <Badge key={opt} variant="outline" className="text-xs font-normal">
                                {opt}
                              </Badge>
                            ))}
                            {field.options.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{field.options.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(field)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(field.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit Custom Field" : "Create Custom Field"}</DialogTitle>
            <DialogDescription>
              Define a new field that admins can add to records across the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Field Name</Label>
              <Input
                placeholder="Permit Number"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">The label users will see when filling out this field.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Field Type</Label>
              <Select value={fieldType} onValueChange={(v) => setFieldType(v as "text" | "dropdown")}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <span className="flex items-center gap-2"><Type className="h-3.5 w-3.5" /> Free Text</span>
                  </SelectItem>
                  <SelectItem value="dropdown">
                    <span className="flex items-center gap-2"><ChevronDown className="h-3.5 w-3.5" /> Dropdown (Fixed Values)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {fieldType === "text"
                  ? "Users can enter any value."
                  : "Users select from predefined options."}
              </p>
            </div>

            {fieldType === "dropdown" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Dropdown Options</Label>
                <Textarea
                  placeholder={"Option 1\nOption 2\nOption 3"}
                  value={dropdownOptions}
                  onChange={(e) => setDropdownOptions(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Enter one option per line.</p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">Required Field</Label>
                <p className="text-xs text-muted-foreground">Users must complete this field before saving.</p>
              </div>
              <Switch checked={required} onCheckedChange={setRequired} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleSave}>
              {editingField ? "Save Changes" : "Create Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
