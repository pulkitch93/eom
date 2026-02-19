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
