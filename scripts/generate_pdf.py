import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

def draw_first_page(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(colors.HexColor("#64748b"))
    canvas_obj.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(36, 36, 576, 36)
    canvas_obj.drawString(36, 24, "CONFIDENTIAL — Prepared for OSVI.ai Evaluation")
    canvas_obj.drawRightString(576, 24, "Page 1 of 4")
    canvas_obj.restoreState()

def draw_later_pages(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(colors.HexColor("#64748b"))

    # Running header
    canvas_obj.drawString(36, 762, "OSVI.ai GTM Automation Platform — Pipeline Documentation")
    canvas_obj.drawRightString(576, 762, "Candidate: Amay Mishra | GTM/Growth Intern")
    canvas_obj.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(36, 756, 576, 756)

    # Running footer
    canvas_obj.line(36, 36, 576, 36)
    canvas_obj.drawString(36, 24, "CONFIDENTIAL — Prepared for OSVI.ai Evaluation")
    canvas_obj.drawRightString(576, 24, f"Page {canvas_obj._pageNumber} of 4")
    canvas_obj.restoreState()

def build_pdf(filename="OSVI_GTM_Pipeline_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Slate 900
    accent_indigo = colors.HexColor("#4f46e5") # Indigo 600
    accent_sky = colors.HexColor("#0284c7")    # Sky 600
    accent_emerald = colors.HexColor("#059669")# Emerald 600
    accent_amber = colors.HexColor("#d97706")  # Amber 600
    text_dark = colors.HexColor("#1e293b")     # Slate 800
    text_muted = colors.HexColor("#475569")    # Slate 600
    border_color = colors.HexColor("#cbd5e1")  # Slate 300
    bg_light = colors.HexColor("#f8fafc")      # Slate 50

    styles.add(ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=25,
        textColor=primary_color,
        spaceAfter=3
    ))

    styles.add(ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=14,
        textColor=accent_indigo,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_muted
    ))

    styles.add(ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=primary_color,
        spaceBefore=7,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'SubSectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=accent_indigo,
        spaceBefore=4,
        spaceAfter=2,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_dark,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=text_dark
    ))

    styles.add(ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5
    ))

    styles.add(ParagraphStyle(
        'CalloutTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=primary_color
    ))

    styles.add(ParagraphStyle(
        'CalloutBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=text_dark
    ))

    styles.add(ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=text_dark
    ))

    styles.add(ParagraphStyle(
        'TableTextBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=text_dark
    ))

    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    ))

    story = []

    # =========================================================================
    # PAGE 1: PROJECT OVERVIEW & OBJECTIVE
    # =========================================================================
    story.append(Paragraph("OSVI.ai GTM Automation Pipeline", styles['DocTitle']))
    story.append(Paragraph("End-to-End Workflow, Architecture & Implementation", styles['DocSubtitle']))
    
    meta_table_data = [
        [
            Paragraph("<b>Candidate:</b> Amay Mishra", styles['MetaText']),
            Paragraph("<b>Target Role:</b> GTM / Growth Intern", styles['MetaText']),
            Paragraph("<b>Target Sector:</b> US Quick-Service Restaurants (QSR)", styles['MetaText']),
            Paragraph("<b>Core Solution:</b> OSVI.ai Journey Orchestration", styles['MetaText'])
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[135, 135, 135, 135])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("1. Executive Summary & Business Problem", styles['SectionHeading']))
    story.append(Paragraph(
        "Modern multi-unit restaurant operators face acute communication friction. While traditional standalone bots (voice IVRs, SMS bots, and web widgets) can handle trivial single-intent questions, they fail when faced with real restaurant operations—such as multi-store stockouts, curbside arrival desynchronization, peak-hour phone order overflow, and catering exception handling. When a standalone bot fails, guest orders are dropped, store staff are overwhelmed during rushes, and guest loyalty is damaged.",
        styles['BodyCustom']
    ))
    story.append(Paragraph(
        "<b>OSVI.ai Journey</b> addresses this architectural gap. Rather than acting as another siloed conversational widget, Journey sits as an <i>orchestration layer above traditional bots</i>, coordinating specialized multi-agent teamwork and outcome-driven workflows that directly integrate front-line communications with store POS, inventory, and kitchen dispatch.",
        styles['BodyCustom']
    ))

    story.append(Paragraph("2. Why Automate the GTM Research & Preparation Pipeline?", styles['SectionHeading']))
    story.append(Paragraph(
        "Manual outbound sales research in the multi-unit restaurant sector is intensely time-consuming. Commercial sales representatives spend 45 to 60 minutes per account manually verifying multi-unit store counts across state corporate filings, identifying operations leadership on LinkedIn, investigating recent franchise acquisitions, and writing custom opening hooks.",
        styles['BodyCustom']
    ))
    story.append(Paragraph(
        "This platform automates the repetitive, mechanical aspects of prospect discovery, evidence-backed enrichment, and message structuring—reducing account preparation time by ~80%—while strictly maintaining <b>100% human editorial control</b> through a mandatory Human Approval Gate before any outreach copy can be drafted.",
        styles['BodyCustom']
    ))

    story.append(Paragraph("3. Target Ideal Customer Profile (ICP)", styles['SectionHeading']))
    story.append(Paragraph(
        "The automated pipeline focuses on multi-unit US restaurant operators that possess sufficient operational complexity to benefit from Journey orchestration, but lack large in-house software engineering teams to build custom agent orchestration architectures:",
        styles['BodyCustom']
    ))

    icp_table_data = [
        [Paragraph("Dimension", styles['TableHeader']), Paragraph("Target Criteria & Strategic Rationale", styles['TableHeader'])],
        [
            Paragraph("<b>Geography</b>", styles['TableTextBold']),
            Paragraph("United States (national and multi-state regional operator networks).", styles['TableText'])
        ],
        [
            Paragraph("<b>Industry & Segments</b>", styles['TableTextBold']),
            Paragraph("Quick-service restaurants (QSR) and fast-casual dining groups (burgers, pizza, chicken, sandwiches, and fast-casual concepts).", styles['TableText'])
        ],
        [
            Paragraph("<b>Location Scale Sweet-Spot</b>", styles['TableTextBold']),
            Paragraph("<b>20 to 200 operating locations.</b> Sub-20 store operators typically resolve communications with manual staffing; 200+ store corporate entities possess rigid multi-year enterprise contracts. The 20–200 unit tier represents the optimal mid-market velocity segment.", styles['TableText'])
        ],
        [
            Paragraph("<b>Target Decision-Makers</b>", styles['TableTextBold']),
            Paragraph("Chief Operating Officer (COO), VP of Operations, Head of Guest Experience, VP of Customer Experience, and Head of Contact Center & Support Operations.", styles['TableText'])
        ],
        [
            Paragraph("<b>Observed Buying Signals</b>", styles['TableTextBold']),
            Paragraph("Documented multi-unit franchise expansion, new store openings, active hiring for operations technology coordinators, store voice ordering pilots, and centralized contact center initiatives.", styles['TableText'])
        ]
    ]
    icp_table = Table(icp_table_data, colWidths=[140, 400])
    icp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(icp_table)
    story.append(Spacer(1, 6))

    # Hypothesis Note Box
    hypothesis_box = [
        [
            Paragraph("<b>Important Methodological Note — Targeting Hypotheses:</b>", styles['CalloutTitle']),
        ],
        [
            Paragraph(
                "These ICP parameters and buying signals are treated strictly as <b>initial empirical hypotheses</b>, not rigid buying rules. The platform provides an editable ICP Configuration workspace where operators can dynamically adjust location bounds, add concept categories (e.g., beverage/coffee), or refine target executive titles as market responses are validated.",
                styles['CalloutBody']
            )
        ]
    ]
    hyp_table = Table(hypothesis_box, colWidths=[540])
    hyp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fffbeb")),
        ('BOX', (0,0), (-1,-1), 1, accent_amber),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(hyp_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: END-TO-END PIPELINE & WORKFLOW DIAGRAM
    # =========================================================================
    story.append(Paragraph("End-to-End Pipeline Workflow", styles['DocTitle']))
    story.append(Paragraph("Five Governed Stages: From Discovery to Draft Preparation", styles['DocSubtitle']))
    story.append(Spacer(1, 4))

    # Visual Workflow Diagram (Boxed Canvas Layout)
    diag_data = [
        [
            Paragraph("<b>1. Company Search</b><br/><font color='#64748b' size='7'>US QSR (20-200 units)<br/>Live/Demo/CSV Ingestion</font>", styles['TableText']),
            Paragraph("→", styles['TableTextBold']),
            Paragraph("<b>2. Lead Search</b><br/><font color='#64748b' size='7'>COO, VP Ops, Head of GX<br/>Deduplication Engine</font>", styles['TableText']),
            Paragraph("→", styles['TableTextBold']),
            Paragraph("<b>3. Enrichment</b><br/><font color='#64748b' size='7'>Verifiable Scale & Sources<br/>Facts vs. Hypotheses</font>", styles['TableText']),
            Paragraph("→", styles['TableTextBold']),
            Paragraph("<b>4. APPROVAL GATE</b><br/><font color='#d97706' size='7'><b>MANDATORY CHECKPOINT</b><br/>PENDING by Default</font>", styles['TableText']),
            Paragraph("→", styles['TableTextBold']),
            Paragraph("<b>5. Outreach Drafts</b><br/><font color='#059669' size='7'>4-Email Sequence<br/>Drafts Only (Never Sent)</font>", styles['TableText']),
        ]
    ]
    diag_table = Table(diag_data, colWidths=[94, 16, 94, 16, 94, 16, 102, 16, 92])
    diag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (4,0), (4,0), colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (6,0), (6,0), colors.HexColor("#fef3c7")), # Amber highlight
        ('BACKGROUND', (8,0), (8,0), colors.HexColor("#ecfdf5")), # Emerald highlight
        ('BOX', (0,0), (0,0), 0.5, border_color),
        ('BOX', (2,0), (2,0), 0.5, border_color),
        ('BOX', (4,0), (4,0), 0.5, border_color),
        ('BOX', (6,0), (6,0), 1, accent_amber),
        ('BOX', (8,0), (8,0), 1, accent_emerald),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(diag_table)
    
    # Gate branch indicator
    gate_branch_data = [
        [
            Paragraph("<font color='#059669'><b>✔ APPROVED:</b> Proceeds to Stage 5 (Generates 4 distinct emails & saves drafts)</font>", styles['TableTextBold']),
            Paragraph("<font color='#dc2626'><b>✖ REJECTED / PENDING:</b> Strictly blocked on server (HTTP 403 Forbidden; 0 drafts created)</font>", styles['TableTextBold'])
        ]
    ]
    gate_branch_table = Table(gate_branch_data, colWidths=[270, 270])
    gate_branch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#ecfdf5")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#fef2f2")),
        ('BOX', (0,0), (0,0), 0.5, colors.HexColor("#10b981")),
        ('BOX', (1,0), (1,0), 0.5, colors.HexColor("#ef4444")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(gate_branch_table)
    story.append(Spacer(1, 8))

    # Stage by Stage Breakdown
    story.append(Paragraph("Stage 1: Company Search (Discovery & Provenance Tagging)", styles['SubSectionHeading']))
    story.append(Paragraph(
        "Retrieves multi-unit QSR and fast-casual groups matching active ICP criteria. Employs a modular provider abstraction supporting live intelligence services (Apollo, Perplexity), curated realistic multi-unit demo datasets, and CSV batch uploads. Records capture company name, website, operating headquarters, estimated unit count, observed buying signals, citation URLs, and retrieval timestamps. Every record receives an immutable provenance badge (<code>live</code>, <code>manually_sourced</code>, or <code>demo</code>) to guarantee data transparency.",
        styles['BodyCustom']
    ))

    story.append(Paragraph("Stage 2: Lead Search (Decision-Maker Discovery & Deduplication)", styles['SubSectionHeading']))
    story.append(Paragraph(
        "Identifies relevant executive leadership (COO, VP Ops, Head of Guest Experience) and maps them to verified parent companies. To protect database integrity, the platform enforces strict <b>two-tiered deduplication</b>: preventing duplicate company ingestion and blocking duplicate contact creation across shared email addresses or identical executive names at the same company. Unknown emails remain honestly marked <code>unavailable</code> and are never hallucinated.",
        styles['BodyCustom']
    ))

    story.append(Paragraph("Stage 3: Evidence-Backed Enrichment Engine", styles['SubSectionHeading']))
    story.append(Paragraph(
        "Synthesizes structured operational dossiers for each lead. Evaluates verifiable store counts, quotes public business press, and generates personalized opening hooks. Crucially, the engine enforces strict epistemic honesty by dividing findings into: (1) <b>Documented Facts</b> (substantiated by public citations), and (2) <b>Operational Hypotheses</b> (inferred industry challenges clearly flagged as unproven). Renders a confidence score (0–100) with written rationale.",
        styles['BodyCustom']
    ))

    story.append(Paragraph("Stage 4: Mandatory Human Approval Gate", styles['SubSectionHeading']))
    story.append(Paragraph(
        "Every newly identified lead enters the pipeline in <code>PENDING</code> status. Human reviewers inspect the full evidence dossier—including verifiable unit counts, documented buying signals, and operational hypotheses—in a specialized review drawer. Reviewers can <code>APPROVE</code> or <code>REJECT</code> with audit notes and rejection categorization. <b>Server-Side Gate Enforcement</b> guarantees that unapproved leads cannot generate sequences through UI actions, automated runners, or direct API tampering.",
        styles['BodyCustom']
    ))

    story.append(Paragraph("Stage 5: Four-Email Sequence Generation & Draft-Only Queue", styles['SubSectionHeading']))
    story.append(Paragraph(
        "For approved leads only, the platform synthesizes an evidence-based four-email outreach sequence structured across a proven multi-day cadence:",
        styles['BodyCustom']
    ))

    cadence_data = [
        [Paragraph("Step & Schedule", styles['TableHeader']), Paragraph("Email Focus & Journey Orchestration Alignment", styles['TableHeader']), Paragraph("Personalization Anchor", styles['TableHeader'])],
        [
            Paragraph("<b>Email 1: Day 1</b>", styles['TableTextBold']),
            Paragraph("<b>Initial Personalized Introduction:</b> Introduces Journey as an orchestration layer above point solutions.", styles['TableText']),
            Paragraph("Cites verified store scale, expansion markets, and current operational hiring.", styles['TableText'])
        ],
        [
            Paragraph("<b>Email 2: Day 4</b>", styles['TableTextBold']),
            Paragraph("<b>Operational Use Case & Value:</b> Discusses multi-agent coordination resolving order exceptions and store throughput bottlenecks.", styles['TableText']),
            Paragraph("References company's specific segment challenges (e.g. drive-thru or curbside sync).", styles['TableText'])
        ],
        [
            Paragraph("<b>Email 3: Day 8</b>", styles['TableTextBold']),
            Paragraph("<b>Thoughtful Workflow Question:</b> Inquires how store-level order exceptions are coordinated between customer touchpoints and kitchen lines.", styles['TableText']),
            Paragraph("Tailored to recipient's exact executive mandate (COO vs. Head of Guest Exp).", styles['TableText'])
        ],
        [
            Paragraph("<b>Email 4: Day 13</b>", styles['TableTextBold']),
            Paragraph("<b>Polite Close-the-Loop:</b> Respectful closing acknowledging operational priorities, leaving the door open for future evaluation.", styles['TableText']),
            Paragraph("Re-anchors around company's ongoing multi-unit expansion.", styles['TableText'])
        ]
    ]
    cadence_table = Table(cadence_data, colWidths=[90, 310, 140])
    cadence_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cadence_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: TECHNICAL ARCHITECTURE & SAFETY
    # =========================================================================
    story.append(Paragraph("Technical Architecture & Safeguards", styles['DocTitle']))
    story.append(Paragraph("System Components, Security Controls & Governance", styles['DocSubtitle']))
    story.append(Spacer(1, 4))

    story.append(Paragraph("1. Technology Stack & Component Architecture", styles['SectionHeading']))
    
    arch_data = [
        [Paragraph("Layer", styles['TableHeader']), Paragraph("Technology", styles['TableHeader']), Paragraph("Implementation Details & Production Readiness", styles['TableHeader'])],
        [
            Paragraph("<b>Frontend UI</b>", styles['TableTextBold']),
            Paragraph("Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS", styles['TableText']),
            Paragraph("Responsive SaaS dashboard, interactive 5-stage pipeline stepper, evidence modals, inline copy editor, and 8-step evaluator demo walkthrough.", styles['TableText'])
        ],
        [
            Paragraph("<b>Backend API</b>", styles['TableTextBold']),
            Paragraph("Next.js Server-Side Route Handlers", styles['TableText']),
            Paragraph("RESTful endpoints handling ICP, company search, lead search, enrichment, approval actions, sequences, drafts, and workflow orchestration.", styles['TableText'])
        ],
        [
            Paragraph("<b>Persistence</b>", styles['TableTextBold']),
            Paragraph("Dual Storage Engine: Local JSON + Supabase PostgreSQL", styles['TableText']),
            Paragraph("Zero-setup local persistence (<code>data/osvi-gtm-db.json</code>) surviving restarts, plus full PostgreSQL DDL schema with RLS (<code>supabase/migrations/001_initial_schema.sql</code>).", styles['TableText'])
        ],
        [
            Paragraph("<b>Search Abstraction</b>", styles['TableTextBold']),
            Paragraph("Pluggable Provider Interface", styles['TableText']),
            Paragraph("Supports Apollo, Perplexity Sonar, CSV import, and realistic offline demo records without code modifications.", styles['TableText'])
        ],
        [
            Paragraph("<b>Enrichment Engine</b>", styles['TableTextBold']),
            Paragraph("Configurable LLM + Deterministic Factual Synthesizer", styles['TableText']),
            Paragraph("Connects to OpenAI, Gemini, or Anthropic via server env vars. If unconfigured, falls back to a deterministic grounded synthesizer preventing hallucination.", styles['TableText'])
        ],
        [
            Paragraph("<b>Email Drafts</b>", styles['TableTextBold']),
            Paragraph("Google OAuth 2.0 (`gmail.compose`) + Internal Queue", styles['TableText']),
            Paragraph("Creates drafts directly via Gmail API <code>users.drafts.create</code>. If unconfigured, saves to internal draft queue with CSV/JSON export.", styles['TableText'])
        ],
        [
            Paragraph("<b>Automation Webhook</b>", styles['TableTextBold']),
            Paragraph("n8n-Compatible Webhook (`/api/workflows/webhook`)", styles['TableText']),
            Paragraph("Enables external schedulers to trigger 5-stage runs, secured with <code>x-osvi-secret</code> authentication header.", styles['TableText'])
        ]
    ]
    arch_table = Table(arch_data, colWidths=[80, 160, 300])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. Critical Safety Protocols & Governance Safeguards", styles['SectionHeading']))
    
    story.append(Paragraph("• <b>Strict Server-Side Approval Gate:</b> Approval is enforced at the backend controller level, not just in the UI. <code>ApprovalGate.assertApproved()</code> verifies lead status before generating sequences or creating drafts. Direct API requests for pending or rejected leads return <code>HTTP 403 Forbidden</code>.", styles['BulletCustom']))
    story.append(Paragraph("• <b>Zero Automated Sending (Draft-Only Protocol):</b> The platform contains NO code, scheduler loops, or endpoints capable of transmitting emails. Every message is saved exclusively to Gmail drafts or the internal draft queue for mandatory human review.", styles['BulletCustom']))
    story.append(Paragraph("• <b>Pre-Draft Confirmation Modal:</b> Requires explicit confirmation in the UI before triggering draft creation, displaying recipient details, draft destinations, and safety warnings.", styles['BulletCustom']))
    story.append(Paragraph("• <b>Duplicate Prevention:</b> Multi-level deduplication prevents re-ingestion of identical companies or contacts and guarantees draft creation idempotency during pipeline retries.", styles['BulletCustom']))
    story.append(Paragraph("• <b>Grounded Copywriting (No Fabricated Capabilities):</b> Copy adheres strictly to Journey's authentic positioning. Invented customer testimonials, fabricated ROI statistics, and fake integrations are strictly prohibited.", styles['BulletCustom']))
    story.append(Paragraph("• <b>Credential Security & Secret Masking:</b> API keys, Google OAuth secrets, and webhook tokens are stored exclusively on the server and masked (e.g. <code>••••••••abcd</code>) in client responses.", styles['BulletCustom']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("3. Integration & Credential Status Matrix", styles['SectionHeading']))
    
    cred_data = [
        [Paragraph("Integration", styles['TableHeader']), Paragraph("Required Credentials", styles['TableHeader']), Paragraph("Live Mode Functionality", styles['TableHeader']), Paragraph("Zero-Credential Offline Fallback", styles['TableHeader'])],
        [
            Paragraph("<b>Supabase DB</b>", styles['TableTextBold']),
            Paragraph("`NEXT_PUBLIC_SUPABASE_URL`<br/>`SUPABASE_SERVICE_ROLE_KEY`", styles['TableText']),
            Paragraph("Direct PostgreSQL table persistence with RLS.", styles['TableText']),
            Paragraph("Persistent local JSON store (<code>osvi-gtm-db.json</code>) surviving reloads.", styles['TableText'])
        ],
        [
            Paragraph("<b>Company Search</b>", styles['TableTextBold']),
            Paragraph("`SEARCH_API_KEY`<br/>(Apollo or Perplexity)", styles['TableText']),
            Paragraph("Live web intelligence queries tagged `[LIVE INTEL]`.", styles['TableText']),
            Paragraph("Curated authentic US QSR demo operators + CSV file import.", styles['TableText'])
        ],
        [
            Paragraph("<b>LLM Synthesizer</b>", styles['TableTextBold']),
            Paragraph("`LLM_API_KEY`<br/>(OpenAI / Gemini / Claude)", styles['TableText']),
            Paragraph("Dynamic LLM enrichment summaries and copy generation.", styles['TableText']),
            Paragraph("Deterministic factual synthesizer strictly grounding copy in cited evidence.", styles['TableText'])
        ],
        [
            Paragraph("<b>Gmail Drafts</b>", styles['TableTextBold']),
            Paragraph("`GMAIL_CLIENT_ID`<br/>`GMAIL_CLIENT_SECRET`", styles['TableText']),
            Paragraph("OAuth flow creating real drafts in user's Gmail account.", styles['TableText']),
            Paragraph("Full-featured Internal Draft Queue with CSV and JSON exports.", styles['TableText'])
        ],
        [
            Paragraph("<b>n8n Webhook</b>", styles['TableTextBold']),
            Paragraph("`N8N_WEBHOOK_SECRET`", styles['TableText']),
            Paragraph("External orchestration triggers via authenticated POST.", styles['TableText']),
            Paragraph("Fully functional locally using default secret token.", styles['TableText'])
        ]
    ]
    cred_table = Table(cred_data, colWidths=[90, 130, 160, 160])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cred_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: DEMONSTRATION & DENTAL PRACTICE ADAPTATION
    # =========================================================================
    story.append(Paragraph("Evaluator Demonstration & ICP Adaptation", styles['DocTitle']))
    story.append(Paragraph("Three-Minute Walkthrough & Multi-Location Dental Practice Analysis", styles['DocSubtitle']))
    story.append(Spacer(1, 4))

    story.append(Paragraph("1. Guided Three-Minute Evaluator Walkthrough", styles['SectionHeading']))
    story.append(Paragraph(
        "The application features a built-in <b>Guided Evaluator Demo</b> (accessible via the top header) that allows interviewers to verify all functional requirements in under three minutes:",
        styles['BodyCustom']
    ))

    demo_steps_data = [
        [Paragraph("Step", styles['TableHeader']), Paragraph("Action Performed", styles['TableHeader']), Paragraph("Verification Checkpoint", styles['TableHeader'])],
        [
            Paragraph("<b>Step 1</b>", styles['TableTextBold']),
            Paragraph("Inspect Company Search & Ingested QSR Groups", styles['TableText']),
            Paragraph("Verify ICP filters (20-200 units), source URLs, buying signals, and provenance badges.", styles['TableText'])
        ],
        [
            Paragraph("<b>Step 2</b>", styles['TableTextBold']),
            Paragraph("Review Discovered Decision-Makers", styles['TableText']),
            Paragraph("Inspect executive titles (COO, VP Ops), profile links, and honest unavailable email handling.", styles['TableText'])
        ],
        [
            Paragraph("<b>Step 3</b>", styles['TableTextBold']),
            Paragraph("Inspect Enrichment Evidence Dossier", styles['TableText']),
            Paragraph("View Confidence Score (94/100), side-by-side citations, and fact vs. hypothesis tags.", styles['TableText'])
        ],
        [
            Paragraph("<b>Step 4</b>", styles['TableTextBold']),
            Paragraph("Reject One Lead & Approve Another", styles['TableText']),
            Paragraph("Reject Sarah Jenkins (Torchy's) with notes; Approve Marcus Vance (Firehouse) with rationale.", styles['TableText'])
        ],
        [
            Paragraph("<b>Step 5</b>", styles['TableTextBold']),
            Paragraph("Demonstrate Server Gate Enforcement", styles['TableText']),
            Paragraph("Live API test attempting to draft for rejected lead returns <b>HTTP 403 Forbidden</b>.", styles['TableText'])
        ],
        [
            Paragraph("<b>Step 6</b>", styles['TableTextBold']),
            Paragraph("Synthesize 4-Email Sequence & Save Drafts", styles['TableText']),
            Paragraph("Inspect Days 1, 4, 8, 13 cadence, edit copy, view confirmation modal, and export to CSV/JSON.", styles['TableText'])
        ],
        [
            Paragraph("<b>Step 7</b>", styles['TableTextBold']),
            Paragraph("Review Dental DSO Adaptation", styles['TableText']),
            Paragraph("Examine how the pipeline adapts to multi-location healthcare groups without code changes.", styles['TableText'])
        ]
    ]
    demo_table = Table(demo_steps_data, colWidths=[50, 240, 250])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(demo_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. Dental Practice ICP Adaptation (Dental Service Organizations)", styles['SectionHeading']))
    story.append(Paragraph(
        "A dedicated comparative analysis demonstrates how the pipeline adapts from QSR to US multi-location dental practices (DSOs):",
        styles['BodyCustom']
    ))

    dental_data = [
        [Paragraph("Pipeline Dimension", styles['TableHeader']), Paragraph("QSR Baseline", styles['TableHeader']), Paragraph("Dental Practice Group (DSO) Adaptation", styles['TableHeader'])],
        [
            Paragraph("<b>Company Search</b>", styles['TableTextBold']),
            Paragraph("US QSR franchisee groups (20–200 units).", styles['TableText']),
            Paragraph("Dental Service Organizations (DSOs) & regional practice networks (15–150 clinics) like Heartland Dental, Aspen Dental, Pacific Dental Services affiliates.", styles['TableText'])
        ],
        [
            Paragraph("<b>Target Roles</b>", styles['TableTextBold']),
            Paragraph("COO, VP of Operations, Head of Guest Exp.", styles['TableText']),
            Paragraph("COO, VP of Clinical Operations, Head of Patient Experience, Director of Practice Operations, Chief Revenue Officer.", styles['TableText'])
        ],
        [
            Paragraph("<b>Buying Signals</b>", styles['TableTextBold']),
            Paragraph("Store expansion, drive-thru automation pilots.", styles['TableText']),
            Paragraph("Practice acquisitions (M&A integration), de novo clinic expansion, appointment backlog, front-desk intake staffing friction, hygiene recall drop-off.", styles['TableText'])
        ],
        [
            Paragraph("<b>Messaging Focus</b>", styles['TableTextBold']),
            Paragraph("Order exception orchestration & store throughput.", styles['TableText']),
            Paragraph("Journey coordinating new patient intake, routine appointment rescheduling, reminder sequences, insurance card capture, and hygiene re-care.", styles['TableText'])
        ],
        [
            Paragraph("<b>Invariant Stages</b>", styles['TableTextBold']),
            Paragraph("5-stage runner, approval gate, draft-only rules.", styles['TableText']),
            Paragraph("<b>100% UNCHANGED.</b> Deduplication, evidence citations, Stage 4 Human Approval Gate, and draft-only safeguards remain structurally identical.", styles['TableText'])
        ]
    ]
    dental_table = Table(dental_data, colWidths=[100, 200, 240])
    dental_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(dental_table)
    story.append(Spacer(1, 5))

    # Healthcare Safety Callout
    dental_safety_box = [
        [Paragraph("<b>Critical Healthcare Safety & PHI Boundaries:</b>", styles['CalloutTitle'])],
        [Paragraph(
            "<b>1. Strict Clinical Triage Boundaries:</b> Journey orchestrates operational workflows (scheduling, intake, reminders). It must NEVER perform clinical triage or diagnostic evaluations—any medical inquiry escalates to licensed clinical staff.<br/>"
            "<b>2. HIPAA & PHI Protection:</b> Patient communications enforce encryption, Zero-Data Retention on LLM calls, and BAA compliance.",
            styles['CalloutBody']
        )]
    ]
    safety_table = Table(dental_safety_box, colWidths=[540])
    safety_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, accent_emerald),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(safety_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3. Conclusion & Strategic GTM Value", styles['SectionHeading']))
    story.append(Paragraph(
        "This project bridges enterprise GTM strategy with agentic software engineering. By linking structured research, verifiable evidence citations, strict human oversight, and draft-only outreach preparation, it enables OSVI.ai to engage enterprise multi-unit operators with credible, high-context value propositions while ensuring zero risk of unvetted automated outbound communications.",
        styles['BodyCustom']
    ))

    # Build the document
    doc.build(story, onFirstPage=draw_first_page, onLaterPages=draw_later_pages)
    print(f"Successfully generated PDF: {filename}")

if __name__ == '__main__':
    target = os.path.join(os.getcwd(), 'OSVI_GTM_Pipeline_Documentation.pdf')
    build_pdf(target)
