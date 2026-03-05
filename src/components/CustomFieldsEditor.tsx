import { useCustomFields } from "@/contexts/CustomFieldsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CustomFieldsEditorProps {
  recordId: string;
  readOnly?: boolean;
}

export default function CustomFieldsEditor({ recordId, readOnly = false }: CustomFieldsEditorProps) {
  const { fields, getValues, setValue } = useCustomFields();
  const values = getValues(recordId);

  if (fields.length === 0) return null;

  return (
    <div className="pt-3 border-t space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Fields</p>
        <Badge variant="outline" className="text-[10px] h-4">{fields.length}</Badge>
      </div>
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            {field.name}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {readOnly ? (
            <p className="text-sm font-medium">{values[field.id] || <span className="text-muted-foreground italic">Not set</span>}</p>
          ) : field.type === "text" ? (
            <Input
              className="h-8 text-xs"
              placeholder={`Enter ${field.name.toLowerCase()}…`}
              value={values[field.id] || ""}
              onChange={(e) => setValue(recordId, field.id, e.target.value)}
            />
          ) : (
            <Select
              value={values[field.id] || ""}
              onValueChange={(v) => setValue(recordId, field.id, v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={`Select ${field.name.toLowerCase()}…`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
    </div>
  );
}
