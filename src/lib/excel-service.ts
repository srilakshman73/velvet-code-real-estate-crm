import ExcelJS from 'exceljs';
import { Lead } from '@/types';

export interface LeadsExportPayload {
  organizationName?: string;
  organizationId?: string;
  generatedAt?: string;
  totalCount?: number;
  leads: Lead[];
}

// Velvet Code Luxury Theme Palette (ARGB format for ExcelJS)
const GOLD_PRIMARY = 'FFA37432';
const GOLD_DARK = 'FF7A5520';
const CREAM_BG = 'FFFFF9F0';
const CREAM_HEADER = 'FFF4EAD7';
const CHARCOAL_TEXT = 'FF2C241A';
const MUTED_TEXT = 'FF6A5A44';
const WHITE = 'FFFFFFFF';
const BORDER_GOLD_THIN = 'FFD8C7A5';
const BORDER_GOLD_HEADER = 'FF7A5520';

// Shared Fonts
const fontTitle: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 16,
  bold: true,
  color: { argb: GOLD_DARK },
};

const fontSubtitle: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 10,
  italic: true,
  color: { argb: MUTED_TEXT },
};

const fontSection: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 13,
  bold: true,
  color: { argb: GOLD_DARK },
};

const fontHeader: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 11,
  bold: true,
  color: { argb: WHITE },
};

const fontData: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 10,
  color: { argb: CHARCOAL_TEXT },
};

const fontDataBold: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 10,
  bold: true,
  color: { argb: CHARCOAL_TEXT },
};

const fontKpiValue: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 18,
  bold: true,
  color: { argb: GOLD_DARK },
};

const fontKpiLabel: Partial<ExcelJS.Font> = {
  name: 'Calibri',
  size: 9,
  bold: true,
  color: { argb: MUTED_TEXT },
};

// Shared Fills
const fillGoldHeader: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: GOLD_PRIMARY },
};

const fillCreamHeader: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: CREAM_HEADER },
};

const fillRowEven: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: CREAM_BG },
};

const fillRowOdd: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: WHITE },
};

const fillKpiCard: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: CREAM_BG },
};

// Shared Borders
const thinGoldBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: BORDER_GOLD_THIN } },
  left: { style: 'thin', color: { argb: BORDER_GOLD_THIN } },
  bottom: { style: 'thin', color: { argb: BORDER_GOLD_THIN } },
  right: { style: 'thin', color: { argb: BORDER_GOLD_THIN } },
};

const headerBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'medium', color: { argb: BORDER_GOLD_HEADER } },
  left: { style: 'thin', color: { argb: BORDER_GOLD_HEADER } },
  bottom: { style: 'medium', color: { argb: BORDER_GOLD_HEADER } },
  right: { style: 'thin', color: { argb: BORDER_GOLD_HEADER } },
};

// Shared Alignments
const alignCenter: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };
const alignLeft: Partial<ExcelJS.Alignment> = { horizontal: 'left', vertical: 'middle' };
const alignRight: Partial<ExcelJS.Alignment> = { horizontal: 'right', vertical: 'middle' };
const alignHeader: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle', wrapText: true };

/**
 * Builds the complete Velvet Code luxury multi-sheet Excel workbook
 * 1. "All Leads" — complete lead database with luxury styling, filters & formulas
 * 2. "Lead Dashboard" — KPI metrics cards, breakdown tables & conversion ratios
 * 3. "Lead Strategy" — Actionable CRM sales playbook based on lead statuses
 * 4. "Instructions" — Comprehensive guide to fields, formulas & data protection
 */
export async function generateLeadsWorkbook(payload: LeadsExportPayload): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Velvet Code Real Estate CRM';
  wb.lastModifiedBy = 'Velvet Code Platform';
  wb.created = new Date();
  wb.modified = new Date();

  const orgName = payload.organizationName || 'Velvet Code Real Estate CRM';
  const generatedAt =
    payload.generatedAt ||
    new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  const leads = Array.isArray(payload.leads) ? payload.leads : [];

  // =============================================================
  // SHEET 1: "All Leads"
  // =============================================================
  const wsLeads = wb.addWorksheet('All Leads', {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  // Title Block
  wsLeads.mergeCells('A1:S1');
  const leadTitle = wsLeads.getCell('A1');
  leadTitle.value = `${orgName.toUpperCase()} — REAL ESTATE LEADS DIRECTORY`;
  leadTitle.font = fontTitle;
  leadTitle.alignment = alignLeft;

  wsLeads.mergeCells('A2:S2');
  const leadSubtitle = wsLeads.getCell('A2');
  leadSubtitle.value = `Confidential Multi-Tenant Export • Generated on: ${generatedAt} • Total Leads: ${leads.length}`;
  leadSubtitle.font = fontSubtitle;
  leadSubtitle.alignment = alignLeft;

  const headers = [
    'Lead ID',
    'Buyer Full Name',
    'Phone / WhatsApp',
    'Email Address',
    'Max Budget (INR)',
    'Min Budget (INR)',
    'Lead Source',
    'Lead Status',
    'Priority',
    'Lead Score',
    'Interested Property',
    'Assigned Agent',
    'Preferred Location / City',
    'Preferred Property Type',
    'Requirements & Notes',
    'Lead Photo / Media Status',
    'Next Follow-Up Date',
    'Created Date',
    'Last Updated Date',
  ];

  const headerRowIdx = 4;
  const headerRow = wsLeads.getRow(headerRowIdx);
  headerRow.height = 28;

  headers.forEach((hText, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = hText;
    cell.font = fontHeader;
    cell.fill = fillGoldHeader;
    cell.alignment = alignHeader;
    cell.border = headerBorder;
  });

  // Populate Data Rows
  let currentRowIdx = 5;
  leads.forEach((lead, idx) => {
    const row = wsLeads.getRow(currentRowIdx);
    row.height = 20;
    const rowFill = idx % 2 === 0 ? fillRowEven : fillRowOdd;

    let imgStatus = 'No Image Attached';
    const imageVal = lead.imageUrl || '';
    if (imageVal.startsWith('data:image')) {
      imgStatus = 'Uploaded (Base64 Image Attached)';
    } else if (imageVal.startsWith('http')) {
      imgStatus = imageVal;
    }

    const rowData = [
      lead.id || `lead-${idx + 1}`,
      lead.name || 'N/A',
      lead.phone || 'N/A',
      lead.email || '—',
      lead.budgetMaxINR !== undefined && lead.budgetMaxINR !== null ? Number(lead.budgetMaxINR) : 0,
      lead.budgetMinINR !== undefined && lead.budgetMinINR !== null ? Number(lead.budgetMinINR) : 0,
      String(lead.source || 'OTHER'),
      String(lead.status || 'NEW'),
      String(lead.priority || 'MEDIUM'),
      lead.score !== undefined && lead.score !== null ? Number(lead.score) : 65,
      lead.interestedPropertyName || lead.interestedPropertyId || 'General Portfolio',
      lead.assignedToName || 'Unassigned',
      lead.preferredLocation || 'Chennai',
      lead.preferredType || 'APARTMENT',
      lead.notes || 'No notes provided.',
      imgStatus,
      lead.nextFollowUpAt ? String(lead.nextFollowUpAt) : '—',
      lead.createdAt ? String(lead.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
      lead.updatedAt ? String(lead.updatedAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = fontData;
      cell.fill = rowFill;
      cell.border = thinGoldBorder;

      const colNum = colIdx + 1;
      if (colNum === 5 || colNum === 6) {
        cell.numFmt = '₹#,##,##0';
        cell.alignment = alignRight;
      } else if (colNum === 10) {
        cell.numFmt = '#,##0';
        cell.alignment = alignCenter;
      } else if ([1, 8, 9, 14, 17, 18, 19].includes(colNum)) {
        cell.alignment = alignCenter;
      } else {
        cell.alignment = alignLeft;
      }
    });

    currentRowIdx++;
  });

  const lastRow = Math.max(currentRowIdx - 1, 5);
  wsLeads.autoFilter = `A4:S${lastRow}`;

  // Column Widths
  const leadsWidths = [16, 24, 18, 24, 18, 18, 18, 18, 14, 14, 28, 20, 22, 18, 32, 30, 20, 16, 16];
  leadsWidths.forEach((w, idx) => {
    wsLeads.getColumn(idx + 1).width = w;
  });

  // =============================================================
  // SHEET 2: "Lead Dashboard"
  // =============================================================
  const wsDash = wb.addWorksheet('Lead Dashboard');

  // Title Block
  wsDash.mergeCells('A1:J1');
  const dashTitle = wsDash.getCell('A1');
  dashTitle.value = `${orgName.toUpperCase()} — EXECUTIVE CRM ANALYTICS DASHBOARD`;
  dashTitle.font = fontTitle;
  dashTitle.alignment = alignLeft;

  wsDash.mergeCells('A2:J2');
  const dashSubtitle = wsDash.getCell('A2');
  dashSubtitle.value = `Real-time KPI metrics, conversion pipeline ratios & source distribution • ${generatedAt}`;
  dashSubtitle.font = fontSubtitle;
  dashSubtitle.alignment = alignLeft;

  // Aggregate Metrics
  const totalLeadsCount = leads.length;
  const statusCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  let totalPipelineValue = 0;

  leads.forEach((l) => {
    const st = String(l.status || 'NEW').toUpperCase();
    statusCounts[st] = (statusCounts[st] || 0) + 1;

    const src = String(l.source || 'OTHER');
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;

    const pt = String(l.preferredType || 'APARTMENT');
    typeCounts[pt] = (typeCounts[pt] || 0) + 1;

    const b = Number(l.budgetMaxINR) || 0;
    totalPipelineValue += b;
  });

  const avgBudget = totalLeadsCount > 0 ? Math.round(totalPipelineValue / totalLeadsCount) : 0;

  const kpis = [
    { label: 'TOTAL ACTIVE LEADS', value: totalLeadsCount, format: '#,##0' },
    { label: 'TOTAL PIPELINE VALUE', value: totalPipelineValue, format: '₹#,##,##0' },
    { label: 'AVERAGE BUYER BUDGET', value: avgBudget, format: '₹#,##,##0' },
    { label: 'NEW LEADS', value: (statusCounts['NEW'] || 0) + (statusCounts['NEW_LEAD'] || 0), format: '#,##0' },
    { label: 'QUALIFIED LEADS', value: statusCounts['QUALIFIED'] || 0, format: '#,##0' },
    { label: 'SITE VISITS ACTIVE', value: statusCounts['SITE_VISIT'] || 0, format: '#,##0' },
    { label: 'IN NEGOTIATION', value: statusCounts['NEGOTIATION'] || 0, format: '#,##0' },
    { label: 'WON / CONVERTED', value: (statusCounts['WON'] || 0) + (statusCounts['CONVERTED'] || 0), format: '#,##0' },
  ];

  // Helper to format KPI cards
  const drawKpiCard = (startRow: number, startCol: number, label: string, val: number, fmt: string) => {
    wsDash.mergeCells(startRow, startCol, startRow, startCol + 1);
    wsDash.mergeCells(startRow + 1, startCol, startRow + 1, startCol + 1);

    const cLabel = wsDash.getCell(startRow, startCol);
    cLabel.value = label;
    cLabel.font = fontKpiLabel;
    cLabel.alignment = alignCenter;
    cLabel.fill = fillCreamHeader;
    cLabel.border = thinGoldBorder;

    const cLabel2 = wsDash.getCell(startRow, startCol + 1);
    cLabel2.border = thinGoldBorder;

    const cVal = wsDash.getCell(startRow + 1, startCol);
    cVal.value = val;
    cVal.font = fontKpiValue;
    cVal.alignment = alignCenter;
    cVal.fill = fillKpiCard;
    cVal.border = thinGoldBorder;
    cVal.numFmt = fmt;

    const cVal2 = wsDash.getCell(startRow + 1, startCol + 1);
    cVal2.border = thinGoldBorder;
  };

  // Row 4-5: KPI Row 1
  let colPointer = 1;
  kpis.slice(0, 4).forEach((k) => {
    drawKpiCard(4, colPointer, k.label, k.value, k.format);
    colPointer += 2;
  });

  // Row 7-8: KPI Row 2
  colPointer = 1;
  kpis.slice(4).forEach((k) => {
    drawKpiCard(7, colPointer, k.label, k.value, k.format);
    colPointer += 2;
  });

  // Breakdown Tables (Row 11+)
  // 1. Leads by Status (Cols A-B)
  const cellStatusTitle = wsDash.getCell(11, 1);
  cellStatusTitle.value = 'LEADS BY STATUS';
  cellStatusTitle.font = fontSection;

  const hSt1 = wsDash.getCell(12, 1);
  hSt1.value = 'Status Stage';
  hSt1.font = fontHeader;
  hSt1.fill = fillGoldHeader;
  hSt1.border = headerBorder;
  hSt1.alignment = alignLeft;

  const hSt2 = wsDash.getCell(12, 2);
  hSt2.value = 'Lead Count';
  hSt2.font = fontHeader;
  hSt2.fill = fillGoldHeader;
  hSt2.border = headerBorder;
  hSt2.alignment = alignRight;

  const activeStatusCounts = Object.keys(statusCounts).length > 0
    ? statusCounts
    : { NEW: 0, CONTACTED: 0, QUALIFIED: 0, SITE_VISIT: 0, NEGOTIATION: 0 };

  let statusRow = 13;
  Object.entries(activeStatusCounts).forEach(([stName, cnt]) => {
    const c1 = wsDash.getCell(statusRow, 1);
    c1.value = stName;
    c1.font = fontDataBold;
    c1.border = thinGoldBorder;
    c1.fill = statusRow % 2 === 0 ? fillRowEven : fillRowOdd;

    const c2 = wsDash.getCell(statusRow, 2);
    c2.value = cnt;
    c2.font = fontData;
    c2.numFmt = '#,##0';
    c2.alignment = alignRight;
    c2.border = thinGoldBorder;
    c2.fill = statusRow % 2 === 0 ? fillRowEven : fillRowOdd;
    statusRow++;
  });

  // 2. Leads by Source (Cols D-E)
  const cellSourceTitle = wsDash.getCell(11, 4);
  cellSourceTitle.value = 'LEADS BY ACQUISITION SOURCE';
  cellSourceTitle.font = fontSection;

  const hSrc1 = wsDash.getCell(12, 4);
  hSrc1.value = 'Channel / Source';
  hSrc1.font = fontHeader;
  hSrc1.fill = fillGoldHeader;
  hSrc1.border = headerBorder;
  hSrc1.alignment = alignLeft;

  const hSrc2 = wsDash.getCell(12, 5);
  hSrc2.value = 'Lead Count';
  hSrc2.font = fontHeader;
  hSrc2.fill = fillGoldHeader;
  hSrc2.border = headerBorder;
  hSrc2.alignment = alignRight;

  const activeSourceCounts = Object.keys(sourceCounts).length > 0
    ? sourceCounts
    : { 'Website Ingestion': 0, 'WhatsApp Inbound': 0, 'Direct Phone Call': 0 };

  let sourceRow = 13;
  Object.entries(activeSourceCounts).forEach(([srcName, cnt]) => {
    const c1 = wsDash.getCell(sourceRow, 4);
    c1.value = srcName;
    c1.font = fontDataBold;
    c1.border = thinGoldBorder;
    c1.fill = sourceRow % 2 === 0 ? fillRowEven : fillRowOdd;

    const c2 = wsDash.getCell(sourceRow, 5);
    c2.value = cnt;
    c2.font = fontData;
    c2.numFmt = '#,##0';
    c2.alignment = alignRight;
    c2.border = thinGoldBorder;
    c2.fill = sourceRow % 2 === 0 ? fillRowEven : fillRowOdd;
    sourceRow++;
  });

  // 3. Leads by Property Type (Cols G-H)
  const cellTypeTitle = wsDash.getCell(11, 7);
  cellTypeTitle.value = 'LEADS BY PROPERTY TYPE';
  cellTypeTitle.font = fontSection;

  const hPt1 = wsDash.getCell(12, 7);
  hPt1.value = 'Property Type';
  hPt1.font = fontHeader;
  hPt1.fill = fillGoldHeader;
  hPt1.border = headerBorder;
  hPt1.alignment = alignLeft;

  const hPt2 = wsDash.getCell(12, 8);
  hPt2.value = 'Lead Count';
  hPt2.font = fontHeader;
  hPt2.fill = fillGoldHeader;
  hPt2.border = headerBorder;
  hPt2.alignment = alignRight;

  const activeTypeCounts = Object.keys(typeCounts).length > 0
    ? typeCounts
    : { APARTMENT: 0, VILLA: 0, PENTHOUSE: 0 };

  let typeRow = 13;
  Object.entries(activeTypeCounts).forEach(([tName, cnt]) => {
    const c1 = wsDash.getCell(typeRow, 7);
    c1.value = tName;
    c1.font = fontDataBold;
    c1.border = thinGoldBorder;
    c1.fill = typeRow % 2 === 0 ? fillRowEven : fillRowOdd;

    const c2 = wsDash.getCell(typeRow, 8);
    c2.value = cnt;
    c2.font = fontData;
    c2.numFmt = '#,##0';
    c2.alignment = alignRight;
    c2.border = thinGoldBorder;
    c2.fill = typeRow % 2 === 0 ? fillRowEven : fillRowOdd;
    typeRow++;
  });

  const dashWidths = [22, 14, 6, 26, 14, 6, 24, 14, 20, 14];
  dashWidths.forEach((w, idx) => {
    wsDash.getColumn(idx + 1).width = w;
  });

  // =============================================================
  // SHEET 3: "Lead Strategy"
  // =============================================================
  const wsStrat = wb.addWorksheet('Lead Strategy');

  wsStrat.mergeCells('A1:G1');
  const stratTitle = wsStrat.getCell('A1');
  stratTitle.value = `${orgName.toUpperCase()} — REAL ESTATE SALES STRATEGY & STAGE PROTOCOLS`;
  stratTitle.font = fontTitle;
  stratTitle.alignment = alignLeft;

  wsStrat.mergeCells('A2:G2');
  const stratSubtitle = wsStrat.getCell('A2');
  stratSubtitle.value = 'Actionable CRM conversion framework, SLA turnaround benchmarks & communication guidelines.';
  stratSubtitle.font = fontSubtitle;
  stratSubtitle.alignment = alignLeft;

  const stratHeaders = [
    'Pipeline Stage / Status',
    'Stage Objective',
    'Mandatory Next Actions & CRM Protocol',
    'Target SLA Turnaround',
    'Primary Communication Channel',
    'Key Milestone for Advancement',
    'Automation / Trigger',
  ];

  const stratHeaderRow = wsStrat.getRow(4);
  stratHeaderRow.height = 28;
  stratHeaders.forEach((hText, idx) => {
    const cell = stratHeaderRow.getCell(idx + 1);
    cell.value = hText;
    cell.font = fontHeader;
    cell.fill = fillGoldHeader;
    cell.alignment = alignHeader;
    cell.border = headerBorder;
  });

  const strategyPlaybook = [
    [
      'New Lead (NEW / NEW_LEAD)',
      'Instant engagement & initial qualification',
      '1. Trigger automated WhatsApp welcome message with brochure.\n2. Realtor initiates voice call within 15 mins.\n3. Validate budget, timeline, location preference, and purchase purpose.',
      '< 15 Minutes',
      'WhatsApp & Direct Phone Call',
      'Budget & timeline verified; Buyer expresses active purchase intent.',
      'Welcome WhatsApp Automation',
    ],
    [
      'Contacted (CONTACTED)',
      'Property matching & discovery consultation',
      '1. Send curated digital property deck of 2-3 matched listings.\n2. Schedule in-depth Zoom or in-person discovery consultation.\n3. Log notes and record specific buyer layout requirements.',
      '< 24 Hours',
      'WhatsApp Media & Voice Call',
      'Buyer selects preferred property units for physical inspection.',
      'Property Deck Dispatch',
    ],
    [
      'Qualified (QUALIFIED)',
      'Site visit scheduling & consultant assignment',
      '1. Assign dedicated property consultant.\n2. Coordinate VIP chauffeur/site visit slot on calendar.\n3. Send location pin, route briefing, and developer profile.',
      '< 48 Hours',
      'Calendar Invite & WhatsApp Pin',
      'Site visit confirmed with specific date and time slot.',
      'Site Visit Confirmation SMS',
    ],
    [
      'Site Visit (SITE_VISIT)',
      'Experiential walkthrough & objection resolution',
      '1. Escort client through property model unit, clubhouse, and amenities.\n2. Highlight floor plans, carpet area, facing direction, and view.\n3. Log post-visit client feedback within 2 hours of completion.',
      'Same Day',
      'In-Person Walkthrough',
      'Client requests pricing breakdown, payment schedule, or draft agreement.',
      'Post-Visit Survey Trigger',
    ],
    [
      'Negotiation (NEGOTIATION)',
      'Offer structuring, commercial closing & KYC',
      '1. Structure unit discount, payment milestones, and car park allotment.\n2. Collect KYC documents (PAN, Aadhaar, Proof of Address).\n3. Prepare booking token agreement with developer legal team.',
      '< 3 Business Days',
      'In-Person Meeting & Official Email',
      'Signed agreement and receipt of booking advance payment.',
      'Deal Milestone Alert',
    ],
    [
      'Won / Converted (WON / CONVERTED)',
      'Closing onboarding & referral acquisition',
      '1. Issue official booking confirmation and payment receipt.\n2. Handover documentation to post-sales registration concierge.\n3. Request client testimonial and referral introductions.',
      '< 24 Hours',
      'Celebration Call & Email Kit',
      'Sale deed registered; full payment schedule initiated.',
      'Closing Confetti & Gift Dispatch',
    ],
    [
      'Lost (LOST)',
      'Root cause analysis & re-engagement nurturing',
      '1. Log exact loss reason (Budget / Location / Competitor / Inactive).\n2. Tag for automated quarterly re-engagement campaign on new launches.\n3. Maintain professional goodwill for future property inquiries.',
      'Immediate Log',
      'WhatsApp Nurture Campaign',
      'Re-activation on future project launches matching buyer criteria.',
      'Quarterly Nurture Workflow',
    ],
    [
      'Custom Status (User Defined)',
      'Tailored workflow execution',
      '1. Apply tenant-specific operational checklist.\n2. Log activities under custom status categorization in CRM audit log.\n3. Set custom follow-up reminder for assigned agent.',
      'As Defined',
      'WhatsApp / Email / Task',
      'Advancement according to custom sales milestone.',
      'Custom Event Trigger',
    ],
  ];

  let stratRowIdx = 5;
  strategyPlaybook.forEach((item, idx) => {
    const row = wsStrat.getRow(stratRowIdx);
    row.height = 46;
    const rowFill = idx % 2 === 0 ? fillRowEven : fillRowOdd;

    item.forEach((text, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = text;
      cell.font = colIdx === 0 ? fontDataBold : fontData;
      cell.fill = rowFill;
      cell.border = thinGoldBorder;

      if ([0, 3, 4, 6].includes(colIdx)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
    });

    stratRowIdx++;
  });

  const stratWidths = [24, 28, 44, 18, 24, 32, 24];
  stratWidths.forEach((w, idx) => {
    wsStrat.getColumn(idx + 1).width = w;
  });

  // =============================================================
  // SHEET 4: "Instructions"
  // =============================================================
  const wsInst = wb.addWorksheet('Instructions');

  wsInst.mergeCells('A1:E1');
  const instTitle = wsInst.getCell('A1');
  instTitle.value = `${orgName.toUpperCase()} — CRM EXCEL WORKBOOK USER GUIDE & FIELD DICTIONARY`;
  instTitle.font = fontTitle;
  instTitle.alignment = alignLeft;

  wsInst.mergeCells('A2:E2');
  const instSubtitle = wsInst.getCell('A2');
  instSubtitle.value = 'Comprehensive guide to interacting with workbook sheets, formulas, custom fields, and data protection rules.';
  instSubtitle.font = fontSubtitle;
  instSubtitle.alignment = alignLeft;

  const instSections = [
    {
      title: '1. WORKBOOK OVERVIEW & STRUCTURE',
      items: [
        ['Sheet: All Leads', 'Contains exhaustive records for all leads matching your export selection. Equipped with Excel AutoFilters, frozen headers, and INR currency formatting.'],
        ['Sheet: Lead Dashboard', 'Executive summary displaying real-time calculated KPIs, pipeline valuation, stage distributions, and formatted summary tables.'],
        ['Sheet: Lead Strategy', 'Operational sales playbook detailing recommended actions, SLA response timelines, communication channels, and advancement milestones per stage.'],
        ['Sheet: Instructions', 'Reference guide explaining workbook features, field dictionaries, and multi-tenant security guarantees.'],
      ],
    },
    {
      title: '2. DATA DICTIONARY & FIELD SPECIFICATIONS',
      items: [
        ['Max Budget (INR)', 'Maximum purchasing budget specified by buyer. Formatted as Indian Rupees (INR) with normalized numeric values (leading zeros stripped).'],
        ['Lead Source', 'Acquisition channel. Supports standard presets (Website, WhatsApp, Direct Call) as well as custom user-defined sources.'],
        ['Lead Status', 'Current sales pipeline stage. Supports standard stages (New Lead, Contacted, Qualified, Site Visit, Negotiation, Won, Lost) and custom statuses.'],
        ['Lead Score', 'Proprietary algorithmic qualification score (1-100) evaluating buyer engagement and purchase readiness.'],
        ['Assigned Agent', 'Licensed consultant assigned to manage this relationship within your organization.'],
        ['Lead Photo / Media', 'Indicates whether the buyer has an uploaded authentic profile/id image or base64 asset.'],
      ],
    },
    {
      title: '3. BEST PRACTICES & INTERACTIVITY',
      items: [
        ['Filtering & Sorting', 'Click the dropdown arrow in any header cell in "All Leads" to filter by Status, Source, Agent, or sort by Budget.'],
        ['Summary Tables', 'Tables in "Lead Dashboard" summarize metrics directly from your CRM data at the moment of export.'],
        ['Security Notice', 'This document contains confidential business intelligence. Strictly scoped to your organization. Do not share externally.'],
      ],
    },
  ];

  let instRowIdx = 4;
  instSections.forEach((sec) => {
    // Section Header
    wsInst.mergeCells(instRowIdx, 1, instRowIdx, 5);
    const secCell = wsInst.getCell(instRowIdx, 1);
    secCell.value = sec.title;
    secCell.font = fontSection;
    secCell.fill = fillCreamHeader;
    secCell.alignment = alignLeft;
    wsInst.getRow(instRowIdx).height = 24;
    instRowIdx++;

    // Table Header
    const h1 = wsInst.getCell(instRowIdx, 1);
    h1.value = 'Topic / Field Name';
    h1.font = fontHeader;
    h1.fill = fillGoldHeader;
    h1.border = headerBorder;
    h1.alignment = alignLeft;

    wsInst.mergeCells(instRowIdx, 2, instRowIdx, 5);
    const h2 = wsInst.getCell(instRowIdx, 2);
    h2.value = 'Description & Operational Guidance';
    h2.font = fontHeader;
    h2.fill = fillGoldHeader;
    h2.border = headerBorder;
    h2.alignment = alignLeft;

    for (let c = 3; c <= 5; c++) {
      wsInst.getCell(instRowIdx, c).border = headerBorder;
    }
    wsInst.getRow(instRowIdx).height = 22;
    instRowIdx++;

    // Data Items
    sec.items.forEach(([fName, fDesc], idx) => {
      const rowFill = idx % 2 === 0 ? fillRowEven : fillRowOdd;

      const c1 = wsInst.getCell(instRowIdx, 1);
      c1.value = fName;
      c1.font = fontDataBold;
      c1.fill = rowFill;
      c1.border = thinGoldBorder;
      c1.alignment = alignLeft;

      wsInst.mergeCells(instRowIdx, 2, instRowIdx, 5);
      const c2 = wsInst.getCell(instRowIdx, 2);
      c2.value = fDesc;
      c2.font = fontData;
      c2.fill = rowFill;
      c2.border = thinGoldBorder;
      c2.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      for (let c = 3; c <= 5; c++) {
        wsInst.getCell(instRowIdx, c).border = thinGoldBorder;
      }

      wsInst.getRow(instRowIdx).height = 32;
      instRowIdx++;
    });

    instRowIdx++;
  });

  const instWidths = [28, 25, 25, 25, 25];
  instWidths.forEach((w, idx) => {
    wsInst.getColumn(idx + 1).width = w;
  });

  return wb;
}

/**
 * Convenience method to generate the workbook and return a binary Buffer directly.
 */
export async function generateLeadsWorkbookBuffer(payload: LeadsExportPayload): Promise<Buffer> {
  const wb = await generateLeadsWorkbook(payload);
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}

