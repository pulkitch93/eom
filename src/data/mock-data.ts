// ============================================================
// Mock data for Environmental Obligation Management Platform
// ============================================================

export type ObligationType = "ARO" | "ERO";
export type ObligationStatus = "Active" | "Under Review" | "Settled" | "Pending";
export type RemediationPhase = "Assessment" | "Planning" | "Active Remediation" | "Monitoring" | "Closure";
export type AssetCondition = "Good" | "Fair" | "Poor" | "Decommissioned";
export type ComplianceStatus = "Compliant" | "Non-Compliant" | "Under Investigation" | "Pending Review";
export type ExposureRiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface SiteContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Site {
  id: string;
  name: string;
  region: string;
  // Site-level data capture
  address: string;
  latitude: number;
  longitude: number;
  siteType: string;
  operatingStatus: string;
  complianceStatus: ComplianceStatus;
  lastInspectionDate: string;
  nextInspectionDate: string;
  regulatoryAgency: string;
  permitNumbers: string[];
  totalAcreage: number;
  siteContacts: SiteContact[];
  notes: string;
  facilities: Facility[];
}

export interface Facility {
  id: string;
  name: string;
  siteId: string;
  assets: Asset[];
}

export interface Asset {
  id: string;
  name: string;
  facilityId: string;
  // Asset-level fields
  assetType: string;
  installDate: string;
  condition: AssetCondition;
  usefulLifeYears: number;
  remainingLifeYears: number;
  originalCost: number;
  netBookValue: number;
  lastMaintenanceDate: string;
  regulatoryCategory: string;
}

export interface EnvironmentalExposure {
  id: string;
  siteId: string;
  siteName: string;
  obligationId?: string;
  obligationName?: string;
  contaminantType: string;
  mediaAffected: string[]; // soil, groundwater, surface water, air
  exposureArea: number; // acres
  riskLevel: ExposureRiskLevel;
  estimatedCleanupCost: number;
  regulatoryDriver: string;
  discoveryDate: string;
  reportingDeadline: string;
  monitoringFrequency: string;
  lastSampleDate: string;
  exceedanceCount: number;
  maxConcentration: string;
  regulatoryLimit: string;
  status: "Open" | "Monitoring" | "Remediation" | "Closed";
  notes: string;
}

export interface AROTrackingEntry {
  obligationId: string;
  obligationName: string;
  assetName: string;
  siteName: string;
  fairValue: number;
  initialEstimate: number;
  currentLiability: number;
  accretionExpense: number;
  cumulativeAccretion: number;
  revisionImpact: number;
  discountRate: number;
  retirementDate: string;
  yearsRemaining: number;
  settlementProgress: number; // percent of funds set aside
  lastReviewDate: string;
  nextReviewDate: string;
  reviewNotes: string;
}

export interface Obligation {
  id: string;
  name: string;
  type: ObligationType;
  siteId: string;
  siteName: string;
  facilityId: string;
  facilityName: string;
  assetId?: string;
  assetName?: string;
  status: ObligationStatus;
  initialEstimate: number;
  currentLiability: number;
  discountRate: number;
  accretionExpense: number;
  createdDate: string;
  targetSettlementDate: string;
  description: string;
  // ERO-specific
  remediationPhase?: RemediationPhase;
  contaminantType?: string;
  regulatoryDeadline?: string;
  remediationProgress?: number;
  // ARO-specific
  fairValue?: number;
  revisionImpact?: number;
}

export interface ActivityItem {
  id: string;
  date: string;
  action: string;
  obligationId: string;
  obligationName: string;
  type: ObligationType;
}

// -- Sites & Hierarchy --
export const sites: Site[] = [
  {
    id: "S001", name: "Eagle Ford Basin", region: "Texas",
    address: "1200 County Road 45, Karnes City, TX 78118",
    latitude: 28.8853, longitude: -97.9006,
    siteType: "Production & Processing",
    operatingStatus: "Active Operations",
    complianceStatus: "Compliant",
    lastInspectionDate: "2025-11-15",
    nextInspectionDate: "2026-05-15",
    regulatoryAgency: "Texas Railroad Commission (RRC)",
    permitNumbers: ["RRC-45892", "TCEQ-WQ0015234"],
    totalAcreage: 2400,
    siteContacts: [
      { name: "Mark Henderson", role: "Site Manager", email: "m.henderson@eom.com", phone: "(361) 555-0142" },
      { name: "Sarah Chen", role: "Environmental Lead", email: "s.chen@eom.com", phone: "(361) 555-0198" },
    ],
    notes: "Primary production site. Two wellpads and one processing facility. Active soil remediation near tank farm.",
    facilities: [
      { id: "F001", name: "Processing Plant Alpha", siteId: "S001", assets: [
        { id: "A001", name: "Storage Tank Farm", facilityId: "F001", assetType: "Storage", installDate: "2012-06-15", condition: "Fair", usefulLifeYears: 30, remainingLifeYears: 16, originalCost: 8500000, netBookValue: 4250000, lastMaintenanceDate: "2025-09-20", regulatoryCategory: "Aboveground Storage" },
        { id: "A002", name: "Pipeline Network A", facilityId: "F001", assetType: "Pipeline", installDate: "2013-03-01", condition: "Good", usefulLifeYears: 35, remainingLifeYears: 22, originalCost: 12000000, netBookValue: 7500000, lastMaintenanceDate: "2025-11-10", regulatoryCategory: "Gathering Pipeline" },
      ]},
      { id: "F002", name: "Wellpad Cluster B", siteId: "S001", assets: [
        { id: "A003", name: "Well B-1", facilityId: "F002", assetType: "Well", installDate: "2015-08-20", condition: "Fair", usefulLifeYears: 20, remainingLifeYears: 9, originalCost: 4200000, netBookValue: 1890000, lastMaintenanceDate: "2025-06-15", regulatoryCategory: "Oil & Gas Well" },
        { id: "A004", name: "Well B-2", facilityId: "F002", assetType: "Well", installDate: "2015-08-20", condition: "Good", usefulLifeYears: 20, remainingLifeYears: 10, originalCost: 4000000, netBookValue: 2000000, lastMaintenanceDate: "2025-07-22", regulatoryCategory: "Oil & Gas Well" },
      ]},
    ],
  },
  {
    id: "S002", name: "Permian Basin", region: "New Mexico",
    address: "8900 State Hwy 128, Jal, NM 88252",
    latitude: 32.1127, longitude: -103.1938,
    siteType: "Gathering & Disposal",
    operatingStatus: "Active Operations",
    complianceStatus: "Under Investigation",
    lastInspectionDate: "2025-09-22",
    nextInspectionDate: "2026-03-22",
    regulatoryAgency: "NM Energy, Minerals & Natural Resources Dept",
    permitNumbers: ["NMOCD-28471", "NMED-GW-2024-015"],
    totalAcreage: 1800,
    siteContacts: [
      { name: "James Rodriguez", role: "Site Manager", email: "j.rodriguez@eom.com", phone: "(575) 555-0231" },
      { name: "Lisa Patel", role: "Compliance Officer", email: "l.patel@eom.com", phone: "(575) 555-0265" },
    ],
    notes: "Under investigation for groundwater impacts near evaporation pond. Enhanced monitoring in place.",
    facilities: [
      { id: "F003", name: "Gathering Station C", siteId: "S002", assets: [
        { id: "A005", name: "Compressor Station", facilityId: "F003", assetType: "Compression", installDate: "2010-04-10", condition: "Fair", usefulLifeYears: 25, remainingLifeYears: 9, originalCost: 6500000, netBookValue: 2340000, lastMaintenanceDate: "2025-10-05", regulatoryCategory: "Compression Facility" },
      ]},
      { id: "F004", name: "Disposal Facility D", siteId: "S002", assets: [
        { id: "A006", name: "Injection Well D-1", facilityId: "F004", assetType: "Well", installDate: "2016-11-01", condition: "Good", usefulLifeYears: 30, remainingLifeYears: 21, originalCost: 3200000, netBookValue: 2240000, lastMaintenanceDate: "2025-08-18", regulatoryCategory: "Class II Injection Well" },
        { id: "A007", name: "Evaporation Pond", facilityId: "F004", assetType: "Impoundment", installDate: "2014-07-15", condition: "Poor", usefulLifeYears: 20, remainingLifeYears: 8, originalCost: 1800000, netBookValue: 540000, lastMaintenanceDate: "2025-12-01", regulatoryCategory: "Surface Impoundment" },
      ]},
    ],
  },
  {
    id: "S003", name: "Appalachian Basin", region: "Pennsylvania",
    address: "450 Industrial Park Rd, Washington, PA 15301",
    latitude: 40.1742, longitude: -80.2462,
    siteType: "Processing",
    operatingStatus: "Active Operations",
    complianceStatus: "Compliant",
    lastInspectionDate: "2025-10-08",
    nextInspectionDate: "2026-04-08",
    regulatoryAgency: "PA DEP",
    permitNumbers: ["DEP-25-0034", "DEP-GP-5A-2023"],
    totalAcreage: 950,
    siteContacts: [
      { name: "Tom Williams", role: "Site Manager", email: "t.williams@eom.com", phone: "(724) 555-0178" },
    ],
    notes: "Active groundwater treatment system for chlorinated solvents. Quarterly reporting to PA DEP.",
    facilities: [
      { id: "F005", name: "Processing Plant Gamma", siteId: "S003", assets: [
        { id: "A008", name: "Fractionation Unit", facilityId: "F005", assetType: "Processing", installDate: "2014-09-01", condition: "Good", usefulLifeYears: 25, remainingLifeYears: 13, originalCost: 15000000, netBookValue: 7800000, lastMaintenanceDate: "2025-11-30", regulatoryCategory: "NGL Processing" },
        { id: "A009", name: "Pipeline Network G", facilityId: "F005", assetType: "Pipeline", installDate: "2011-05-20", condition: "Decommissioned", usefulLifeYears: 30, remainingLifeYears: 0, originalCost: 8000000, netBookValue: 0, lastMaintenanceDate: "2024-06-30", regulatoryCategory: "Gathering Pipeline" },
      ]},
    ],
  },
  {
    id: "S004", name: "Gulf Coast Terminal", region: "Louisiana",
    address: "2100 River Road, Port Allen, LA 70767",
    latitude: 30.4515, longitude: -91.2100,
    siteType: "Terminal & Marine",
    operatingStatus: "Active Operations",
    complianceStatus: "Pending Review",
    lastInspectionDate: "2025-08-12",
    nextInspectionDate: "2026-02-28",
    regulatoryAgency: "Louisiana DENR / USCG",
    permitNumbers: ["LDEQ-AI-2023-0892", "USCG-COC-4521"],
    totalAcreage: 450,
    siteContacts: [
      { name: "Angela Foster", role: "Terminal Manager", email: "a.foster@eom.com", phone: "(225) 555-0312" },
      { name: "David Kim", role: "Environmental Specialist", email: "d.kim@eom.com", phone: "(225) 555-0348" },
    ],
    notes: "Marine terminal with legacy petroleum contamination. Upcoming regulatory review for tank battery area.",
    facilities: [
      { id: "F006", name: "Marine Terminal", siteId: "S004", assets: [
        { id: "A010", name: "Loading Dock 1", facilityId: "F006", assetType: "Marine", installDate: "2008-03-15", condition: "Fair", usefulLifeYears: 35, remainingLifeYears: 17, originalCost: 22000000, netBookValue: 11000000, lastMaintenanceDate: "2025-10-20", regulatoryCategory: "Marine Loading Facility" },
        { id: "A011", name: "Tank Battery", facilityId: "F006", assetType: "Storage", installDate: "2010-09-01", condition: "Poor", usefulLifeYears: 30, remainingLifeYears: 14, originalCost: 9500000, netBookValue: 4275000, lastMaintenanceDate: "2025-07-15", regulatoryCategory: "Aboveground Storage" },
      ]},
    ],
  },
];

// -- Obligations --
export const obligations: Obligation[] = [
  {
    id: "OBL-001", name: "Tank Farm Decommissioning", type: "ARO",
    siteId: "S001", siteName: "Eagle Ford Basin", facilityId: "F001", facilityName: "Processing Plant Alpha",
    assetId: "A001", assetName: "Storage Tank Farm",
    status: "Active", initialEstimate: 2400000, currentLiability: 2847000, discountRate: 0.055,
    accretionExpense: 156585, createdDate: "2019-03-15", targetSettlementDate: "2035-12-31",
    description: "Full decommissioning and site restoration of 12-tank storage facility.",
    fairValue: 2847000, revisionImpact: 125000,
  },
  {
    id: "OBL-002", name: "Pipeline Abandonment", type: "ARO",
    siteId: "S001", siteName: "Eagle Ford Basin", facilityId: "F001", facilityName: "Processing Plant Alpha",
    assetId: "A002", assetName: "Pipeline Network A",
    status: "Active", initialEstimate: 1800000, currentLiability: 2103000, discountRate: 0.05,
    accretionExpense: 105150, createdDate: "2020-01-10", targetSettlementDate: "2038-06-30",
    description: "Abandonment and purging of 45-mile pipeline network per PHMSA regulations.",
    fairValue: 2103000, revisionImpact: -50000,
  },
  {
    id: "OBL-003", name: "Well B-1 Plugging", type: "ARO",
    siteId: "S001", siteName: "Eagle Ford Basin", facilityId: "F002", facilityName: "Wellpad Cluster B",
    assetId: "A003", assetName: "Well B-1",
    status: "Under Review", initialEstimate: 350000, currentLiability: 412000, discountRate: 0.06,
    accretionExpense: 24720, createdDate: "2021-06-20", targetSettlementDate: "2030-03-31",
    description: "Plug and abandonment of horizontal well per Railroad Commission requirements.",
    fairValue: 412000, revisionImpact: 30000,
  },
  {
    id: "OBL-004", name: "Well B-2 Plugging", type: "ARO",
    siteId: "S001", siteName: "Eagle Ford Basin", facilityId: "F002", facilityName: "Wellpad Cluster B",
    assetId: "A004", assetName: "Well B-2",
    status: "Active", initialEstimate: 320000, currentLiability: 375000, discountRate: 0.06,
    accretionExpense: 22500, createdDate: "2021-06-20", targetSettlementDate: "2031-12-31",
    description: "Plug and abandonment of horizontal well.",
    fairValue: 375000, revisionImpact: 0,
  },
  {
    id: "OBL-005", name: "Compressor Removal", type: "ARO",
    siteId: "S002", siteName: "Permian Basin", facilityId: "F003", facilityName: "Gathering Station C",
    assetId: "A005", assetName: "Compressor Station",
    status: "Active", initialEstimate: 900000, currentLiability: 1050000, discountRate: 0.05,
    accretionExpense: 52500, createdDate: "2018-09-01", targetSettlementDate: "2033-09-30",
    description: "Removal and site restoration of 3-unit compressor station.",
    fairValue: 1050000, revisionImpact: 75000,
  },
  {
    id: "OBL-006", name: "Injection Well Closure", type: "ARO",
    siteId: "S002", siteName: "Permian Basin", facilityId: "F004", facilityName: "Disposal Facility D",
    assetId: "A006", assetName: "Injection Well D-1",
    status: "Pending", initialEstimate: 500000, currentLiability: 560000, discountRate: 0.055,
    accretionExpense: 30800, createdDate: "2022-02-15", targetSettlementDate: "2040-06-30",
    description: "Closure and post-closure monitoring of Class II injection well.",
    fairValue: 560000, revisionImpact: 0,
  },
  // ERO obligations
  {
    id: "OBL-007", name: "Pond Remediation", type: "ERO",
    siteId: "S002", siteName: "Permian Basin", facilityId: "F004", facilityName: "Disposal Facility D",
    assetId: "A007", assetName: "Evaporation Pond",
    status: "Active", initialEstimate: 1200000, currentLiability: 1380000, discountRate: 0.045,
    accretionExpense: 62100, createdDate: "2020-04-10", targetSettlementDate: "2029-12-31",
    description: "Remediation of produced water evaporation pond including soil removal and groundwater monitoring.",
    remediationPhase: "Active Remediation", contaminantType: "Produced Water / Hydrocarbons",
    regulatoryDeadline: "2030-06-30", remediationProgress: 45,
  },
  {
    id: "OBL-008", name: "Soil Contamination Cleanup", type: "ERO",
    siteId: "S001", siteName: "Eagle Ford Basin", facilityId: "F001", facilityName: "Processing Plant Alpha",
    status: "Active", initialEstimate: 800000, currentLiability: 920000, discountRate: 0.05,
    accretionExpense: 46000, createdDate: "2021-08-22", targetSettlementDate: "2028-06-30",
    description: "Remediation of hydrocarbon-impacted soils near tank farm area.",
    remediationPhase: "Planning", contaminantType: "BTEX / TPH",
    regulatoryDeadline: "2029-01-01", remediationProgress: 15,
  },
  {
    id: "OBL-009", name: "Groundwater Treatment", type: "ERO",
    siteId: "S003", siteName: "Appalachian Basin", facilityId: "F005", facilityName: "Processing Plant Gamma",
    status: "Active", initialEstimate: 2100000, currentLiability: 2450000, discountRate: 0.04,
    accretionExpense: 98000, createdDate: "2019-11-05", targetSettlementDate: "2034-12-31",
    description: "Long-term groundwater pump-and-treat system for chlorinated solvent plume.",
    remediationPhase: "Active Remediation", contaminantType: "Chlorinated Solvents (TCE/PCE)",
    regulatoryDeadline: "2035-06-30", remediationProgress: 60,
  },
  {
    id: "OBL-010", name: "Fractionation Unit Decommission", type: "ARO",
    siteId: "S003", siteName: "Appalachian Basin", facilityId: "F005", facilityName: "Processing Plant Gamma",
    assetId: "A008", assetName: "Fractionation Unit",
    status: "Active", initialEstimate: 1500000, currentLiability: 1720000, discountRate: 0.05,
    accretionExpense: 86000, createdDate: "2020-05-12", targetSettlementDate: "2036-12-31",
    description: "Decommissioning of NGL fractionation unit including hazmat abatement.",
    fairValue: 1720000, revisionImpact: 100000,
  },
  {
    id: "OBL-011", name: "Marine Terminal Dismantlement", type: "ARO",
    siteId: "S004", siteName: "Gulf Coast Terminal", facilityId: "F006", facilityName: "Marine Terminal",
    assetId: "A010", assetName: "Loading Dock 1",
    status: "Under Review", initialEstimate: 3200000, currentLiability: 3650000, discountRate: 0.05,
    accretionExpense: 182500, createdDate: "2018-01-20", targetSettlementDate: "2037-12-31",
    description: "Full dismantlement of marine loading dock and associated infrastructure.",
    fairValue: 3650000, revisionImpact: 200000,
  },
  {
    id: "OBL-012", name: "Tank Battery Cleanup", type: "ERO",
    siteId: "S004", siteName: "Gulf Coast Terminal", facilityId: "F006", facilityName: "Marine Terminal",
    assetId: "A011", assetName: "Tank Battery",
    status: "Active", initialEstimate: 650000, currentLiability: 740000, discountRate: 0.045,
    accretionExpense: 33300, createdDate: "2022-03-01", targetSettlementDate: "2027-12-31",
    description: "Environmental cleanup of legacy petroleum contamination around tank battery.",
    remediationPhase: "Assessment", contaminantType: "Petroleum Hydrocarbons",
    regulatoryDeadline: "2028-06-30", remediationProgress: 10,
  },
  {
    id: "OBL-013", name: "Pipeline G Retirement", type: "ARO",
    siteId: "S003", siteName: "Appalachian Basin", facilityId: "F005", facilityName: "Processing Plant Gamma",
    assetId: "A009", assetName: "Pipeline Network G",
    status: "Settled", initialEstimate: 600000, currentLiability: 0, discountRate: 0.05,
    accretionExpense: 0, createdDate: "2017-04-10", targetSettlementDate: "2024-06-30",
    description: "Completed retirement and removal of 20-mile gathering pipeline.",
    fairValue: 0, revisionImpact: 0,
  },
];

// -- Environmental Exposures --
export const environmentalExposures: EnvironmentalExposure[] = [
  {
    id: "EXP-001", siteId: "S001", siteName: "Eagle Ford Basin",
    obligationId: "OBL-008", obligationName: "Soil Contamination Cleanup",
    contaminantType: "BTEX / TPH",
    mediaAffected: ["Soil", "Groundwater"],
    exposureArea: 3.5,
    riskLevel: "High",
    estimatedCleanupCost: 920000,
    regulatoryDriver: "TCEQ TRRP Rule",
    discoveryDate: "2021-06-15",
    reportingDeadline: "2026-06-15",
    monitoringFrequency: "Quarterly",
    lastSampleDate: "2025-12-10",
    exceedanceCount: 4,
    maxConcentration: "12,500 µg/kg TPH",
    regulatoryLimit: "5,000 µg/kg TPH",
    status: "Remediation",
    notes: "Soil excavation planned for Q3 2026. Groundwater monitoring wells MW-1 through MW-6 active.",
  },
  {
    id: "EXP-002", siteId: "S002", siteName: "Permian Basin",
    obligationId: "OBL-007", obligationName: "Pond Remediation",
    contaminantType: "Produced Water / Hydrocarbons",
    mediaAffected: ["Soil", "Groundwater", "Surface Water"],
    exposureArea: 8.2,
    riskLevel: "Critical",
    estimatedCleanupCost: 1380000,
    regulatoryDriver: "NMED Groundwater Quality Bureau",
    discoveryDate: "2019-11-20",
    reportingDeadline: "2026-03-01",
    monitoringFrequency: "Monthly",
    lastSampleDate: "2026-01-15",
    exceedanceCount: 12,
    maxConcentration: "45,000 mg/L TDS",
    regulatoryLimit: "10,000 mg/L TDS",
    status: "Remediation",
    notes: "Active pump-back system in operation. Liner replacement 60% complete. Monthly reporting to NMED.",
  },
  {
    id: "EXP-003", siteId: "S003", siteName: "Appalachian Basin",
    obligationId: "OBL-009", obligationName: "Groundwater Treatment",
    contaminantType: "Chlorinated Solvents (TCE/PCE)",
    mediaAffected: ["Groundwater"],
    exposureArea: 15.0,
    riskLevel: "High",
    estimatedCleanupCost: 2450000,
    regulatoryDriver: "PA DEP Act 2 Standards",
    discoveryDate: "2018-04-22",
    reportingDeadline: "2026-04-22",
    monitoringFrequency: "Quarterly",
    lastSampleDate: "2025-11-05",
    exceedanceCount: 8,
    maxConcentration: "85 µg/L TCE",
    regulatoryLimit: "5 µg/L TCE",
    status: "Remediation",
    notes: "Pump-and-treat system operating since 2020. Plume showing signs of attenuation. 12 monitoring wells active.",
  },
  {
    id: "EXP-004", siteId: "S004", siteName: "Gulf Coast Terminal",
    obligationId: "OBL-012", obligationName: "Tank Battery Cleanup",
    contaminantType: "Petroleum Hydrocarbons",
    mediaAffected: ["Soil"],
    exposureArea: 1.8,
    riskLevel: "Medium",
    estimatedCleanupCost: 740000,
    regulatoryDriver: "LDEQ UST/AST Regulations",
    discoveryDate: "2022-01-10",
    reportingDeadline: "2026-07-10",
    monitoringFrequency: "Semi-Annual",
    lastSampleDate: "2025-09-22",
    exceedanceCount: 2,
    maxConcentration: "8,200 mg/kg DRO",
    regulatoryLimit: "5,000 mg/kg DRO",
    status: "Monitoring",
    notes: "Phase II ESA completed. Delineation sampling planned for Q2 2026.",
  },
  {
    id: "EXP-005", siteId: "S002", siteName: "Permian Basin",
    contaminantType: "NORM (Naturally Occurring Radioactive Material)",
    mediaAffected: ["Soil"],
    exposureArea: 0.5,
    riskLevel: "Medium",
    estimatedCleanupCost: 280000,
    regulatoryDriver: "NMOCD Rule 19.15.36",
    discoveryDate: "2024-08-05",
    reportingDeadline: "2026-08-05",
    monitoringFrequency: "Annual",
    lastSampleDate: "2025-08-10",
    exceedanceCount: 1,
    maxConcentration: "35 pCi/g Ra-226",
    regulatoryLimit: "30 pCi/g Ra-226",
    status: "Monitoring",
    notes: "Elevated NORM detected at former pipe yard. Characterization ongoing.",
  },
];

// -- ARO Tracking --
export const aroTrackingEntries: AROTrackingEntry[] = obligations
  .filter(o => o.type === "ARO" && o.status !== "Settled")
  .map(o => {
    const targetYear = new Date(o.targetSettlementDate).getFullYear();
    const currentYear = 2026;
    const yearsRemaining = Math.max(0, targetYear - currentYear);
    const yearsElapsed = currentYear - new Date(o.createdDate).getFullYear();
    const cumulativeAccretion = o.currentLiability - o.initialEstimate;
    return {
      obligationId: o.id,
      obligationName: o.name,
      assetName: o.assetName || "N/A",
      siteName: o.siteName,
      fairValue: o.fairValue || o.currentLiability,
      initialEstimate: o.initialEstimate,
      currentLiability: o.currentLiability,
      accretionExpense: o.accretionExpense,
      cumulativeAccretion,
      revisionImpact: o.revisionImpact || 0,
      discountRate: o.discountRate,
      retirementDate: o.targetSettlementDate,
      yearsRemaining,
      settlementProgress: Math.min(100, Math.round((yearsElapsed / (yearsElapsed + yearsRemaining)) * 100)),
      lastReviewDate: "2025-12-15",
      nextReviewDate: "2026-06-15",
      reviewNotes: `Annual review completed. ${o.revisionImpact && o.revisionImpact > 0 ? `Upward revision of ${formatCurrency(o.revisionImpact)} applied.` : o.revisionImpact && o.revisionImpact < 0 ? `Downward revision of ${formatCurrency(Math.abs(o.revisionImpact))} applied.` : "No revision required."}`,
    };
  });

// -- Recent Activity --
export const recentActivity: ActivityItem[] = [
  { id: "ACT-1", date: "2026-02-18", action: "Liability revised upward by $200K", obligationId: "OBL-011", obligationName: "Marine Terminal Dismantlement", type: "ARO" },
  { id: "ACT-2", date: "2026-02-15", action: "Remediation progress updated to 60%", obligationId: "OBL-009", obligationName: "Groundwater Treatment", type: "ERO" },
  { id: "ACT-3", date: "2026-02-12", action: "Status changed to Under Review", obligationId: "OBL-003", obligationName: "Well B-1 Plugging", type: "ARO" },
  { id: "ACT-4", date: "2026-02-10", action: "New cost estimate added", obligationId: "OBL-008", obligationName: "Soil Contamination Cleanup", type: "ERO" },
  { id: "ACT-5", date: "2026-02-05", action: "Discount rate updated to 5.5%", obligationId: "OBL-001", obligationName: "Tank Farm Decommissioning", type: "ARO" },
  { id: "ACT-6", date: "2026-01-28", action: "Settlement completed", obligationId: "OBL-013", obligationName: "Pipeline G Retirement", type: "ARO" },
];

// -- Liability Trend Data (quarterly) --
export const liabilityTrendData = [
  { quarter: "Q1 2024", aro: 9200000, ero: 4100000, total: 13300000 },
  { quarter: "Q2 2024", aro: 9500000, ero: 4250000, total: 13750000 },
  { quarter: "Q3 2024", aro: 9800000, ero: 4400000, total: 14200000 },
  { quarter: "Q4 2024", aro: 10100000, ero: 4600000, total: 14700000 },
  { quarter: "Q1 2025", aro: 10400000, ero: 4800000, total: 15200000 },
  { quarter: "Q2 2025", aro: 10700000, ero: 4950000, total: 15650000 },
  { quarter: "Q3 2025", aro: 11000000, ero: 5100000, total: 16100000 },
  { quarter: "Q4 2025", aro: 11300000, ero: 5300000, total: 16600000 },
  { quarter: "Q1 2026", aro: 11717000, ero: 5490000, total: 17207000 },
];

// -- Forecast Data --
export const forecastData = [
  { year: 2026, aro: 11717000, ero: 5490000 },
  { year: 2027, aro: 12300000, ero: 5100000 },
  { year: 2028, aro: 12900000, ero: 4500000 },
  { year: 2029, aro: 13500000, ero: 3800000 },
  { year: 2030, aro: 13200000, ero: 3200000 },
  { year: 2031, aro: 12800000, ero: 2800000 },
  { year: 2032, aro: 12300000, ero: 2400000 },
  { year: 2033, aro: 11200000, ero: 2100000 },
  { year: 2034, aro: 10000000, ero: 1500000 },
  { year: 2035, aro: 8500000, ero: 1200000 },
  { year: 2036, aro: 6800000, ero: 900000 },
];

// -- Helper functions --
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatCurrencyK(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return formatCurrency(value);
}

export function calculatePresentValue(futureValue: number, discountRate: number, years: number): number {
  return futureValue / Math.pow(1 + discountRate, years);
}

export function generateAccretionSchedule(obligation: Obligation): { year: number; beginningBalance: number; accretion: number; endingBalance: number }[] {
  const startYear = new Date(obligation.createdDate).getFullYear();
  const endYear = new Date(obligation.targetSettlementDate).getFullYear();
  const schedule: { year: number; beginningBalance: number; accretion: number; endingBalance: number }[] = [];
  let balance = obligation.initialEstimate;

  for (let y = startYear; y <= endYear; y++) {
    const accretion = balance * obligation.discountRate;
    schedule.push({ year: y, beginningBalance: balance, accretion, endingBalance: balance + accretion });
    balance = balance + accretion;
  }
  return schedule;
}

// Aggregation helpers
export function getAROObligations() { return obligations.filter(o => o.type === "ARO"); }
export function getEROObligations() { return obligations.filter(o => o.type === "ERO"); }
export function getActiveObligations() { return obligations.filter(o => o.status === "Active"); }

export function getTotalLiability(type?: ObligationType) {
  const filtered = type ? obligations.filter(o => o.type === type) : obligations;
  return filtered.reduce((sum, o) => sum + o.currentLiability, 0);
}

export function getTotalAccretion(type?: ObligationType) {
  const filtered = type ? obligations.filter(o => o.type === type) : obligations;
  return filtered.reduce((sum, o) => sum + o.accretionExpense, 0);
}

export function getObligationsByStatus() {
  const counts: Record<string, number> = {};
  obligations.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

// Get all assets flattened with parent references
export function getAllAssets() {
  const result: (Asset & { siteName: string; siteId: string; facilityName: string })[] = [];
  sites.forEach(site => {
    site.facilities.forEach(fac => {
      fac.assets.forEach(asset => {
        result.push({ ...asset, siteName: site.name, siteId: site.id, facilityName: fac.name });
      });
    });
  });
  return result;
}

// ============================================================
// Plan Module - Multi-year forecasting, liability modeling, cost projections, budget alignment
// ============================================================

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  inflationRate: number;
  discountRate: number;
  projections: { year: number; aroLiability: number; eroLiability: number; accretion: number; settlements: number; netChange: number }[];
}

export interface BudgetItem {
  id: string;
  category: string;
  obligationId: string;
  obligationName: string;
  siteName: string;
  budgetedAmount: number;
  forecastAmount: number;
  variance: number;
  variancePercent: number;
  fiscalYear: number;
  notes: string;
}

export const forecastScenarios: ForecastScenario[] = [
  {
    id: "SCN-BASE", name: "Base Case", description: "Current discount rates, 2.5% inflation, no new obligations",
    inflationRate: 0.025, discountRate: 0.05,
    projections: [
      { year: 2026, aroLiability: 11717000, eroLiability: 5490000, accretion: 661000, settlements: 0, netChange: 661000 },
      { year: 2027, aroLiability: 12300000, eroLiability: 5100000, accretion: 693000, settlements: 740000, netChange: -47000 },
      { year: 2028, aroLiability: 12900000, eroLiability: 4500000, accretion: 728000, settlements: 920000, netChange: -192000 },
      { year: 2029, aroLiability: 13500000, eroLiability: 3800000, accretion: 764000, settlements: 1380000, netChange: -616000 },
      { year: 2030, aroLiability: 13200000, eroLiability: 3200000, accretion: 750000, settlements: 412000, netChange: 338000 },
      { year: 2031, aroLiability: 12800000, eroLiability: 2800000, accretion: 720000, settlements: 375000, netChange: 345000 },
      { year: 2032, aroLiability: 12300000, eroLiability: 2400000, accretion: 690000, settlements: 0, netChange: 690000 },
      { year: 2033, aroLiability: 11200000, eroLiability: 2100000, accretion: 640000, settlements: 1050000, netChange: -410000 },
      { year: 2034, aroLiability: 10000000, eroLiability: 1500000, accretion: 580000, settlements: 2450000, netChange: -1870000 },
      { year: 2035, aroLiability: 8500000, eroLiability: 1200000, accretion: 500000, settlements: 2847000, netChange: -2347000 },
    ],
  },
  {
    id: "SCN-HIGH", name: "High Inflation", description: "4% inflation, higher cost escalation on unsettled obligations",
    inflationRate: 0.04, discountRate: 0.05,
    projections: [
      { year: 2026, aroLiability: 11717000, eroLiability: 5490000, accretion: 661000, settlements: 0, netChange: 661000 },
      { year: 2027, aroLiability: 12800000, eroLiability: 5400000, accretion: 720000, settlements: 740000, netChange: -20000 },
      { year: 2028, aroLiability: 13900000, eroLiability: 5000000, accretion: 800000, settlements: 920000, netChange: -120000 },
      { year: 2029, aroLiability: 15100000, eroLiability: 4400000, accretion: 880000, settlements: 1380000, netChange: -500000 },
      { year: 2030, aroLiability: 15500000, eroLiability: 3900000, accretion: 920000, settlements: 412000, netChange: 508000 },
      { year: 2031, aroLiability: 15800000, eroLiability: 3500000, accretion: 950000, settlements: 375000, netChange: 575000 },
      { year: 2032, aroLiability: 15600000, eroLiability: 3100000, accretion: 940000, settlements: 0, netChange: 940000 },
      { year: 2033, aroLiability: 14800000, eroLiability: 2800000, accretion: 900000, settlements: 1050000, netChange: -150000 },
      { year: 2034, aroLiability: 13500000, eroLiability: 2200000, accretion: 830000, settlements: 2450000, netChange: -1620000 },
      { year: 2035, aroLiability: 11800000, eroLiability: 1800000, accretion: 740000, settlements: 2847000, netChange: -2107000 },
    ],
  },
  {
    id: "SCN-ACCEL", name: "Accelerated Settlement", description: "Aggressive settlement timeline, early decommissioning",
    inflationRate: 0.025, discountRate: 0.05,
    projections: [
      { year: 2026, aroLiability: 11717000, eroLiability: 5490000, accretion: 661000, settlements: 1152000, netChange: -491000 },
      { year: 2027, aroLiability: 11200000, eroLiability: 4600000, accretion: 620000, settlements: 2840000, netChange: -2220000 },
      { year: 2028, aroLiability: 10100000, eroLiability: 3500000, accretion: 540000, settlements: 3370000, netChange: -2830000 },
      { year: 2029, aroLiability: 8500000, eroLiability: 2400000, accretion: 430000, settlements: 3200000, netChange: -2770000 },
      { year: 2030, aroLiability: 6800000, eroLiability: 1500000, accretion: 340000, settlements: 2500000, netChange: -2160000 },
      { year: 2031, aroLiability: 5200000, eroLiability: 800000, accretion: 260000, settlements: 2000000, netChange: -1740000 },
      { year: 2032, aroLiability: 3800000, eroLiability: 400000, accretion: 190000, settlements: 1600000, netChange: -1410000 },
      { year: 2033, aroLiability: 2200000, eroLiability: 100000, accretion: 110000, settlements: 1500000, netChange: -1390000 },
      { year: 2034, aroLiability: 800000, eroLiability: 0, accretion: 40000, settlements: 1500000, netChange: -1460000 },
      { year: 2035, aroLiability: 0, eroLiability: 0, accretion: 0, settlements: 800000, netChange: -800000 },
    ],
  },
];

export const budgetItems: BudgetItem[] = [
  { id: "BDG-001", category: "Decommissioning", obligationId: "OBL-001", obligationName: "Tank Farm Decommissioning", siteName: "Eagle Ford Basin", budgetedAmount: 300000, forecastAmount: 320000, variance: -20000, variancePercent: -6.7, fiscalYear: 2026, notes: "Pre-decommissioning engineering studies" },
  { id: "BDG-002", category: "Well P&A", obligationId: "OBL-003", obligationName: "Well B-1 Plugging", siteName: "Eagle Ford Basin", budgetedAmount: 180000, forecastAmount: 195000, variance: -15000, variancePercent: -8.3, fiscalYear: 2026, notes: "Plug & abandonment contractor mobilization" },
  { id: "BDG-003", category: "Remediation", obligationId: "OBL-007", obligationName: "Pond Remediation", siteName: "Permian Basin", budgetedAmount: 450000, forecastAmount: 420000, variance: 30000, variancePercent: 6.7, fiscalYear: 2026, notes: "Liner replacement and soil removal phase" },
  { id: "BDG-004", category: "Remediation", obligationId: "OBL-008", obligationName: "Soil Contamination Cleanup", siteName: "Eagle Ford Basin", budgetedAmount: 250000, forecastAmount: 280000, variance: -30000, variancePercent: -12.0, fiscalYear: 2026, notes: "Excavation and off-site disposal" },
  { id: "BDG-005", category: "Monitoring", obligationId: "OBL-009", obligationName: "Groundwater Treatment", siteName: "Appalachian Basin", budgetedAmount: 200000, forecastAmount: 210000, variance: -10000, variancePercent: -5.0, fiscalYear: 2026, notes: "O&M for pump-and-treat system" },
  { id: "BDG-006", category: "Decommissioning", obligationId: "OBL-005", obligationName: "Compressor Removal", siteName: "Permian Basin", budgetedAmount: 150000, forecastAmount: 140000, variance: 10000, variancePercent: 6.7, fiscalYear: 2026, notes: "Site assessment and planning" },
  { id: "BDG-007", category: "Marine", obligationId: "OBL-011", obligationName: "Marine Terminal Dismantlement", siteName: "Gulf Coast Terminal", budgetedAmount: 500000, forecastAmount: 550000, variance: -50000, variancePercent: -10.0, fiscalYear: 2026, notes: "Phase 1 structural assessment" },
  { id: "BDG-008", category: "Remediation", obligationId: "OBL-012", obligationName: "Tank Battery Cleanup", siteName: "Gulf Coast Terminal", budgetedAmount: 120000, forecastAmount: 115000, variance: 5000, variancePercent: 4.2, fiscalYear: 2026, notes: "Phase II ESA and delineation" },
];

// ============================================================
// Settlement Module - Project cost tracking, vendor payments, budget vs actuals, financial closure
// ============================================================

export interface SettlementProject {
  id: string;
  obligationId: string;
  obligationName: string;
  siteName: string;
  type: ObligationType;
  status: "Planning" | "In Progress" | "Pending Closure" | "Closed";
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  startDate: string;
  estimatedEndDate: string;
  projectManager: string;
  completionPercent: number;
  vendors: VendorPayment[];
  costItems: CostItem[];
}

export interface VendorPayment {
  id: string;
  vendorName: string;
  description: string;
  contractAmount: number;
  invoicedAmount: number;
  paidAmount: number;
  retainage: number;
  status: "Active" | "Complete" | "Pending";
  lastPaymentDate: string;
}

export interface CostItem {
  id: string;
  category: string;
  description: string;
  budgeted: number;
  actual: number;
  committed: number;
  variance: number;
}

export const settlementProjects: SettlementProject[] = [
  {
    id: "STTL-001", obligationId: "OBL-013", obligationName: "Pipeline G Retirement", siteName: "Appalachian Basin", type: "ARO",
    status: "Closed", totalBudget: 620000, totalSpent: 587000, totalCommitted: 587000,
    startDate: "2023-07-01", estimatedEndDate: "2024-06-30", projectManager: "Tom Williams", completionPercent: 100,
    vendors: [
      { id: "VP-001", vendorName: "Enviro Solutions Inc.", description: "Pipeline removal and disposal", contractAmount: 380000, invoicedAmount: 380000, paidAmount: 380000, retainage: 0, status: "Complete", lastPaymentDate: "2024-05-15" },
      { id: "VP-002", vendorName: "GeoTech Consulting", description: "Environmental monitoring", contractAmount: 85000, invoicedAmount: 85000, paidAmount: 85000, retainage: 0, status: "Complete", lastPaymentDate: "2024-06-20" },
    ],
    costItems: [
      { id: "CI-001", category: "Contractor Labor", description: "Pipeline removal crews", budgeted: 280000, actual: 275000, committed: 275000, variance: 5000 },
      { id: "CI-002", category: "Equipment", description: "Heavy equipment rental", budgeted: 120000, actual: 115000, committed: 115000, variance: 5000 },
      { id: "CI-003", category: "Disposal", description: "Material transport & disposal", budgeted: 95000, actual: 92000, committed: 92000, variance: 3000 },
      { id: "CI-004", category: "Monitoring", description: "Environmental sampling", budgeted: 85000, actual: 72000, committed: 72000, variance: 13000 },
      { id: "CI-005", category: "Admin", description: "Permits and regulatory fees", budgeted: 40000, actual: 33000, committed: 33000, variance: 7000 },
    ],
  },
  {
    id: "STTL-002", obligationId: "OBL-007", obligationName: "Pond Remediation", siteName: "Permian Basin", type: "ERO",
    status: "In Progress", totalBudget: 1380000, totalSpent: 621000, totalCommitted: 890000,
    startDate: "2024-01-15", estimatedEndDate: "2029-12-31", projectManager: "Lisa Patel", completionPercent: 45,
    vendors: [
      { id: "VP-003", vendorName: "Western Remediation Co.", description: "Pond closure and soil remediation", contractAmount: 850000, invoicedAmount: 420000, paidAmount: 390000, retainage: 30000, status: "Active", lastPaymentDate: "2026-01-10" },
      { id: "VP-004", vendorName: "AquaMonitor LLC", description: "Groundwater monitoring program", contractAmount: 180000, invoicedAmount: 95000, paidAmount: 95000, retainage: 0, status: "Active", lastPaymentDate: "2025-12-15" },
      { id: "VP-005", vendorName: "LinerTech Systems", description: "Liner replacement", contractAmount: 220000, invoicedAmount: 136000, paidAmount: 136000, retainage: 0, status: "Active", lastPaymentDate: "2025-11-28" },
    ],
    costItems: [
      { id: "CI-006", category: "Remediation", description: "Soil excavation and removal", budgeted: 450000, actual: 280000, committed: 420000, variance: 30000 },
      { id: "CI-007", category: "Liner", description: "Liner removal and replacement", budgeted: 280000, actual: 180000, committed: 250000, variance: 30000 },
      { id: "CI-008", category: "Monitoring", description: "Groundwater sampling and analysis", budgeted: 200000, actual: 95000, committed: 140000, variance: 60000 },
      { id: "CI-009", category: "Disposal", description: "Contaminated soil disposal", budgeted: 320000, actual: 52000, committed: 60000, variance: 260000 },
      { id: "CI-010", category: "Admin", description: "Regulatory reporting and permits", budgeted: 130000, actual: 14000, committed: 20000, variance: 110000 },
    ],
  },
  {
    id: "STTL-003", obligationId: "OBL-003", obligationName: "Well B-1 Plugging", siteName: "Eagle Ford Basin", type: "ARO",
    status: "Planning", totalBudget: 412000, totalSpent: 28000, totalCommitted: 45000,
    startDate: "2026-06-01", estimatedEndDate: "2030-03-31", projectManager: "Mark Henderson", completionPercent: 5,
    vendors: [
      { id: "VP-006", vendorName: "Texas Well Services", description: "Well P&A operations", contractAmount: 290000, invoicedAmount: 0, paidAmount: 0, retainage: 0, status: "Pending", lastPaymentDate: "" },
      { id: "VP-007", vendorName: "SafeEnviro Labs", description: "Pre-closure environmental assessment", contractAmount: 45000, invoicedAmount: 28000, paidAmount: 28000, retainage: 0, status: "Active", lastPaymentDate: "2026-01-20" },
    ],
    costItems: [
      { id: "CI-011", category: "Assessment", description: "Pre-closure site assessment", budgeted: 50000, actual: 28000, committed: 45000, variance: 5000 },
      { id: "CI-012", category: "P&A Operations", description: "Plugging and cement", budgeted: 220000, actual: 0, committed: 0, variance: 220000 },
      { id: "CI-013", category: "Site Restoration", description: "Surface restoration", budgeted: 85000, actual: 0, committed: 0, variance: 85000 },
      { id: "CI-014", category: "Monitoring", description: "Post-closure monitoring", budgeted: 57000, actual: 0, committed: 0, variance: 57000 },
    ],
  },
  {
    id: "STTL-004", obligationId: "OBL-012", obligationName: "Tank Battery Cleanup", siteName: "Gulf Coast Terminal", type: "ERO",
    status: "In Progress", totalBudget: 740000, totalSpent: 74000, totalCommitted: 185000,
    startDate: "2025-06-01", estimatedEndDate: "2027-12-31", projectManager: "David Kim", completionPercent: 10,
    vendors: [
      { id: "VP-008", vendorName: "Gulf Environmental Services", description: "Phase II ESA and remediation", contractAmount: 520000, invoicedAmount: 52000, paidAmount: 52000, retainage: 0, status: "Active", lastPaymentDate: "2025-12-10" },
      { id: "VP-009", vendorName: "LabCorp Environmental", description: "Analytical testing", contractAmount: 65000, invoicedAmount: 22000, paidAmount: 22000, retainage: 0, status: "Active", lastPaymentDate: "2025-11-15" },
    ],
    costItems: [
      { id: "CI-015", category: "Assessment", description: "Phase II ESA", budgeted: 120000, actual: 52000, committed: 85000, variance: 35000 },
      { id: "CI-016", category: "Remediation", description: "Soil treatment", budgeted: 380000, actual: 0, committed: 60000, variance: 320000 },
      { id: "CI-017", category: "Monitoring", description: "Sampling and analysis", budgeted: 140000, actual: 22000, committed: 40000, variance: 100000 },
      { id: "CI-018", category: "Admin", description: "Reporting and oversight", budgeted: 100000, actual: 0, committed: 0, variance: 100000 },
    ],
  },
];

// ============================================================
// Assurance Module - Reporting, controls, audit trail, financial disclosure
// ============================================================

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  category: "Obligation" | "Financial" | "Compliance" | "Settlement" | "System";
}

export interface ControlItem {
  id: string;
  controlName: string;
  description: string;
  category: string;
  frequency: string;
  owner: string;
  status: "Effective" | "Needs Improvement" | "Deficient" | "Not Tested";
  lastTestedDate: string;
  nextTestDate: string;
  findings: string;
  riskRating: "Low" | "Medium" | "High";
}

export interface DisclosureItem {
  id: string;
  standard: string;
  requirement: string;
  description: string;
  status: "Complete" | "In Progress" | "Not Started" | "N/A";
  responsibleParty: string;
  dueDate: string;
  completedDate?: string;
  notes: string;
}

export const auditTrail: AuditTrailEntry[] = [
  { id: "AUD-001", timestamp: "2026-02-18 14:32:00", user: "Sarah Chen", action: "Liability Revised", entity: "Obligation", entityId: "OBL-011", details: "Marine Terminal Dismantlement liability revised upward by $200,000. New fair value: $3,650,000.", category: "Financial" },
  { id: "AUD-002", timestamp: "2026-02-15 10:15:00", user: "Tom Williams", action: "Progress Updated", entity: "Obligation", entityId: "OBL-009", details: "Groundwater Treatment remediation progress updated from 55% to 60%.", category: "Obligation" },
  { id: "AUD-003", timestamp: "2026-02-12 09:45:00", user: "Mark Henderson", action: "Status Changed", entity: "Obligation", entityId: "OBL-003", details: "Well B-1 Plugging status changed from Active to Under Review pending cost re-estimate.", category: "Obligation" },
  { id: "AUD-004", timestamp: "2026-02-10 16:20:00", user: "Lisa Patel", action: "Cost Estimate Added", entity: "Obligation", entityId: "OBL-008", details: "New cost estimate of $280,000 added for soil excavation phase. Previous estimate was $250,000.", category: "Financial" },
  { id: "AUD-005", timestamp: "2026-02-08 11:00:00", user: "System", action: "Accretion Posted", entity: "Financial", entityId: "ALL", details: "Monthly accretion expense of $55,083 posted across all active obligations.", category: "Financial" },
  { id: "AUD-006", timestamp: "2026-02-05 13:30:00", user: "Angela Foster", action: "Discount Rate Updated", entity: "Obligation", entityId: "OBL-001", details: "Tank Farm Decommissioning discount rate updated from 5.0% to 5.5%.", category: "Financial" },
  { id: "AUD-007", timestamp: "2026-02-03 08:15:00", user: "David Kim", action: "Vendor Payment", entity: "Settlement", entityId: "STTL-004", details: "Payment of $52,000 to Gulf Environmental Services for Phase II ESA services.", category: "Settlement" },
  { id: "AUD-008", timestamp: "2026-01-30 14:45:00", user: "James Rodriguez", action: "Inspection Completed", entity: "Compliance", entityId: "S002", details: "Permian Basin site inspection completed. Under investigation status maintained.", category: "Compliance" },
  { id: "AUD-009", timestamp: "2026-01-28 10:00:00", user: "Tom Williams", action: "Settlement Completed", entity: "Obligation", entityId: "OBL-013", details: "Pipeline G Retirement settlement completed. Final cost: $587,000 vs budget of $620,000.", category: "Settlement" },
  { id: "AUD-010", timestamp: "2026-01-25 09:30:00", user: "System", action: "Report Generated", entity: "Financial", entityId: "RPT-Q4-2025", details: "Q4 2025 financial disclosure report generated. ARO: $11.7M, ERO: $5.5M.", category: "Financial" },
  { id: "AUD-011", timestamp: "2026-01-22 15:00:00", user: "Lisa Patel", action: "Control Tested", entity: "Compliance", entityId: "CTL-003", details: "Quarterly discount rate review control tested. Result: Effective.", category: "Compliance" },
  { id: "AUD-012", timestamp: "2026-01-18 11:20:00", user: "Sarah Chen", action: "Monitoring Sample", entity: "Compliance", entityId: "EXP-001", details: "Quarterly groundwater sampling completed at Eagle Ford Basin. 4 exceedances noted.", category: "Compliance" },
];

export const controlItems: ControlItem[] = [
  { id: "CTL-001", controlName: "Obligation Completeness Review", description: "Annual review to ensure all ARO/ERO obligations are identified and recorded", category: "Financial Reporting", frequency: "Annual", owner: "Sarah Chen", status: "Effective", lastTestedDate: "2025-12-15", nextTestDate: "2026-12-15", findings: "No exceptions noted. All known obligations properly recorded.", riskRating: "High" },
  { id: "CTL-002", controlName: "Fair Value Measurement Validation", description: "Review of assumptions and inputs used in fair value calculations for AROs", category: "Valuation", frequency: "Quarterly", owner: "Angela Foster", status: "Effective", lastTestedDate: "2025-12-31", nextTestDate: "2026-03-31", findings: "Discount rates and cost estimates validated against market data.", riskRating: "High" },
  { id: "CTL-003", controlName: "Discount Rate Reasonableness", description: "Quarterly assessment of credit-adjusted risk-free rates used for discounting", category: "Valuation", frequency: "Quarterly", owner: "Lisa Patel", status: "Effective", lastTestedDate: "2026-01-22", nextTestDate: "2026-04-22", findings: "Rates within acceptable range. No adjustment needed.", riskRating: "Medium" },
  { id: "CTL-004", controlName: "Settlement Cost Reconciliation", description: "Monthly reconciliation of actual settlement costs to budget and obligation balances", category: "Settlement", frequency: "Monthly", owner: "Tom Williams", status: "Effective", lastTestedDate: "2026-01-31", nextTestDate: "2026-02-28", findings: "Pipeline G Retirement closed within 5% of budget.", riskRating: "Medium" },
  { id: "CTL-005", controlName: "Environmental Monitoring Compliance", description: "Verification that all required monitoring activities are performed on schedule", category: "Compliance", frequency: "Quarterly", owner: "David Kim", status: "Needs Improvement", lastTestedDate: "2025-12-20", nextTestDate: "2026-03-20", findings: "One monitoring event delayed by 2 weeks at Gulf Coast Terminal.", riskRating: "High" },
  { id: "CTL-006", controlName: "Vendor Payment Authorization", description: "Review of vendor payment approvals and supporting documentation", category: "Settlement", frequency: "Monthly", owner: "Mark Henderson", status: "Effective", lastTestedDate: "2026-01-15", nextTestDate: "2026-02-15", findings: "All payments properly authorized with supporting invoices.", riskRating: "Low" },
  { id: "CTL-007", controlName: "Accretion Expense Calculation", description: "Monthly verification of accretion expense calculations and journal entries", category: "Financial Reporting", frequency: "Monthly", owner: "Sarah Chen", status: "Effective", lastTestedDate: "2026-02-08", nextTestDate: "2026-03-08", findings: "Calculations verified. Auto-posted entries reconciled.", riskRating: "Medium" },
  { id: "CTL-008", controlName: "Regulatory Deadline Tracking", description: "Weekly review of upcoming regulatory deadlines and reporting requirements", category: "Compliance", frequency: "Weekly", owner: "James Rodriguez", status: "Deficient", lastTestedDate: "2026-01-10", nextTestDate: "2026-02-28", findings: "Two reporting deadlines nearly missed. Process improvement needed.", riskRating: "High" },
];

export const disclosureItems: DisclosureItem[] = [
  { id: "DSC-001", standard: "ASC 410-20", requirement: "Beginning balance rollforward", description: "Reconciliation of ARO beginning to ending balance", status: "Complete", responsibleParty: "Sarah Chen", dueDate: "2026-03-15", completedDate: "2026-02-10", notes: "Q4 2025 rollforward completed and reviewed." },
  { id: "DSC-002", standard: "ASC 410-20", requirement: "Accretion expense disclosure", description: "Total accretion expense recognized during the period", status: "Complete", responsibleParty: "Sarah Chen", dueDate: "2026-03-15", completedDate: "2026-02-10", notes: "Annual accretion of $661K disclosed." },
  { id: "DSC-003", standard: "ASC 410-20", requirement: "Revision in estimates", description: "Description and amount of upward/downward revisions", status: "In Progress", responsibleParty: "Angela Foster", dueDate: "2026-03-15", notes: "Documenting $480K net upward revision. Marine Terminal and Compressor revisions pending final review." },
  { id: "DSC-004", standard: "ASC 410-20", requirement: "Fair value assumptions", description: "Key assumptions used in initial and subsequent fair value measurements", status: "In Progress", responsibleParty: "Lisa Patel", dueDate: "2026-03-15", notes: "Discount rate methodology and inflation assumptions under review." },
  { id: "DSC-005", standard: "ASC 450-20", requirement: "Nature of contingency", description: "Description of environmental remediation obligations", status: "Complete", responsibleParty: "David Kim", dueDate: "2026-03-15", completedDate: "2026-02-05", notes: "Four active ERO sites described with contaminant types and regulatory drivers." },
  { id: "DSC-006", standard: "ASC 450-20", requirement: "Estimated range of loss", description: "Range of possible losses for ERO obligations", status: "In Progress", responsibleParty: "David Kim", dueDate: "2026-03-15", notes: "Best estimate of $5.49M accrued. High-end range analysis in progress." },
  { id: "DSC-007", standard: "ASC 450-20", requirement: "Regulatory and legal proceedings", description: "Status of regulatory actions and pending legal matters", status: "Not Started", responsibleParty: "James Rodriguez", dueDate: "2026-03-15", notes: "Awaiting legal counsel input on Permian Basin investigation." },
  { id: "DSC-008", standard: "SEC Reg S-K", requirement: "Environmental capital expenditures", description: "Current and projected environmental capital expenditures", status: "Not Started", responsibleParty: "Angela Foster", dueDate: "2026-03-31", notes: "Pending completion of 2026 budget alignment." },
];
