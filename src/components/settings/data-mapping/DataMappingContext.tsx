import { createContext, useContext, useState, ReactNode } from "react";
import {
  MappingProfile, FieldMapping, ValueMapping,
  INITIAL_PROFILES, INITIAL_FIELD_MAPPINGS, INITIAL_VALUE_MAPPINGS,
} from "./types";

interface DataMappingContextType {
  profiles: MappingProfile[];
  fieldMappings: FieldMapping[];
  valueMappings: ValueMapping[];
  setProfiles: React.Dispatch<React.SetStateAction<MappingProfile[]>>;
  setFieldMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>;
  setValueMappings: React.Dispatch<React.SetStateAction<ValueMapping[]>>;
  getProfileMappings: (profileId: string) => FieldMapping[];
  getFieldValueMappings: (fieldMappingId: string) => ValueMapping[];
}

const DataMappingContext = createContext<DataMappingContextType | null>(null);

export function DataMappingProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<MappingProfile[]>(INITIAL_PROFILES);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(INITIAL_FIELD_MAPPINGS);
  const [valueMappings, setValueMappings] = useState<ValueMapping[]>(INITIAL_VALUE_MAPPINGS);

  const getProfileMappings = (profileId: string) =>
    fieldMappings.filter((fm) => fm.mapping_profile_id === profileId);

  const getFieldValueMappings = (fieldMappingId: string) =>
    valueMappings.filter((vm) => vm.field_mapping_id === fieldMappingId);

  return (
    <DataMappingContext.Provider
      value={{ profiles, fieldMappings, valueMappings, setProfiles, setFieldMappings, setValueMappings, getProfileMappings, getFieldValueMappings }}
    >
      {children}
    </DataMappingContext.Provider>
  );
}

export function useDataMapping() {
  const ctx = useContext(DataMappingContext);
  if (!ctx) throw new Error("useDataMapping must be used within DataMappingProvider");
  return ctx;
}
