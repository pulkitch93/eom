import { createContext, useContext, useState, ReactNode } from "react";

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "dropdown";
  required: boolean;
  options?: string[];
  createdAt: string;
}

export interface CustomFieldValues {
  [recordId: string]: { [fieldId: string]: string };
}

interface CustomFieldsContextType {
  fields: CustomField[];
  setFields: React.Dispatch<React.SetStateAction<CustomField[]>>;
  values: CustomFieldValues;
  setValue: (recordId: string, fieldId: string, value: string) => void;
  getValues: (recordId: string) => Record<string, string>;
}

const INITIAL_FIELDS: CustomField[] = [
  { id: "cf-1", name: "Permit Number", type: "text", required: true, createdAt: "2026-02-10" },
  { id: "cf-2", name: "Risk Category", type: "dropdown", required: false, options: ["Low", "Medium", "High", "Critical"], createdAt: "2026-02-15" },
  { id: "cf-3", name: "Regulatory Region", type: "dropdown", required: true, options: ["US Federal", "US State", "EU", "UK", "Canada"], createdAt: "2026-03-01" },
];

// Seed some demo values for existing obligations
const INITIAL_VALUES: CustomFieldValues = {
  "OBL-001": { "cf-1": "PRM-2024-0451", "cf-2": "High", "cf-3": "US Federal" },
  "OBL-002": { "cf-1": "PRM-2024-0783", "cf-3": "US State" },
  "OBL-005": { "cf-2": "Critical", "cf-3": "US Federal" },
};

const CustomFieldsContext = createContext<CustomFieldsContextType | null>(null);

export function CustomFieldsProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<CustomField[]>(INITIAL_FIELDS);
  const [values, setValues] = useState<CustomFieldValues>(INITIAL_VALUES);

  const setValue = (recordId: string, fieldId: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [recordId]: { ...prev[recordId], [fieldId]: value },
    }));
  };

  const getValues = (recordId: string) => values[recordId] || {};

  return (
    <CustomFieldsContext.Provider value={{ fields, setFields, values, setValue, getValues }}>
      {children}
    </CustomFieldsContext.Provider>
  );
}

export function useCustomFields() {
  const ctx = useContext(CustomFieldsContext);
  if (!ctx) throw new Error("useCustomFields must be used within CustomFieldsProvider");
  return ctx;
}
