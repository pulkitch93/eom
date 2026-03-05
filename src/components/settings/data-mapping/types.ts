export type SourceType = "API" | "CSV" | "FTP" | "SFTP";
export type TransformType = "none" | "trim" | "uppercase" | "lowercase" | "date-parse" | "number-parse";
export type MatchMode = "exact" | "case-insensitive" | "contains";
export type UnmappedFieldHandling = "ignore" | "store_raw" | "flag_error";
export type UnmappedValueHandling = "flag_error" | "use_default" | "leave_blank";

export interface MappingProfile {
  id: string;
  name: string;
  description: string;
  source_type: SourceType;
  source_system_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unmapped_field_handling: UnmappedFieldHandling;
  unmapped_value_handling: UnmappedValueHandling;
  default_value: string;
  allow_many_to_one: boolean;
  inbound_fields: string[];
  sample_rows: Record<string, string>[];
}

export interface FieldMapping {
  id: string;
  mapping_profile_id: string;
  eom_field_key: string;
  eom_field_label: string;
  custom_field_id: string | null;
  inbound_field_name: string;
  inbound_field_aliases: string[];
  transform_type: TransformType;
}

export interface ValueMapping {
  id: string;
  field_mapping_id: string;
  inbound_value: string;
  mapped_value: string;
  notes: string;
  match_mode: MatchMode;
}

// Standard EOM fields available for mapping
export interface EOMField {
  key: string;
  label: string;
  category: string;
  is_enum: boolean;
  enum_values?: string[];
}

export const STANDARD_EOM_FIELDS: EOMField[] = [
  // Obligation fields
  { key: "obligation_id", label: "Obligation ID", category: "Obligation", is_enum: false },
  { key: "obligation_name", label: "Obligation Name", category: "Obligation", is_enum: false },
  { key: "obligation_type", label: "Obligation Type", category: "Obligation", is_enum: true, enum_values: ["ARO", "ERO"] },
  { key: "obligation_status", label: "Status", category: "Obligation", is_enum: true, enum_values: ["Active", "Under Review", "Pending", "Settled"] },
  { key: "obligation_description", label: "Description", category: "Obligation", is_enum: false },
  { key: "initial_estimate", label: "Initial Estimate", category: "Obligation", is_enum: false },
  { key: "current_liability", label: "Current Liability", category: "Obligation", is_enum: false },
  { key: "discount_rate", label: "Discount Rate", category: "Obligation", is_enum: false },
  { key: "accretion_expense", label: "Accretion Expense", category: "Obligation", is_enum: false },
  { key: "target_settlement_date", label: "Target Settlement Date", category: "Obligation", is_enum: false },
  { key: "created_date", label: "Created Date", category: "Obligation", is_enum: false },
  // Site fields
  { key: "site_name", label: "Site Name", category: "Site", is_enum: false },
  { key: "site_region", label: "Region", category: "Site", is_enum: false },
  { key: "site_address", label: "Address", category: "Site", is_enum: false },
  { key: "site_type", label: "Site Type", category: "Site", is_enum: true, enum_values: ["Production", "Processing", "Pipeline", "Terminal", "Refinery", "Storage", "Well Pad"] },
  { key: "operating_status", label: "Operating Status", category: "Site", is_enum: true, enum_values: ["Active", "Idle", "Decommissioned", "Plugged & Abandoned"] },
  { key: "compliance_status", label: "Compliance Status", category: "Site", is_enum: true, enum_values: ["Compliant", "Non-Compliant", "Under Investigation", "Pending Review"] },
  { key: "regulatory_agency", label: "Regulatory Agency", category: "Site", is_enum: false },
  // Asset fields
  { key: "asset_name", label: "Asset Name", category: "Asset", is_enum: false },
  { key: "asset_type", label: "Asset Type", category: "Asset", is_enum: false },
  { key: "asset_condition", label: "Condition", category: "Asset", is_enum: true, enum_values: ["Good", "Fair", "Poor", "Decommissioned"] },
  { key: "net_book_value", label: "Net Book Value", category: "Asset", is_enum: false },
  { key: "useful_life_years", label: "Useful Life (Years)", category: "Asset", is_enum: false },
  { key: "remaining_life_years", label: "Remaining Life (Years)", category: "Asset", is_enum: false },
  // Invoice fields
  { key: "invoice_number", label: "Invoice Number", category: "Invoice", is_enum: false },
  { key: "vendor_name", label: "Vendor Name", category: "Invoice", is_enum: false },
  { key: "invoice_date", label: "Invoice Date", category: "Invoice", is_enum: false },
  { key: "invoice_amount", label: "Amount", category: "Invoice", is_enum: false },
  { key: "invoice_currency", label: "Currency", category: "Invoice", is_enum: true, enum_values: ["USD", "EUR", "GBP", "CAD"] },
  { key: "po_number", label: "PO Number", category: "Invoice", is_enum: false },
  { key: "work_order", label: "Work Order / Project Code", category: "Invoice", is_enum: false },
];

export const SOURCE_SYSTEMS = ["NetSuite", "SAP", "Oracle", "Workday", "QuickBooks", "Custom"];

// Initial mock profiles
export const INITIAL_PROFILES: MappingProfile[] = [
  {
    id: "mp-1",
    name: "SAP Obligation Import",
    description: "Maps obligation data from SAP ERP export files to EOM obligation fields.",
    source_type: "CSV",
    source_system_name: "SAP",
    is_active: true,
    created_at: "2026-01-15",
    updated_at: "2026-02-28",
    unmapped_field_handling: "ignore",
    unmapped_value_handling: "flag_error",
    default_value: "",
    allow_many_to_one: false,
    inbound_fields: ["SAP_OBL_ID", "OBL_NAME", "OBL_TYPE", "SAP_STATUS", "SITE_NM", "INIT_AMT", "CURR_AMT", "DISC_RT", "ACCR_EXP", "SETTLE_DT"],
    sample_rows: [
      { SAP_OBL_ID: "S-10001", OBL_NAME: "Well Plug A", OBL_TYPE: "ARO", SAP_STATUS: "ACTIVE", SITE_NM: "Eagle Ford Alpha", INIT_AMT: "450000", CURR_AMT: "523000", DISC_RT: "0.05", ACCR_EXP: "26150", SETTLE_DT: "2032-06-30" },
      { SAP_OBL_ID: "S-10002", OBL_NAME: "Tank Removal B", OBL_TYPE: "ARO", SAP_STATUS: "REVIEW", SITE_NM: "Permian Basin Delta", INIT_AMT: "320000", CURR_AMT: "368000", DISC_RT: "0.045", ACCR_EXP: "16560", SETTLE_DT: "2029-12-31" },
    ],
  },
  {
    id: "mp-2",
    name: "NetSuite API Sync",
    description: "Real-time sync of invoice and vendor data from NetSuite via REST API.",
    source_type: "API",
    source_system_name: "NetSuite",
    is_active: true,
    created_at: "2026-02-01",
    updated_at: "2026-03-01",
    unmapped_field_handling: "store_raw",
    unmapped_value_handling: "leave_blank",
    default_value: "",
    allow_many_to_one: true,
    inbound_fields: ["invoiceId", "vendorName", "invoiceDate", "totalAmount", "currencyCode", "purchaseOrder", "projectCode"],
    sample_rows: [],
  },
];

export const INITIAL_FIELD_MAPPINGS: FieldMapping[] = [
  { id: "fm-1", mapping_profile_id: "mp-1", eom_field_key: "obligation_id", eom_field_label: "Obligation ID", custom_field_id: null, inbound_field_name: "SAP_OBL_ID", inbound_field_aliases: ["sap_id", "SAP_ID"], transform_type: "trim" },
  { id: "fm-2", mapping_profile_id: "mp-1", eom_field_key: "obligation_name", eom_field_label: "Obligation Name", custom_field_id: null, inbound_field_name: "OBL_NAME", inbound_field_aliases: ["name", "obligation_name"], transform_type: "trim" },
  { id: "fm-3", mapping_profile_id: "mp-1", eom_field_key: "obligation_type", eom_field_label: "Obligation Type", custom_field_id: null, inbound_field_name: "OBL_TYPE", inbound_field_aliases: ["type"], transform_type: "uppercase" },
  { id: "fm-4", mapping_profile_id: "mp-1", eom_field_key: "obligation_status", eom_field_label: "Status", custom_field_id: null, inbound_field_name: "SAP_STATUS", inbound_field_aliases: ["status", "STATUS"], transform_type: "none" },
  { id: "fm-5", mapping_profile_id: "mp-1", eom_field_key: "site_name", eom_field_label: "Site Name", custom_field_id: null, inbound_field_name: "SITE_NM", inbound_field_aliases: ["site", "site_name"], transform_type: "trim" },
  { id: "fm-6", mapping_profile_id: "mp-1", eom_field_key: "initial_estimate", eom_field_label: "Initial Estimate", custom_field_id: null, inbound_field_name: "INIT_AMT", inbound_field_aliases: ["initial_amount"], transform_type: "number-parse" },
  { id: "fm-7", mapping_profile_id: "mp-2", eom_field_key: "invoice_number", eom_field_label: "Invoice Number", custom_field_id: null, inbound_field_name: "invoiceId", inbound_field_aliases: ["inv_id", "invoice_id"], transform_type: "trim" },
  { id: "fm-8", mapping_profile_id: "mp-2", eom_field_key: "vendor_name", eom_field_label: "Vendor Name", custom_field_id: null, inbound_field_name: "vendorName", inbound_field_aliases: ["vendor", "supplier"], transform_type: "trim" },
];

export const INITIAL_VALUE_MAPPINGS: ValueMapping[] = [
  { id: "vm-1", field_mapping_id: "fm-4", inbound_value: "ACTIVE", mapped_value: "Active", notes: "", match_mode: "case-insensitive" },
  { id: "vm-2", field_mapping_id: "fm-4", inbound_value: "REVIEW", mapped_value: "Under Review", notes: "SAP uses REVIEW shorthand", match_mode: "case-insensitive" },
  { id: "vm-3", field_mapping_id: "fm-4", inbound_value: "PEND", mapped_value: "Pending", notes: "", match_mode: "case-insensitive" },
  { id: "vm-4", field_mapping_id: "fm-4", inbound_value: "SETTLED", mapped_value: "Settled", notes: "", match_mode: "case-insensitive" },
  { id: "vm-5", field_mapping_id: "fm-4", inbound_value: "CLOSED", mapped_value: "Settled", notes: "SAP CLOSED maps to Settled", match_mode: "case-insensitive" },
];
