import { Contact, Company, EnrichmentRecord, EmailMessage, EmailSequence } from '@/types';

export class EmailSequenceGenerator {
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
    const persLine1 = `I saw that ${company.name} is operating ${enrichment.location_count_verifiable || company.estimated_locations} locations in ${company.headquarters} and actively navigating ${company.buying_signals[0] || 'expansion'}.`;
    const persLine2 = `Given your role as ${contact.job_title}, I wanted to reach out regarding how multi-unit operators handle customer interaction handoffs across stores.`;

    const body = `Hi ${firstName},

${persLine1} ${persLine2}

At OSVI.ai, we built Journey — an advanced orchestration layer above traditional voice and chat bots that focuses on multi-agent teamwork and outcome-driven automation. 

Rather than deploying isolated chatbots that leave guests stranded when a request needs store action, Journey coordinates specialized conversational agents alongside your existing operating workflows.

Are you open to a brief conversation next week to see how Journey approaches guest interaction coordination across multi-unit groups?

Best regards,

OSVI.ai GTM Team`;

    return {
      sequence_step: 1,
      day_offset: 1,
      step_title: 'Initial Personalized Introduction',
      subject: `${company.name} operations & guest interaction orchestration`,
      body,
      personalization_lines: [persLine1, persLine2],
      evidence_references: [
        enrichment.personalization_evidence_claim,
        `Documented ${company.estimated_locations} locations via ${company.source_urls[0] || company.website}`
      ]
    };
  }

  // Email 2: Relevant use case and potential business value (Day 4)
  private static generateEmail2(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const challenge = enrichment.operational_challenges[0]?.description || 
      `handling peak phone and digital order influx across ${company.estimated_locations} storefronts`;
    
    const persLine = `In reviewing ${company.name}'s multi-unit footprint, a common friction point in ${company.restaurant_category} operations is ${challenge.toLowerCase()}`;

    const body = `Hi ${firstName},

Following up on my earlier note.

${persLine}

Most automated phone and chat systems fail because they operate in a vacuum. When a customer has an issue with an order modification or store-specific availability, single-purpose bots typically hit a dead end.

OSVI.ai Journey resolves this by acting as an orchestration layer above point solutions:
- Coordinating specialized autonomous agents for intake, verification, and store dispatch.
- Ensuring human-in-the-loop escalation paths when store-level intervention is needed.
- Aligning front-line communication directly with operational outcomes rather than simple script matching.

Would you be open to a 15-minute walkthrough of our multi-agent orchestration architecture?

Best,

OSVI.ai GTM Team`;

    return {
      sequence_step: 2,
      day_offset: 4,
      step_title: 'Relevant Use Case & Business Value',
      subject: `Orchestrating guest resolution across ${company.name} locations`,
      body,
      personalization_lines: [persLine],
      evidence_references: [
        `Operational challenge assessment: ${enrichment.operational_challenges[0]?.description || 'Operational throughput'}`
      ]
    };
  }

  // Email 3: Thoughtful question about prospect's current workflow (Day 8)
  private static generateEmail3(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const persLine = `As ${contact.job_title} overseeing operations across ${company.estimated_locations} stores, you likely see the limits of traditional standalone chatbots firsthand.`;

    const body = `Hi ${firstName},

${persLine}

I had a quick question regarding how your team currently handles conversational automation:

When a guest calls or messages a store during peak lunch or dinner hours with an operational exception — such as a catering adjustment or curbside status check — how do your current systems coordinate that request between the customer interface and the store team?

Journey was designed specifically for this gap: orchestrating teamwork among multiple agents so customer inquiries drive real operational resolution, rather than deflection.

Curious if this is an area you are evaluating this quarter.

Best regards,

OSVI.ai GTM Team`;

    return {
      sequence_step: 3,
      day_offset: 8,
      step_title: 'Thoughtful Workflow Question',
      subject: `Question on ${company.name}'s store-level order exceptions`,
      body,
      personalization_lines: [persLine],
      evidence_references: [
        `Role-specific inquiry for ${contact.job_title} across ${company.estimated_locations} units`
      ]
    };
  }

  // Email 4: Polite close-the-loop message (Day 13)
  private static generateEmail4(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): EmailMessage {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const persLine = `I recognize you're focused on running ${company.name}'s ${enrichment.location_count_verifiable || company.estimated_locations} locations.`;

    const body = `Hi ${firstName},

${persLine} I don't want to crowd your inbox if this isn't a current priority.

If you ever explore ways to move beyond traditional standalone bots toward multi-agent journey orchestration for your restaurants, feel free to reach back out.

Wishing you and the ${company.name} team continued success with your upcoming expansion.

Warm regards,

OSVI.ai GTM Team`;

    return {
      sequence_step: 4,
      day_offset: 13,
      step_title: 'Polite Close-the-Loop Message',
      subject: `Closing the loop — OSVI.ai & ${company.name}`,
      body,
      personalization_lines: [persLine],
      evidence_references: [
        `Summary closing referencing ${company.estimated_locations} units and expansion`
      ]
    };
  }
}
