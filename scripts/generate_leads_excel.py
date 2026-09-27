#!/usr/bin/env python3
"""
Velvet Code Real Estate CRM — Luxury Excel Report Generator
Generates a multi-sheet .xlsx workbook:
  1. "All Leads" — complete lead database with luxury styling, filters & formulas
  2. "Lead Dashboard" — KPI metrics cards, breakdown tables & native Excel charts
  3. "Lead Strategy" — Actionable CRM sales playbook based on lead statuses
"""

import sys
import json
import os
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, PieChart, Reference, Series

# Luxury Velvet Code Color Palette
GOLD_PRIMARY = "A37432"
GOLD_DARK = "7A5520"
GOLD_LIGHT = "C39A5B"
CREAM_BG = "FFF9F0"
CREAM_HEADER = "F4EAD7"
CREAM_ACCENT = "E9DFC8"
CHARCOAL_TEXT = "2C241A"
MUTED_TEXT = "6A5A44"
WHITE = "FFFFFF"
GREEN_WON = "547A61"
RED_LOST = "8B4A4A"

# Styles
font_title = Font(name="Calibri", size=16, bold=True, color=GOLD_DARK)
font_subtitle = Font(name="Calibri", size=10, italic=True, color=MUTED_TEXT)
font_section = Font(name="Calibri", size=13, bold=True, color=GOLD_DARK)
font_header = Font(name="Calibri", size=11, bold=True, color=WHITE)
font_header_dark = Font(name="Calibri", size=11, bold=True, color=CHARCOAL_TEXT)
font_data = Font(name="Calibri", size=10, color=CHARCOAL_TEXT)
font_data_bold = Font(name="Calibri", size=10, bold=True, color=CHARCOAL_TEXT)
font_data_muted = Font(name="Calibri", size=9, italic=True, color=MUTED_TEXT)
font_kpi_value = Font(name="Calibri", size=18, bold=True, color=GOLD_DARK)
font_kpi_label = Font(name="Calibri", size=9, bold=True, color=MUTED_TEXT)

fill_gold_header = PatternFill(start_color=GOLD_PRIMARY, end_color=GOLD_PRIMARY, fill_type="solid")
fill_cream_header = PatternFill(start_color=CREAM_HEADER, end_color=CREAM_HEADER, fill_type="solid")
fill_cream_row_even = PatternFill(start_color=CREAM_BG, end_color=CREAM_BG, fill_type="solid")
fill_cream_row_odd = PatternFill(start_color=WHITE, end_color=WHITE, fill_type="solid")
fill_kpi_card = PatternFill(start_color=CREAM_BG, end_color=CREAM_BG, fill_type="solid")

thin_gold_border = Border(
    left=Side(style='thin', color='D8C7A5'),
    right=Side(style='thin', color='D8C7A5'),
    top=Side(style='thin', color='D8C7A5'),
    bottom=Side(style='thin', color='D8C7A5')
)
header_border = Border(
    left=Side(style='thin', color='7A5520'),
    right=Side(style='thin', color='7A5520'),
    top=Side(style='medium', color='7A5520'),
    bottom=Side(style='medium', color='7A5520')
)

align_center = Alignment(horizontal='center', vertical='center')
align_left = Alignment(horizontal='left', vertical='center')
align_right = Alignment(horizontal='right', vertical='center')
align_header = Alignment(horizontal='center', vertical='center', wrap_text=True)

def generate_leads_workbook(payload_data, output_path):
    wb = openpyxl.Workbook()
    # Remove default sheet
    if 'Sheet' in wb.sheetnames:
        wb.remove(wb['Sheet'])
    
    org_name = payload_data.get('organizationName', 'Velvet Code Real Estate')
    generated_at = payload_data.get('generatedAt', datetime.now().strftime('%d-%b-%Y %I:%M %p'))
    leads = payload_data.get('leads', [])
    
    # -------------------------------------------------------------
    # SHEET 1: "All Leads"
    # -------------------------------------------------------------
    ws_leads = wb.create_sheet(title="All Leads")
    
    # Title Block
    ws_leads.merge_cells('A1:S1')
    ws_leads['A1'] = f"{org_name.upper()} — REAL ESTATE LEADS DIRECTORY"
    ws_leads['A1'].font = font_title
    ws_leads['A1'].alignment = align_left
    
    ws_leads.merge_cells('A2:S2')
    ws_leads['A2'] = f"Confidential Multi-Tenant Export • Generated on: {generated_at} • Total Leads: {len(leads)}"
    ws_leads['A2'].font = font_subtitle
    ws_leads['A2'].alignment = align_left
    
    headers = [
        "Lead ID",
        "Buyer Full Name",
        "Phone / WhatsApp",
        "Email Address",
        "Max Budget (INR)",
        "Min Budget (INR)",
        "Lead Source",
        "Lead Status",
        "Priority",
        "Lead Score",
        "Interested Property",
        "Assigned Agent",
        "Preferred Location / City",
        "Preferred Property Type",
        "Requirements & Notes",
        "Lead Photo / Media Status",
        "Next Follow-Up Date",
        "Created Date",
        "Last Updated Date"
    ]
    
    header_row = 4
    for col_idx, header_text in enumerate(headers, start=1):
        cell = ws_leads.cell(row=header_row, column=col_idx, value=header_text)
        cell.font = font_header
        cell.fill = fill_gold_header
        cell.alignment = align_header
        cell.border = header_border
    
    ws_leads.row_dimensions[header_row].height = 28
    
    # Populate Data Rows
    current_row = header_row + 1
    for idx, lead in enumerate(leads):
        row_fill = fill_cream_row_even if idx % 2 == 0 else fill_cream_row_odd
        
        # Determine image status text
        image_val = lead.get('imageUrl') or ''
        if image_val.startswith('data:image'):
            img_status = "Uploaded (Base64 Image Attached)"
        elif image_val.startswith('http'):
            img_status = image_val
        else:
            img_status = "No Image Attached"
            
        row_data = [
            lead.get('id', f'lead-{idx+1}'),
            lead.get('name', 'N/A'),
            lead.get('phone', 'N/A'),
            lead.get('email', '—'),
            lead.get('budgetMaxINR') if lead.get('budgetMaxINR') is not None else 0,
            lead.get('budgetMinINR') if lead.get('budgetMinINR') is not None else 0,
            str(lead.get('source', 'OTHER')),
            str(lead.get('status', 'NEW')),
            str(lead.get('priority', 'MEDIUM')),
            lead.get('score', 65),
            lead.get('interestedPropertyName') or lead.get('interestedPropertyId') or 'General Portfolio',
            lead.get('assignedToName') or 'Unassigned',
            lead.get('preferredLocation') or 'Chennai',
            lead.get('preferredType') or 'APARTMENT',
            lead.get('notes') or 'No notes provided.',
            img_status,
            lead.get('nextFollowUpAt', '—') if lead.get('nextFollowUpAt') else '—',
            lead.get('createdAt', datetime.now().strftime('%Y-%m-%d'))[:10],
            lead.get('updatedAt', datetime.now().strftime('%Y-%m-%d'))[:10]
        ]
        
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws_leads.cell(row=current_row, column=col_idx, value=val)
            cell.font = font_data
            cell.fill = row_fill
            cell.border = thin_gold_border
            
            # Formats
            if col_idx in (5, 6): # Budgets (INR)
                cell.number_format = '₹#,##,##0'
                cell.alignment = align_right
            elif col_idx in (10,): # Score
                cell.alignment = align_center
                cell.number_format = '#,##0'
            elif col_idx in (1, 8, 9, 14, 17, 18, 19):
                cell.alignment = align_center
            else:
                cell.alignment = align_left
                
        ws_leads.row_dimensions[current_row].height = 20
        current_row += 1

    # Freeze header and enable filter
    ws_leads.freeze_panes = 'A5'
    last_row = max(current_row - 1, 5)
    last_col_letter = get_column_letter(len(headers))
    ws_leads.auto_filter.ref = f"A4:{last_col_letter}{last_row}"
    
    # Auto-adjust column widths with minimum and padding
    for col in ws_leads.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.row >= 4 and cell.value:
                val_str = str(cell.value)
                max_len = max(max_len, len(val_str))
        ws_leads.column_dimensions[col_letter].width = max(max_len + 4, 13)
        
    ws_leads.column_dimensions['A'].width = 16 # ID
    ws_leads.column_dimensions['B'].width = 24 # Name
    ws_leads.column_dimensions['C'].width = 18 # Phone
    ws_leads.column_dimensions['D'].width = 24 # Email
    ws_leads.column_dimensions['E'].width = 18 # Max Budget
    ws_leads.column_dimensions['K'].width = 28 # Property
    ws_leads.column_dimensions['O'].width = 32 # Notes
    ws_leads.column_dimensions['P'].width = 30 # Image Status

    # -------------------------------------------------------------
    # SHEET 2: "Lead Dashboard"
    # -------------------------------------------------------------
    ws_dash = wb.create_sheet(title="Lead Dashboard")
    
    # Dashboard Header
    ws_dash.merge_cells('A1:J1')
    ws_dash['A1'] = f"{org_name.upper()} — EXECUTIVE CRM ANALYTICS DASHBOARD"
    ws_dash['A1'].font = font_title
    ws_dash['A1'].alignment = align_left
    
    ws_dash.merge_cells('A2:J2')
    ws_dash['A2'] = f"Real-time KPI metrics, conversion pipeline ratios & source distribution • {generated_at}"
    ws_dash['A2'].font = font_subtitle
    ws_dash['A2'].alignment = align_left

    # Total Count & Totals
    total_leads_count = len(leads)
    
    # Aggregation Dictionaries
    status_counts = {}
    source_counts = {}
    agent_counts = {}
    type_counts = {}
    total_pipeline_value = 0
    
    for l in leads:
        st = str(l.get('status', 'NEW')).upper()
        status_counts[st] = status_counts.get(st, 0) + 1
        
        src = str(l.get('source', 'OTHER'))
        source_counts[src] = source_counts.get(src, 0) + 1
        
        ag = str(l.get('assignedToName') or 'Unassigned')
        agent_counts[ag] = agent_counts.get(ag, 0) + 1
        
        pt = str(l.get('preferredType') or 'APARTMENT')
        type_counts[pt] = type_counts.get(pt, 0) + 1
        
        b = l.get('budgetMaxINR') or 0
        total_pipeline_value += b

    avg_budget = (total_pipeline_value / total_leads_count) if total_leads_count > 0 else 0

    # KPI Top Cards (Row 4 - 6)
    kpis = [
        ("TOTAL ACTIVE LEADS", total_leads_count, '#,##0'),
        ("TOTAL PIPELINE VALUE", total_pipeline_value, '₹#,##,##0'),
        ("AVERAGE BUYER BUDGET", avg_budget, '₹#,##,##0'),
        ("NEW LEADS", status_counts.get('NEW', 0) + status_counts.get('NEW_LEAD', 0), '#,##0'),
        ("QUALIFIED LEADS", status_counts.get('QUALIFIED', 0), '#,##0'),
        ("SITE VISITS ACTIVE", status_counts.get('SITE_VISIT', 0), '#,##0'),
        ("IN NEGOTIATION", status_counts.get('NEGOTIATION', 0), '#,##0'),
        ("WON / CONVERTED", status_counts.get('WON', 0) + status_counts.get('CONVERTED', 0), '#,##0'),
    ]

    card_col = 1
    for label, val, num_fmt in kpis[:4]:
        ws_dash.merge_cells(start_row=4, start_column=card_col, end_row=4, end_column=card_col+1)
        ws_dash.merge_cells(start_row=5, start_column=card_col, end_row=5, end_column=card_col+1)
        
        c_label = ws_dash.cell(row=4, column=card_col, value=label)
        c_label.font = font_kpi_label
        c_label.alignment = align_center
        c_label.fill = fill_cream_header
        c_label.border = thin_gold_border
        
        c_val = ws_dash.cell(row=5, column=card_col, value=val)
        c_val.font = font_kpi_value
        c_val.alignment = align_center
        c_val.fill = fill_kpi_card
        c_val.border = thin_gold_border
        c_val.number_format = num_fmt
        
        ws_dash.cell(row=4, column=card_col+1).border = thin_gold_border
        ws_dash.cell(row=5, column=card_col+1).border = thin_gold_border
        card_col += 2

    # Second row of KPI cards (Row 7 - 8)
    card_col = 1
    for label, val, num_fmt in kpis[4:]:
        ws_dash.merge_cells(start_row=7, start_column=card_col, end_row=7, end_column=card_col+1)
        ws_dash.merge_cells(start_row=8, start_column=card_col, end_row=8, end_column=card_col+1)
        
        c_label = ws_dash.cell(row=7, column=card_col, value=label)
        c_label.font = font_kpi_label
        c_label.alignment = align_center
        c_label.fill = fill_cream_header
        c_label.border = thin_gold_border
        
        c_val = ws_dash.cell(row=8, column=card_col, value=val)
        c_val.font = font_kpi_value
        c_val.alignment = align_center
        c_val.fill = fill_kpi_card
        c_val.border = thin_gold_border
        c_val.number_format = num_fmt
        
        ws_dash.cell(row=7, column=card_col+1).border = thin_gold_border
        ws_dash.cell(row=8, column=card_col+1).border = thin_gold_border
        card_col += 2

    # -------------------------------------------------------------
    # Tables for Charts (Starting at Row 11)
    # -------------------------------------------------------------
    
    # Table 1: Leads by Status (Columns A-C, Row 11+)
    ws_dash.cell(row=11, column=1, value="LEADS BY STATUS").font = font_section
    ws_dash.cell(row=12, column=1, value="Status Stage").font = font_header
    ws_dash.cell(row=12, column=1).fill = fill_gold_header
    ws_dash.cell(row=12, column=1).alignment = align_left
    
    ws_dash.cell(row=12, column=2, value="Lead Count").font = font_header
    ws_dash.cell(row=12, column=2).fill = fill_gold_header
    ws_dash.cell(row=12, column=2).alignment = align_right

    status_row = 13
    if not status_counts:
        status_counts = {'NEW': 0, 'CONTACTED': 0, 'QUALIFIED': 0, 'SITE_VISIT': 0, 'NEGOTIATION': 0}
        
    for st_name, count in status_counts.items():
        ws_dash.cell(row=status_row, column=1, value=st_name).font = font_data_bold
        ws_dash.cell(row=status_row, column=1).border = thin_gold_border
        ws_dash.cell(row=status_row, column=1).fill = fill_cream_row_even if status_row % 2 == 0 else fill_cream_row_odd
        
        c_cnt = ws_dash.cell(row=status_row, column=2, value=count)
        c_cnt.font = font_data
        c_cnt.border = thin_gold_border
        c_cnt.alignment = align_right
        c_cnt.number_format = '#,##0'
        c_cnt.fill = fill_cream_row_even if status_row % 2 == 0 else fill_cream_row_odd
        status_row += 1
    status_end_row = status_row - 1

    # Table 2: Leads by Source (Columns D-E, Row 11+)
    ws_dash.cell(row=11, column=4, value="LEADS BY ACQUISITION SOURCE").font = font_section
    ws_dash.cell(row=12, column=4, value="Channel / Source").font = font_header
    ws_dash.cell(row=12, column=4).fill = fill_gold_header
    ws_dash.cell(row=12, column=4).alignment = align_left
    
    ws_dash.cell(row=12, column=5, value="Lead Count").font = font_header
    ws_dash.cell(row=12, column=5).fill = fill_gold_header
    ws_dash.cell(row=12, column=5).alignment = align_right

    source_row = 13
    if not source_counts:
        source_counts = {'Website Ingestion': 0, 'WhatsApp Inbound': 0, 'Direct Phone Call': 0}
        
    for src_name, count in source_counts.items():
        ws_dash.cell(row=source_row, column=4, value=src_name).font = font_data_bold
        ws_dash.cell(row=source_row, column=4).border = thin_gold_border
        ws_dash.cell(row=source_row, column=4).fill = fill_cream_row_even if source_row % 2 == 0 else fill_cream_row_odd
        
        c_cnt = ws_dash.cell(row=source_row, column=5, value=count)
        c_cnt.font = font_data
        c_cnt.border = thin_gold_border
        c_cnt.alignment = align_right
        c_cnt.number_format = '#,##0'
        c_cnt.fill = fill_cream_row_even if source_row % 2 == 0 else fill_cream_row_odd
        source_row += 1
    source_end_row = source_row - 1

    # Table 3: Leads by Property Type (Columns G-H, Row 11+)
    ws_dash.cell(row=11, column=7, value="LEADS BY PROPERTY TYPE").font = font_section
    ws_dash.cell(row=12, column=7, value="Property Type").font = font_header
    ws_dash.cell(row=12, column=7).fill = fill_gold_header
    ws_dash.cell(row=12, column=7).alignment = align_left
    
    ws_dash.cell(row=12, column=8, value="Lead Count").font = font_header
    ws_dash.cell(row=12, column=8).fill = fill_gold_header
    ws_dash.cell(row=12, column=8).alignment = align_right

    type_row = 13
    if not type_counts:
        type_counts = {'APARTMENT': 0, 'VILLA': 0, 'PENTHOUSE': 0}
        
    for t_name, count in type_counts.items():
        ws_dash.cell(row=type_row, column=7, value=t_name).font = font_data_bold
        ws_dash.cell(row=type_row, column=7).border = thin_gold_border
        ws_dash.cell(row=type_row, column=7).fill = fill_cream_row_even if type_row % 2 == 0 else fill_cream_row_odd
        
        c_cnt = ws_dash.cell(row=type_row, column=8, value=count)
        c_cnt.font = font_data
        c_cnt.border = thin_gold_border
        c_cnt.alignment = align_right
        c_cnt.number_format = '#,##0'
        c_cnt.fill = fill_cream_row_even if type_row % 2 == 0 else fill_cream_row_odd
        type_row += 1
    type_end_row = type_row - 1

    # -------------------------------------------------------------
    # Native Excel Charts
    # -------------------------------------------------------------
    chart_start_row = max(status_end_row, source_end_row, type_end_row) + 3

    # 1. Pie Chart: Leads by Status
    pie_status = PieChart()
    pie_status.title = "Lead Pipeline by Status"
    labels_status = Reference(ws_dash, min_col=1, min_row=13, max_row=status_end_row)
    data_status = Reference(ws_dash, min_col=2, min_row=12, max_row=status_end_row)
    pie_status.add_data(data_status, titles_from_data=True)
    pie_status.set_categories(labels_status)
    pie_status.width = 14
    pie_status.height = 9
    ws_dash.add_chart(pie_status, f"A{chart_start_row}")

    # 2. Bar Chart: Leads by Source
    bar_source = BarChart()
    bar_source.type = "col"
    bar_source.style = 10
    bar_source.title = "Acquisition Channels"
    bar_source.y_axis.title = "Lead Count"
    bar_source.x_axis.title = "Lead Source"
    labels_source = Reference(ws_dash, min_col=4, min_row=13, max_row=source_end_row)
    data_source = Reference(ws_dash, min_col=5, min_row=12, max_row=source_end_row)
    bar_source.add_data(data_source, titles_from_data=True)
    bar_source.set_categories(labels_source)
    bar_source.legend = None
    bar_source.width = 15
    bar_source.height = 9
    ws_dash.add_chart(bar_source, f"E{chart_start_row}")

    # 3. Bar Chart: Leads by Property Type
    bar_type = BarChart()
    bar_type.type = "bar"
    bar_type.title = "Buyer Property Type Preference"
    bar_type.x_axis.title = "Count"
    labels_type = Reference(ws_dash, min_col=7, min_row=13, max_row=type_end_row)
    data_type = Reference(ws_dash, min_col=8, min_row=12, max_row=type_end_row)
    bar_type.add_data(data_type, titles_from_data=True)
    bar_type.set_categories(labels_type)
    bar_type.legend = None
    bar_type.width = 14
    bar_type.height = 9
    ws_dash.add_chart(bar_type, f"I{chart_start_row}")

    # Set column widths for Dashboard
    ws_dash.column_dimensions['A'].width = 20
    ws_dash.column_dimensions['B'].width = 14
    ws_dash.column_dimensions['C'].width = 6
    ws_dash.column_dimensions['D'].width = 24
    ws_dash.column_dimensions['E'].width = 14
    ws_dash.column_dimensions['F'].width = 6
    ws_dash.column_dimensions['G'].width = 22
    ws_dash.column_dimensions['H'].width = 14
    ws_dash.column_dimensions['I'].width = 20
    ws_dash.column_dimensions['J'].width = 14

    # -------------------------------------------------------------
    # SHEET 3: "Lead Strategy"
    # -------------------------------------------------------------
    ws_strat = wb.create_sheet(title="Lead Strategy")
    
    # Header
    ws_strat.merge_cells('A1:G1')
    ws_strat['A1'] = f"{org_name.upper()} — REAL ESTATE SALES STRATEGY & STAGE PROTOCOLS"
    ws_strat['A1'].font = font_title
    ws_strat['A1'].alignment = align_left
    
    ws_strat.merge_cells('A2:G2')
    ws_strat['A2'] = "Actionable CRM conversion framework, SLA turnaround benchmarks & communication guidelines."
    ws_strat['A2'].font = font_subtitle
    ws_strat['A2'].alignment = align_left

    strat_headers = [
        "Pipeline Stage / Status",
        "Stage Objective",
        "Mandatory Next Actions & CRM Protocol",
        "Target SLA Turnaround",
        "Primary Communication Channel",
        "Key Milestone for Advancement",
        "Automation / Trigger"
    ]
    
    strat_header_row = 4
    for col_idx, h_text in enumerate(strat_headers, start=1):
        cell = ws_strat.cell(row=strat_header_row, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_gold_header
        cell.alignment = align_header
        cell.border = header_border
        
    ws_strat.row_dimensions[strat_header_row].height = 28

    strategy_playbook = [
        (
            "New Lead (NEW / NEW_LEAD)",
            "Instant engagement & initial qualification",
            "1. Trigger automated WhatsApp welcome message with brochure.\n2. Realtor initiates voice call within 15 mins.\n3. Validate budget, timeline, location preference, and purchase purpose.",
            "< 15 Minutes",
            "WhatsApp & Direct Phone Call",
            "Budget & timeline verified; Buyer expresses active purchase intent.",
            "Welcome WhatsApp Automation"
        ),
        (
            "Contacted (CONTACTED)",
            "Property matching & discovery consultation",
            "1. Send curated digital property deck of 2-3 matched listings.\n2. Schedule in-depth Zoom or in-person discovery consultation.\n3. Log notes and record specific buyer layout requirements.",
            "< 24 Hours",
            "WhatsApp Media & Voice Call",
            "Buyer selects preferred property units for physical inspection.",
            "Property Deck Dispatch"
        ),
        (
            "Qualified (QUALIFIED)",
            "Site visit scheduling & consultant assignment",
            "1. Assign dedicated property consultant.\n2. Coordinate VIP chauffeur/site visit slot on calendar.\n3. Send location pin, route briefing, and developer profile.",
            "< 48 Hours",
            "Calendar Invite & WhatsApp Pin",
            "Site visit confirmed with specific date and time slot.",
            "Site Visit Confirmation SMS"
        ),
        (
            "Site Visit (SITE_VISIT)",
            "Experiential walkthrough & objection resolution",
            "1. Escort client through property model unit, clubhouse, and amenities.\n2. Highlight floor plans, carpet area, facing direction, and view.\n3. Log post-visit client feedback within 2 hours of completion.",
            "Same Day",
            "In-Person Walkthrough",
            "Client requests pricing breakdown, payment schedule, or draft agreement.",
            "Post-Visit Survey Trigger"
        ),
        (
            "Negotiation (NEGOTIATION)",
            "Offer structuring, commercial closing & KYC",
            "1. Structure unit discount, payment milestones, and car park allotment.\n2. Collect KYC documents (PAN, Aadhaar, Proof of Address).\n3. Prepare booking token agreement with developer legal team.",
            "< 3 Business Days",
            "In-Person Meeting & Official Email",
            "Signed agreement and receipt of booking advance payment.",
            "Deal Milestone Alert"
        ),
        (
            "Won / Converted (WON / CONVERTED)",
            "Closing onboarding & referral acquisition",
            "1. Issue official booking confirmation and payment receipt.\n2. Handover documentation to post-sales registration concierge.\n3. Request client testimonial and referral introductions.",
            "< 24 Hours",
            "Celebration Call & Email Kit",
            "Sale deed registered; full payment schedule initiated.",
            "Closing Confetti & Gift Dispatch"
        ),
        (
            "Lost (LOST)",
            "Root cause analysis & re-engagement nurturing",
            "1. Log exact loss reason (Budget / Location / Competitor / Inactive).\n2. Tag for automated quarterly re-engagement campaign on new launches.\n3. Maintain professional goodwill for future property inquiries.",
            "Immediate Log",
            "WhatsApp Nurture Campaign",
            "Re-activation on future project launches matching buyer criteria.",
            "Quarterly Nurture Workflow"
        ),
        (
            "Custom Status (User Defined)",
            "Tailored workflow execution",
            "1. Apply tenant-specific operational checklist.\n2. Log activities under custom status categorization in CRM audit log.\n3. Set custom follow-up reminder for assigned agent.",
            "As Defined",
            "WhatsApp / Email / Task",
            "Advancement according to custom sales milestone.",
            "Custom Event Trigger"
        )
    ]

    strat_row = 5
    for idx, item in enumerate(strategy_playbook):
        row_fill = fill_cream_row_even if idx % 2 == 0 else fill_cream_row_odd
        for col_idx, text in enumerate(item, start=1):
            cell = ws_strat.cell(row=strat_row, column=col_idx, value=text)
            cell.font = font_data
            cell.fill = row_fill
            cell.border = thin_gold_border
            
            if col_idx in (1, 4, 5, 7):
                cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            else:
                cell.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
                
            if col_idx == 1:
                cell.font = font_data_bold
                
        ws_strat.row_dimensions[strat_row].height = 46
        strat_row += 1

    # Format strategy column widths
    ws_strat.column_dimensions['A'].width = 24
    ws_strat.column_dimensions['B'].width = 28
    ws_strat.column_dimensions['C'].width = 44
    ws_strat.column_dimensions['D'].width = 18
    ws_strat.column_dimensions['E'].width = 24
    ws_strat.column_dimensions['F'].width = 32
    ws_strat.column_dimensions['G'].width = 24
    
    ws_strat.freeze_panes = 'A5'

    # Save Workbook
    wb.save(output_path)
    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python generate_leads_excel.py <payload_json_path_or_stdin> <output_xlsx_path>", file=sys.stderr)
        sys.exit(1)
        
    input_source = sys.argv[1]
    output_xlsx_path = sys.argv[2]
    
    if input_source == '-':
        data = json.load(sys.stdin)
    else:
        with open(input_source, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
    generate_leads_workbook(data, output_xlsx_path)
    print(f"Successfully generated Excel workbook: {output_xlsx_path}")
