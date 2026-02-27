// ── Invoice Document Management Mock Data ──

export type ProcessingStatus = "received" | "ocr_complete" | "fields_extracted" | "candidates_generated" | "scored" | "ready_for_review";

export type DocStatus = "missing" | "attached" | "needs_review" | "complete";
export type MatchConfidence = "high" | "medium" | "low";

export interface ExtractedField {
  field: string;
  value: string | null;
  confidence: number; // 0-100
}

export interface MatchSignal {
  signal: string;
  weight: number;
  score: number;
  detail: string;
}

export interface MatchCandidate {
  invoiceId: string;
  confidence: number;
  signals: MatchSignal[];
  explanation: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  processingStatus: ProcessingStatus;
  ocrConfidence: number;
  extractedFields: ExtractedField[];
  matchCandidates: MatchCandidate[];
  bestMatchInvoiceId: string | null;
  bestMatchConfidence: number;
  matchApproved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  flagged: boolean;
  flagReason: string | null;
  notes: string[];
  extractionMethod: "ocr" | "filename" | "manual";
  modelVersion: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  poNumber: string | null;
  projectCode: string | null;
  docStatus: DocStatus;
  attachedDocCount: number;
  lastUpdated: string;
  auditReady: boolean;
}

export interface AuditEntry {
  id: string;
  entityType: "document" | "invoice";
  entityId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, string>;
}

export interface ExceptionReason {
  reason: string;
  count: number;
  severity: "high" | "medium" | "low";
  recommendedAction: string;
}

// ── Mock Invoices ──
export const mockInvoices: Invoice[] = [
  { id: "inv-001", invoiceNumber: "INV-10492", vendor: "Acme Environmental Services", amount: 245000, currency: "USD", date: "2025-12-01", poNumber: "PO-8823", projectCode: "PRJ-WELL-001", docStatus: "complete", attachedDocCount: 3, lastUpdated: "2026-02-15", auditReady: true },
  { id: "inv-002", invoiceNumber: "INV-10493", vendor: "GreenTech Remediation", amount: 187500, currency: "USD", date: "2025-12-05", poNumber: "PO-8824", projectCode: "PRJ-MINE-003", docStatus: "attached", attachedDocCount: 2, lastUpdated: "2026-02-14", auditReady: false },
  { id: "inv-003", invoiceNumber: "INV-10501", vendor: "Acme Environmental Services", amount: 312400, currency: "USD", date: "2025-12-10", poNumber: "PO-8830", projectCode: "PRJ-WELL-002", docStatus: "needs_review", attachedDocCount: 1, lastUpdated: "2026-02-20", auditReady: false },
  { id: "inv-004", invoiceNumber: "INV-10510", vendor: "Pacific Decom LLC", amount: 98750, currency: "USD", date: "2025-12-15", poNumber: null, projectCode: "PRJ-PLAT-001", docStatus: "missing", attachedDocCount: 0, lastUpdated: "2026-01-20", auditReady: false },
  { id: "inv-005", invoiceNumber: "INV-10515", vendor: "TerraClean Solutions", amount: 425000, currency: "USD", date: "2025-12-18", poNumber: "PO-8835", projectCode: "PRJ-PIPE-005", docStatus: "complete", attachedDocCount: 4, lastUpdated: "2026-02-25", auditReady: true },
  { id: "inv-006", invoiceNumber: "INV-10520", vendor: "EcoRestore Inc", amount: 156300, currency: "USD", date: "2025-12-22", poNumber: "PO-8840", projectCode: null, docStatus: "needs_review", attachedDocCount: 1, lastUpdated: "2026-02-18", auditReady: false },
  { id: "inv-007", invoiceNumber: "INV-10525", vendor: "Northern Waste Mgmt", amount: 78200, currency: "USD", date: "2026-01-05", poNumber: null, projectCode: "PRJ-WELL-003", docStatus: "missing", attachedDocCount: 0, lastUpdated: "2026-01-10", auditReady: false },
  { id: "inv-008", invoiceNumber: "INV-10530", vendor: "GreenTech Remediation", amount: 290000, currency: "USD", date: "2026-01-10", poNumber: "PO-8850", projectCode: "PRJ-MINE-004", docStatus: "attached", attachedDocCount: 2, lastUpdated: "2026-02-22", auditReady: false },
  { id: "inv-009", invoiceNumber: "INV-10535", vendor: "Acme Environmental Services", amount: 567800, currency: "USD", date: "2026-01-15", poNumber: "PO-8855", projectCode: "PRJ-WELL-004", docStatus: "complete", attachedDocCount: 5, lastUpdated: "2026-02-26", auditReady: true },
  { id: "inv-010", invoiceNumber: "INV-10540", vendor: "Pacific Decom LLC", amount: 134500, currency: "USD", date: "2026-01-20", poNumber: "PO-8860", projectCode: "PRJ-PLAT-002", docStatus: "needs_review", attachedDocCount: 1, lastUpdated: "2026-02-24", auditReady: false },
  { id: "inv-011", invoiceNumber: "INV-10545", vendor: "TerraClean Solutions", amount: 210000, currency: "USD", date: "2026-01-25", poNumber: null, projectCode: "PRJ-PIPE-006", docStatus: "missing", attachedDocCount: 0, lastUpdated: "2026-01-30", auditReady: false },
  { id: "inv-012", invoiceNumber: "INV-10550", vendor: "EcoRestore Inc", amount: 445600, currency: "USD", date: "2026-02-01", poNumber: "PO-8870", projectCode: "PRJ-WELL-005", docStatus: "complete", attachedDocCount: 3, lastUpdated: "2026-02-27", auditReady: true },
];

// ── Mock Uploaded Documents ──
export const mockDocuments: UploadedDocument[] = [
  {
    id: "doc-001", filename: "INV-10492_AcmeEnv_Dec2025.pdf", uploadedBy: "Sarah Chen", uploadedAt: "2026-02-10T09:30:00Z", fileSize: "2.4 MB",
    processingStatus: "ready_for_review", ocrConfidence: 97,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10492", confidence: 99 },
      { field: "Vendor Name", value: "Acme Environmental Services", confidence: 98 },
      { field: "Invoice Date", value: "2025-12-01", confidence: 96 },
      { field: "Amount", value: "$245,000.00", confidence: 99 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8823", confidence: 95 },
      { field: "Work Order", value: "WO-2025-1182", confidence: 88 },
    ],
    matchCandidates: [
      { invoiceId: "inv-001", confidence: 98, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 40, detail: "OCR Invoice # INV-10492 = Record INV-10492" },
        { signal: "Amount Match", weight: 25, score: 25, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 19, detail: "Vendor name similarity 98%" },
        { signal: "PO Number Match", weight: 10, score: 10, detail: "PO-8823 matches" },
        { signal: "Date Closeness", weight: 5, score: 4, detail: "Exact date match" },
      ], explanation: "Matched because: OCR Invoice # = INV-10492, Amount within $0.00, Vendor name similarity 98%." },
    ],
    bestMatchInvoiceId: "inv-001", bestMatchConfidence: 98, matchApproved: true, approvedBy: "Sarah Chen", approvedAt: "2026-02-10T10:15:00Z",
    flagged: false, flagReason: null, notes: ["Auto-matched with high confidence"], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-002", filename: "Acme_WellDecom_SupportDocs.pdf", uploadedBy: "Sarah Chen", uploadedAt: "2026-02-10T09:31:00Z", fileSize: "5.1 MB",
    processingStatus: "ready_for_review", ocrConfidence: 92,
    extractedFields: [
      { field: "Invoice Number", value: null, confidence: 0 },
      { field: "Vendor Name", value: "Acme Environmental", confidence: 85 },
      { field: "Invoice Date", value: "2025-12-01", confidence: 78 },
      { field: "Amount", value: "$245,000.00", confidence: 91 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8823", confidence: 82 },
    ],
    matchCandidates: [
      { invoiceId: "inv-001", confidence: 74, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 0, detail: "No invoice number extracted" },
        { signal: "Amount Match", weight: 25, score: 25, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 17, detail: "Vendor name similarity 85%" },
        { signal: "PO Number Match", weight: 10, score: 8, detail: "PO-8823 matches (82% confidence)" },
        { signal: "Date Closeness", weight: 5, score: 4, detail: "Exact date match" },
      ], explanation: "Matched because: Amount within $0.00, PO-8823 matches, Vendor similarity 85%. Missing invoice number lowers confidence." },
      { invoiceId: "inv-003", confidence: 42, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 0, detail: "No invoice number extracted" },
        { signal: "Amount Match", weight: 25, score: 8, detail: "Amount difference $67,400" },
        { signal: "Vendor Similarity", weight: 20, score: 17, detail: "Vendor name similarity 85%" },
        { signal: "PO Number Match", weight: 10, score: 0, detail: "PO mismatch" },
        { signal: "Date Closeness", weight: 5, score: 3, detail: "9 days apart" },
      ], explanation: "Weak match: Same vendor but different amounts and PO numbers." },
    ],
    bestMatchInvoiceId: "inv-001", bestMatchConfidence: 74, matchApproved: false, approvedBy: null, approvedAt: null,
    flagged: false, flagReason: null, notes: [], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-003", filename: "GreenTech_Remediation_Invoice_10493.pdf", uploadedBy: "Mike Rodriguez", uploadedAt: "2026-02-12T14:20:00Z", fileSize: "1.8 MB",
    processingStatus: "ready_for_review", ocrConfidence: 95,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10493", confidence: 97 },
      { field: "Vendor Name", value: "GreenTech Remediation", confidence: 96 },
      { field: "Invoice Date", value: "2025-12-05", confidence: 94 },
      { field: "Amount", value: "$187,500.00", confidence: 98 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8824", confidence: 93 },
    ],
    matchCandidates: [
      { invoiceId: "inv-002", confidence: 96, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 39, detail: "OCR Invoice # INV-10493 = Record INV-10493" },
        { signal: "Amount Match", weight: 25, score: 25, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 19, detail: "Vendor name similarity 96%" },
        { signal: "PO Number Match", weight: 10, score: 9, detail: "PO-8824 matches" },
        { signal: "Date Closeness", weight: 5, score: 4, detail: "Exact date match" },
      ], explanation: "Matched because: OCR Invoice # = INV-10493, Amount within $0.00, Vendor name similarity 96%." },
    ],
    bestMatchInvoiceId: "inv-002", bestMatchConfidence: 96, matchApproved: true, approvedBy: "Mike Rodriguez", approvedAt: "2026-02-12T15:00:00Z",
    flagged: false, flagReason: null, notes: ["Filename contained invoice ID - high confidence"], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-004", filename: "scan_20260115_001.pdf", uploadedBy: "Lisa Park", uploadedAt: "2026-02-15T11:00:00Z", fileSize: "3.2 MB",
    processingStatus: "ready_for_review", ocrConfidence: 62,
    extractedFields: [
      { field: "Invoice Number", value: "INV-105??", confidence: 35 },
      { field: "Vendor Name", value: "Pac... Decom", confidence: 52 },
      { field: "Invoice Date", value: null, confidence: 0 },
      { field: "Amount", value: "$98,750", confidence: 71 },
      { field: "Currency", value: "USD", confidence: 90 },
      { field: "PO Number", value: null, confidence: 0 },
    ],
    matchCandidates: [
      { invoiceId: "inv-004", confidence: 45, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 8, detail: "Partial match INV-105?? (35% confidence)" },
        { signal: "Amount Match", weight: 25, score: 18, detail: "Amount within $0.00 (71% confidence)" },
        { signal: "Vendor Similarity", weight: 20, score: 10, detail: "Vendor name similarity 52%" },
        { signal: "PO Number Match", weight: 10, score: 0, detail: "No PO extracted" },
        { signal: "Date Closeness", weight: 5, score: 0, detail: "No date extracted" },
      ], explanation: "Low confidence: Poor scan quality. Partial vendor and invoice number match. Missing date and PO." },
      { invoiceId: "inv-010", confidence: 32, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 6, detail: "Partial match INV-105??" },
        { signal: "Amount Match", weight: 25, score: 5, detail: "Amount difference $35,750" },
        { signal: "Vendor Similarity", weight: 20, score: 10, detail: "Vendor name similarity 52%" },
        { signal: "PO Number Match", weight: 10, score: 0, detail: "No PO extracted" },
        { signal: "Date Closeness", weight: 5, score: 0, detail: "No date extracted" },
      ], explanation: "Weak: Partial vendor match but significant amount difference." },
    ],
    bestMatchInvoiceId: "inv-004", bestMatchConfidence: 45, matchApproved: false, approvedBy: null, approvedAt: null,
    flagged: true, flagReason: "Low OCR quality - manual review required", notes: ["Scan quality is very poor", "Requested vendor to resubmit clearer copy"], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-005", filename: "TerraClean_INV10515_Pipeline_Decom.pdf", uploadedBy: "Sarah Chen", uploadedAt: "2026-02-18T08:45:00Z", fileSize: "4.7 MB",
    processingStatus: "ready_for_review", ocrConfidence: 99,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10515", confidence: 100 },
      { field: "Vendor Name", value: "TerraClean Solutions", confidence: 99 },
      { field: "Invoice Date", value: "2025-12-18", confidence: 98 },
      { field: "Amount", value: "$425,000.00", confidence: 100 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8835", confidence: 97 },
      { field: "Work Order", value: "PRJ-PIPE-005", confidence: 95 },
    ],
    matchCandidates: [
      { invoiceId: "inv-005", confidence: 99, signals: [
        { signal: "Filename Match", weight: 5, score: 5, detail: "Filename contains INV10515" },
        { signal: "Invoice Number Match", weight: 40, score: 40, detail: "OCR Invoice # INV-10515 = Record INV-10515" },
        { signal: "Amount Match", weight: 25, score: 25, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 20, detail: "Vendor name similarity 99%" },
        { signal: "PO Number Match", weight: 10, score: 9, detail: "PO-8835 matches" },
      ], explanation: "Perfect match: Filename, OCR Invoice #, amount, vendor, and PO all match." },
    ],
    bestMatchInvoiceId: "inv-005", bestMatchConfidence: 99, matchApproved: true, approvedBy: "Sarah Chen", approvedAt: "2026-02-18T09:00:00Z",
    flagged: false, flagReason: null, notes: ["Auto-approved - perfect match"], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-006", filename: "EcoRestore_WorkOrder_2026.pdf", uploadedBy: "Mike Rodriguez", uploadedAt: "2026-02-19T16:30:00Z", fileSize: "1.2 MB",
    processingStatus: "ready_for_review", ocrConfidence: 88,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10520", confidence: 90 },
      { field: "Vendor Name", value: "EcoRestore Inc", confidence: 94 },
      { field: "Invoice Date", value: "2025-12-22", confidence: 85 },
      { field: "Amount", value: "$156,300.00", confidence: 92 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8840", confidence: 88 },
    ],
    matchCandidates: [
      { invoiceId: "inv-006", confidence: 91, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 36, detail: "OCR Invoice # INV-10520 = Record INV-10520" },
        { signal: "Amount Match", weight: 25, score: 23, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 19, detail: "Vendor name similarity 94%" },
        { signal: "PO Number Match", weight: 10, score: 9, detail: "PO-8840 matches" },
        { signal: "Date Closeness", weight: 5, score: 4, detail: "Exact date match" },
      ], explanation: "Matched because: OCR Invoice # = INV-10520, Amount within $0.00, Vendor name similarity 94%." },
    ],
    bestMatchInvoiceId: "inv-006", bestMatchConfidence: 91, matchApproved: false, approvedBy: null, approvedAt: null,
    flagged: false, flagReason: null, notes: [], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-007", filename: "unknown_vendor_receipt.pdf", uploadedBy: "Lisa Park", uploadedAt: "2026-02-20T10:00:00Z", fileSize: "0.8 MB",
    processingStatus: "ready_for_review", ocrConfidence: 44,
    extractedFields: [
      { field: "Invoice Number", value: null, confidence: 0 },
      { field: "Vendor Name", value: null, confidence: 0 },
      { field: "Invoice Date", value: "2026-01-10", confidence: 55 },
      { field: "Amount", value: "$290,000", confidence: 60 },
      { field: "Currency", value: "USD", confidence: 85 },
      { field: "PO Number", value: null, confidence: 0 },
    ],
    matchCandidates: [
      { invoiceId: "inv-008", confidence: 28, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 0, detail: "No invoice number extracted" },
        { signal: "Amount Match", weight: 25, score: 15, detail: "Amount within $0.00 (60% confidence)" },
        { signal: "Vendor Similarity", weight: 20, score: 0, detail: "No vendor extracted" },
        { signal: "PO Number Match", weight: 10, score: 0, detail: "No PO extracted" },
        { signal: "Date Closeness", weight: 5, score: 4, detail: "Exact date match" },
      ], explanation: "Very low confidence: Only amount and date matched. No vendor or invoice number extracted from OCR." },
    ],
    bestMatchInvoiceId: null, bestMatchConfidence: 28, matchApproved: false, approvedBy: null, approvedAt: null,
    flagged: true, flagReason: "Unreadable document - insufficient data for matching", notes: ["Document appears to be a scanned receipt, not an invoice", "Flagged for manual review"], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-008", filename: "Acme_INV10501_Remediation.pdf", uploadedBy: "Sarah Chen", uploadedAt: "2026-02-21T13:15:00Z", fileSize: "3.9 MB",
    processingStatus: "ready_for_review", ocrConfidence: 94,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10501", confidence: 96 },
      { field: "Vendor Name", value: "Acme Environmental Services", confidence: 97 },
      { field: "Invoice Date", value: "2025-12-10", confidence: 93 },
      { field: "Amount", value: "$312,400.00", confidence: 98 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8830", confidence: 91 },
      { field: "Work Order", value: "PRJ-WELL-002", confidence: 89 },
    ],
    matchCandidates: [
      { invoiceId: "inv-003", confidence: 95, signals: [
        { signal: "Filename Match", weight: 5, score: 5, detail: "Filename contains INV10501" },
        { signal: "Invoice Number Match", weight: 40, score: 38, detail: "OCR Invoice # INV-10501 = Record INV-10501" },
        { signal: "Amount Match", weight: 25, score: 25, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 19, detail: "Vendor name similarity 97%" },
        { signal: "PO Number Match", weight: 10, score: 9, detail: "PO-8830 matches" },
      ], explanation: "Matched because: Filename + OCR Invoice # = INV-10501, Amount within $0.00, Vendor name similarity 97%." },
    ],
    bestMatchInvoiceId: "inv-003", bestMatchConfidence: 95, matchApproved: false, approvedBy: null, approvedAt: null,
    flagged: false, flagReason: null, notes: [], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-009", filename: "GreenTech_Mine_Closure_INV10530.pdf", uploadedBy: "Mike Rodriguez", uploadedAt: "2026-02-22T09:45:00Z", fileSize: "6.2 MB",
    processingStatus: "ready_for_review", ocrConfidence: 96,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10530", confidence: 98 },
      { field: "Vendor Name", value: "GreenTech Remediation", confidence: 97 },
      { field: "Invoice Date", value: "2026-01-10", confidence: 95 },
      { field: "Amount", value: "$290,000.00", confidence: 99 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8850", confidence: 94 },
    ],
    matchCandidates: [
      { invoiceId: "inv-008", confidence: 97, signals: [
        { signal: "Filename Match", weight: 5, score: 5, detail: "Filename contains INV10530" },
        { signal: "Invoice Number Match", weight: 40, score: 39, detail: "OCR Invoice # INV-10530 = Record INV-10530" },
        { signal: "Amount Match", weight: 25, score: 25, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 19, detail: "Vendor name similarity 97%" },
        { signal: "PO Number Match", weight: 10, score: 9, detail: "PO-8850 matches" },
      ], explanation: "Matched because: Filename + OCR Invoice # = INV-10530, Amount within $0.00, Vendor name similarity 97%." },
    ],
    bestMatchInvoiceId: "inv-008", bestMatchConfidence: 97, matchApproved: true, approvedBy: "Mike Rodriguez", approvedAt: "2026-02-22T10:00:00Z",
    flagged: false, flagReason: null, notes: ["Auto-matched - high confidence"], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
  {
    id: "doc-010", filename: "Pacific_Decom_Settlement_Q1.pdf", uploadedBy: "Lisa Park", uploadedAt: "2026-02-23T15:20:00Z", fileSize: "2.1 MB",
    processingStatus: "ready_for_review", ocrConfidence: 83,
    extractedFields: [
      { field: "Invoice Number", value: "INV-10540", confidence: 86 },
      { field: "Vendor Name", value: "Pacific Decommissioning LLC", confidence: 80 },
      { field: "Invoice Date", value: "2026-01-20", confidence: 82 },
      { field: "Amount", value: "$134,500.00", confidence: 90 },
      { field: "Currency", value: "USD", confidence: 100 },
      { field: "PO Number", value: "PO-8860", confidence: 78 },
    ],
    matchCandidates: [
      { invoiceId: "inv-010", confidence: 82, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 34, detail: "OCR Invoice # INV-10540 = Record INV-10540" },
        { signal: "Amount Match", weight: 25, score: 23, detail: "Amount within $0.00" },
        { signal: "Vendor Similarity", weight: 20, score: 14, detail: "Vendor name similarity 72% ('Pacific Decommissioning LLC' vs 'Pacific Decom LLC')" },
        { signal: "PO Number Match", weight: 10, score: 8, detail: "PO-8860 matches (78% confidence)" },
        { signal: "Date Closeness", weight: 5, score: 3, detail: "Exact date match" },
      ], explanation: "Medium confidence: Invoice number and amount match, but vendor name variation ('Decommissioning' vs 'Decom') lowers score." },
      { invoiceId: "inv-004", confidence: 38, signals: [
        { signal: "Invoice Number Match", weight: 40, score: 0, detail: "Different invoice number" },
        { signal: "Amount Match", weight: 25, score: 5, detail: "Amount difference $35,750" },
        { signal: "Vendor Similarity", weight: 20, score: 14, detail: "Vendor name similarity 72%" },
        { signal: "PO Number Match", weight: 10, score: 0, detail: "No PO on record" },
        { signal: "Date Closeness", weight: 5, score: 2, detail: "36 days apart" },
      ], explanation: "Weak: Same vendor family but different invoice and significant amount difference." },
    ],
    bestMatchInvoiceId: "inv-010", bestMatchConfidence: 82, matchApproved: false, approvedBy: null, approvedAt: null,
    flagged: false, flagReason: null, notes: [], extractionMethod: "ocr", modelVersion: "v2.3.1",
  },
];

// ── Audit Trail ──
export const mockAuditTrail: AuditEntry[] = [
  { id: "aud-001", entityType: "document", entityId: "doc-001", action: "Document Uploaded", performedBy: "Sarah Chen", timestamp: "2026-02-10T09:30:00Z", details: "Uploaded INV-10492_AcmeEnv_Dec2025.pdf (2.4 MB)" },
  { id: "aud-002", entityType: "document", entityId: "doc-001", action: "OCR Processing Complete", performedBy: "System", timestamp: "2026-02-10T09:31:15Z", details: "OCR confidence: 97%. 7 fields extracted.", metadata: { modelVersion: "v2.3.1", method: "ocr" } },
  { id: "aud-003", entityType: "document", entityId: "doc-001", action: "Match Candidates Generated", performedBy: "System", timestamp: "2026-02-10T09:31:20Z", details: "1 candidate generated. Best match: INV-10492 (98% confidence)" },
  { id: "aud-004", entityType: "document", entityId: "doc-001", action: "Match Approved", performedBy: "Sarah Chen", timestamp: "2026-02-10T10:15:00Z", details: "Approved match to INV-10492 (98% confidence)" },
  { id: "aud-005", entityType: "document", entityId: "doc-003", action: "Document Uploaded", performedBy: "Mike Rodriguez", timestamp: "2026-02-12T14:20:00Z", details: "Uploaded GreenTech_Remediation_Invoice_10493.pdf (1.8 MB)" },
  { id: "aud-006", entityType: "document", entityId: "doc-003", action: "OCR Processing Complete", performedBy: "System", timestamp: "2026-02-12T14:21:00Z", details: "OCR confidence: 95%. 6 fields extracted." },
  { id: "aud-007", entityType: "document", entityId: "doc-003", action: "Match Approved", performedBy: "Mike Rodriguez", timestamp: "2026-02-12T15:00:00Z", details: "Approved match to INV-10493 (96% confidence)" },
  { id: "aud-008", entityType: "document", entityId: "doc-004", action: "Document Uploaded", performedBy: "Lisa Park", timestamp: "2026-02-15T11:00:00Z", details: "Uploaded scan_20260115_001.pdf (3.2 MB)" },
  { id: "aud-009", entityType: "document", entityId: "doc-004", action: "Document Flagged", performedBy: "System", timestamp: "2026-02-15T11:01:30Z", details: "Low OCR quality (62%). Flagged for manual review." },
  { id: "aud-010", entityType: "document", entityId: "doc-004", action: "Note Added", performedBy: "Lisa Park", timestamp: "2026-02-16T09:00:00Z", details: "Requested vendor to resubmit clearer copy" },
  { id: "aud-011", entityType: "document", entityId: "doc-007", action: "Document Flagged", performedBy: "System", timestamp: "2026-02-20T10:01:00Z", details: "Unreadable document - insufficient data for matching. OCR confidence: 44%." },
  { id: "aud-012", entityType: "document", entityId: "doc-005", action: "Match Auto-Approved", performedBy: "System", timestamp: "2026-02-18T09:00:00Z", details: "Perfect match to INV-10515 (99% confidence). Auto-approved." },
];

// ── Exception Reasons ──
export const mockExceptionReasons: ExceptionReason[] = [
  { reason: "Missing invoice number", count: 3, severity: "high", recommendedAction: "Request vendor resubmission or manually assign using vendor + amount + date." },
  { reason: "Low OCR confidence", count: 2, severity: "high", recommendedAction: "Request clearer scan from vendor or use manual data entry." },
  { reason: "Vendor mismatch", count: 2, severity: "medium", recommendedAction: "Verify vendor name variations in vendor master list." },
  { reason: "Amount mismatch", count: 1, severity: "medium", recommendedAction: "Review for partial invoices or currency conversion differences." },
  { reason: "Duplicate candidates", count: 1, severity: "medium", recommendedAction: "Review both candidates and select the correct match manually." },
  { reason: "Unreadable scan", count: 1, severity: "high", recommendedAction: "Reject document and request digital copy from vendor." },
  { reason: "Missing date", count: 2, severity: "low", recommendedAction: "Cross-reference with PO or work order dates." },
  { reason: "Unsupported format", count: 0, severity: "low", recommendedAction: "Convert to PDF and re-upload." },
];

// ── Data Quality Trends ──
export const mockDataQualityTrends = [
  { month: "Sep 2025", unmatched: 18, conflictsResolved: 5, completionPct: 72 },
  { month: "Oct 2025", unmatched: 14, conflictsResolved: 8, completionPct: 78 },
  { month: "Nov 2025", unmatched: 11, conflictsResolved: 12, completionPct: 84 },
  { month: "Dec 2025", unmatched: 8, conflictsResolved: 10, completionPct: 89 },
  { month: "Jan 2026", unmatched: 5, conflictsResolved: 7, completionPct: 93 },
  { month: "Feb 2026", unmatched: 3, conflictsResolved: 4, completionPct: 96 },
];

// ── Processing pipeline steps ──
export const processingSteps: { status: ProcessingStatus; label: string; icon: string }[] = [
  { status: "received", label: "File Received", icon: "📥" },
  { status: "ocr_complete", label: "OCR Complete", icon: "🔍" },
  { status: "fields_extracted", label: "Key Fields Extracted", icon: "📋" },
  { status: "candidates_generated", label: "Match Candidates Generated", icon: "🔗" },
  { status: "scored", label: "Confidence Score Assigned", icon: "📊" },
  { status: "ready_for_review", label: "Ready for Review", icon: "✅" },
];

// ── Helper functions ──
export function getConfidenceLevel(score: number): MatchConfidence {
  if (score >= 90) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getDocStatusConfig(status: DocStatus) {
  switch (status) {
    case "complete": return { label: "Complete", className: "bg-green-50 text-green-700 border-green-200" };
    case "attached": return { label: "Attached", className: "bg-blue-50 text-blue-700 border-blue-200" };
    case "needs_review": return { label: "Needs Review", className: "bg-amber-50 text-amber-700 border-amber-200" };
    case "missing": return { label: "Missing", className: "bg-red-50 text-red-700 border-red-200" };
  }
}
