import { Contact, Company, EnrichmentRecord, EmailMessage, EmailSequence, IntegrationSettings } from '@/types';
import { Store } from '@/lib/storage';
import { GeminiService } from '@/lib/enrichment/gemini';

function getScaleDescription(company: Company, enrichment: EnrichmentRecord): string {
  if (enrichment.location_count_verifiable && enrichment.location_count_verifiable > 0) {
    return `${enrichment.location_count_verifiable} locations`;
  }
  if (company.estimated_locations && company.estimated_locations > 0) {
    return `${company.estimated_locations} locations`;
  }
  if (company.employee_count && company.employee_count > 0) {
    return `growing organization of ${company.employee_count} employees`;
  }
  return 'multi-unit operations';
}

export class EmailSequenceGenerator {
  /**
   * Generates a 4-email sequence using Google Gemini LLM when configured.
   */
  static async generateSequenceWithLLM(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord,
    settings?: IntegrationSettings
  ): Promise<EmailSequence> {
    const s = settings || Store.getSettings();
    const geminiKey = s.gemini_api_key || process.env.GEMINI_API_KEY || (s.llm_provider === 'gemini' ? s.llm_api_key : '');

    if (geminiKey && s.llm_provider !== 'mock_demo') {
      try {
        const gemini = new GeminiService(geminiKey, s.llm_model || process.env.LLM_MODEL);
        if (gemini.isConfigured()) {
          return await gemini.generatePersonalizedSequence(contact, company, enrichment);
        }
      } catch (err: any) {
        console.warn('Gemini LLM sequence generation failed, falling back to deterministic template:', err.message);
      }
    }

    return this.generateSequence(contact, company, enrichment);
  }

  /**
   * Synchronous deterministic baseline generator with proven Domino's case study facts.
   */
  static generateSequence(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailSequence {
    const emails: EmailMessage[] = [
      this.generateEmail1(contact, company, enrichment),
      this.generateEmail2(contact, company, enrichment),
      this.generateEmail3(contact, company, enrichment),
      this.generateEmail4(contact, company, enrichment)
    ];

    return {
      id: `seq-${contact.id}`,
      lead_id: contact.id,
      contact_name: contact.full_name,
      contact_email: contact.work_email,
      company_name: company.name,
      emails,
      status: 'GENERATED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async regenerateSingleEmailWithLLM(
    stepNumber: number,
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord,
    settings?: IntegrationSettings
  ): Promise<EmailMessage> {
    const s = settings || Store.getSettings();
    const geminiKey = s.gemini_api_key || process.env.GEMINI_API_KEY || (s.llm_provider === 'gemini' ? s.llm_api_key : '');

    if (geminiKey && s.llm_provider !== 'mock_demo') {
      try {
        const gemini = new GeminiService(geminiKey, s.llm_model || process.env.LLM_MODEL);
        if (gemini.isConfigured()) {
          const fullSeq = await gemini.generatePersonalizedSequence(contact, company, enrichment);
          const found = fullSeq.emails.find(e => e.sequence_step === stepNumber);
          if (found) return found;
        }
      } catch (err: any) {
        console.warn('Gemini LLM single email regeneration failed, falling back to deterministic template:', err.message);
      }
    }

    return this.regenerateSingleEmail(stepNumber, contact, company, enrichment);
  }

  static regenerateSingleEmail(
    stepNumber: number,
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    switch (stepNumber) {
      case 1:
        return this.generateEmail1(contact, company, enrichment);
      case 2:
        return this.generateEmail2(contact, company, enrichment);
      case 3:
        return this.generateEmail3(contact, company, enrichment);
      case 4:
        return this.generateEmail4(contact, company, enrichment);
      default:
        throw new Error(`Invalid email step ${stepNumber}. Must be 1, 2, 3, or 4.`);
    }
  }

  // Email 1: Initial personalized introduction (Day 1)
  private static generateEmail1(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const primaryEv = enrichment.evidence_sources[0];
    const secondaryEv = enrichment.evidence_sources[1] || primaryEv;
    const scaleDesc = getScaleDescription(company, enrichment);

    const persLine1 = enrichment.personalization_hook;
    const persLine2 = `Given your role as ${contact.job_title} overseeing operational standards across ${company.name}'s ${scaleDesc}, I wanted to share how multi-unit operators orchestrate complex customer journeys.`;

    const evidenceIds: string[] = [];
    if (primaryEv?.id) evidenceIds.push(primaryEv.id);
    if (secondaryEv?.id && secondaryEv.id !== primaryEv?.id) evidenceIds.push(secondaryEv.id);

    const body = `Hi ${firstName},

${persLine1}

${persLine2}

At OSVI.ai, we developed Journey — an orchestration layer above traditional voice and chat bots designed for multi-agent teamwork and outcome-driven automation. Rather than deploying isolated point solutions that hit dead-ends when an inquiry requires store intervention, Journey coordinates specialized long-horizon agents with persistent memory across channels and days, backed by strict guardrails and seamless human handoff.

Are you open to a brief conversation next week to see how Journey approaches multi-day customer interaction orchestration across multi-unit operators?

Best regards,

[Amay Mishra / GTM Lead at OSVI.ai]
amaymishra1104@gmail.com

---
Opt-out: If this isn't relevant to your current operational priorities, reply 'unsubscribe' and I will immediately remove you from future notes.`;

    return {
      sequence_step: 1,
      day_offset: 1,
      step_title: 'Initial Personalized Introduction',
      subject: `Operations & multi-day journey orchestration at ${company.name}`,
      body,
      personalization_lines: [persLine1, persLine2],
      evidence_references: [
        enrichment.personalization_evidence_claim,
        `Sourced scale profile (${scaleDesc}) via ${primaryEv?.source_url || company.website}`
      ],
      evidence_ids: evidenceIds
    };
  }

  // Email 2: Relevant use case and potential business value (Day 4)
  private static generateEmail2(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const primaryEv = enrichment.evidence_sources[0];
    const scaleDesc = getScaleDescription(company, enrichment);

    const groundedChallenge = enrichment.operational_challenges.find(c => !c.is_hypothesis)?.description ||
      `coordinating high-volume customer inquiries across ${scaleDesc}`;
    
    const persLine = `In reviewing ${company.name}'s operations, we often observe that ${groundedChallenge.toLowerCase()} creates coordination strain between customer channels and store general managers.`;

    const evidenceIds: string[] = primaryEv?.id ? [primaryEv.id] : [];

    const body = `Hi ${firstName},

Following up on my earlier note.

${persLine}

When standalone chatbots or automated phone menus handle inquiries, they typically lack persistent state. If a customer starts an interaction on mobile and follows up by phone two days later, context is lost.

OSVI.ai Journey solves this by functioning as an orchestration layer above conversational bots:
- Proven at Scale: In Domino's India's large-scale rider reactivation and recruitment journeys across WhatsApp and voice (supporting 7 languages for 100k+ riders), Journey achieved a 3x increase in chat conversions (case study: https://www.osvi.ai/case-studies/dominos).
- Multi-Day Memory: Agents maintain persistent conversational context across multiple days for catering inquiries, crew onboarding, and guest feedback loops.
- Deterministic Guardrails: Safely escalates operational exceptions directly to store managers with complete interaction history.

Would you be open to a 10-minute walkthrough of how our multi-agent architecture coordinates complex workflows?

Best regards,

[Amay Mishra / GTM Lead at OSVI.ai]
amaymishra1104@gmail.com

---
Opt-out: Reply 'unsubscribe' to stop future emails.`;

    return {
      sequence_step: 2,
      day_offset: 4,
      step_title: 'Relevant Use Case & Business Value',
      subject: `Multi-day journey orchestration (proof from Domino's India)`,
      body,
      personalization_lines: [persLine],
      evidence_references: [
        `Operational challenge assessment: ${groundedChallenge}`
      ],
      evidence_ids: evidenceIds
    };
  }

  // Email 3: Thoughtful question about prospect's current workflow (Day 8)
  private static generateEmail3(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const primaryEv = enrichment.evidence_sources[0];
    const scaleDesc = getScaleDescription(company, enrichment);

    const persLine = `As ${contact.job_title} managing operational execution across ${scaleDesc}, you know where single-turn AI chatbots hit limits.`;
    const evidenceIds: string[] = primaryEv?.id ? [primaryEv.id] : [];

    const body = `Hi ${firstName},

${persLine}

I had a quick question regarding how your team currently handles multi-touchpoint interactions:

When a customer inquiry spans multiple days — such as a large catering reservation change, a driver onboarding question, or an escalated guest service loop — how do your current systems coordinate that request between front-line channels and store teams?

Most operators tell us their bots either drop the ball or blindly forward unstructured emails to store managers. Journey was built to orchestrate long-horizon teamwork among autonomous agents so customer inquiries reach actual operational resolution.

Curious if this is an area you are exploring this quarter.

Best regards,

[Amay Mishra / GTM Lead at OSVI.ai]
amaymishra1104@gmail.com

---
Opt-out: Reply 'unsubscribe' to stop future emails.`;

    return {
      sequence_step: 3,
      day_offset: 8,
      step_title: 'Thoughtful Workflow Question',
      subject: `Question on ${company.name}'s multi-day inquiry handoffs`,
      body,
      personalization_lines: [persLine],
      evidence_references: [
        `Role inquiry for ${contact.job_title} (${scaleDesc})`
      ],
      evidence_ids: evidenceIds
    };
  }

  // Email 4: Polite close-the-loop message (Day 13)
  private static generateEmail4(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const primaryEv = enrichment.evidence_sources[0];
    const scaleDesc = getScaleDescription(company, enrichment);

    const persLine = `I recognize you're fully focused on driving operational performance across ${company.name}'s ${scaleDesc}.`;
    const evidenceIds: string[] = primaryEv?.id ? [primaryEv.id] : [];

    const body = `Hi ${firstName},

${persLine} I don't want to crowd your inbox if multi-agent journey orchestration is not a current priority.

If you ever explore ways to move beyond traditional standalone bots toward long-horizon agent teamwork with persistent memory, guardrails, and safe human handoff, feel free to reach back out.

Wishing you and the ${company.name} team continued operational success.

Warm regards,

[Amay Mishra / GTM Lead at OSVI.ai]
amaymishra1104@gmail.com

---
Opt-out: Reply 'unsubscribe' to stop future emails.`;

    return {
      sequence_step: 4,
      day_offset: 13,
      step_title: 'Polite Close-the-Loop Message',
      subject: `Closing the loop — OSVI Journey & ${company.name}`,
      body,
      personalization_lines: [persLine],
      evidence_references: [
        `Summary closing referencing ${scaleDesc}`
      ],
      evidence_ids: evidenceIds
    };
  }
}
