import { Contact, Company, EnrichmentRecord, EvidenceSource, EmailMessage, EmailSequence } from '@/types';

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '';
    this.model = model || process.env.LLM_MODEL || 'gemini-3.5-flash';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async callGemini(prompt: string, expectJson = true): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY in .env.local or enter it in Settings.');
    }

    const primaryModel = this.model;
    const fallbackModels = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
    const modelsToTry = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];

    let lastError: any = null;

    for (const m of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${this.apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined
          })
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errText = await res.text();
          // If 503 or 404, try next model in loop
          if (res.status === 503 || res.status === 404) {
            lastError = new Error(`Gemini model ${m} unavailable (HTTP ${res.status}): ${errText}`);
            continue;
          }
          throw new Error(`Gemini API error (HTTP ${res.status}): ${errText}`);
        }

        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error('Gemini returned an empty response candidate.');
        }

        if (expectJson) {
          try {
            return JSON.parse(candidateText);
          } catch {
            const match = candidateText.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            throw new Error('Failed to parse structured JSON from Gemini response.');
          }
        }

        return candidateText;
      } catch (err: any) {
        lastError = err;
        if (err.name === 'AbortError') {
          lastError = new Error('Gemini API request timed out after 15 seconds.');
        }
      }
    }

    throw lastError || new Error('Gemini API call failed across all attempted models.');
  }

  /**
   * Synthesizes grounded lead research using Google Gemini LLM.
   */
  async enrichLeadWithLLM(
    contact: Contact,
    company: Company,
    publicSnippet?: string
  ): Promise<EnrichmentRecord> {
    const primarySource = company.source_urls[0] || company.website || '';
    const locationStatus = company.location_count_status === 'verified' 
      ? `Verified: ${company.estimated_locations} units`
      : (company.estimated_locations > 0 ? `Estimated: ~${company.estimated_locations} units` : 'Unknown / Unverified');

    const prompt = `You are a strict GTM intelligence researcher for OSVI.ai. We sell "Journey" — an enterprise orchestration layer above voice and chat bots for US restaurant chains (multi-agent teamwork, multi-day persistent state, guardrails).
Summarize factual research for this lead:

Target Lead: ${contact.full_name} (${contact.job_title})
Company: ${company.name}
Industry/Category: ${company.restaurant_category || company.industry}
Headquarters: ${company.headquarters}
Employee Count: ${company.employee_count ? company.employee_count + ' employees' : 'Not reported'}
Location Count Status: ${locationStatus}
Buying Signals: ${JSON.stringify(company.buying_signals)}
Public Sources: ${JSON.stringify(company.source_urls)}
Retrieved Excerpt: ${publicSnippet || 'Official public profile'}

CRITICAL RULES:
1. Do NOT invent employee numbers, store counts, or fake URLs.
2. Label any unproven operational challenge strictly with is_hypothesis: true.
3. Every factual claim must link to a provided source URL: "${primarySource}".
4. Calculate a confidence_score out of 100 based on source authority and count.
5. Provide a crisp personalization hook referencing the executive's role (${contact.job_title}) and company's operational profile.

Return STRICT JSON matching this schema:
{
  "company_overview": "string",
  "location_count_evidence": "string",
  "operational_challenges": [
    { "description": "string", "is_hypothesis": boolean, "evidence": "string" }
  ],
  "verified_buying_signals": [
    { "signal": "string", "source_url": "string", "snippet": "string" }
  ],
  "personalization_hook": "string",
  "personalization_evidence_claim": "string",
  "confidence_score": number,
  "confidence_explanation": "string"
}`;

    const parsed = await this.callGemini(prompt, true);

    const evidenceList: EvidenceSource[] = [
      {
        id: `ev-gemini-${Date.now()}-1`,
        lead_id: contact.id,
        claim: parsed.personalization_evidence_claim || `${company.name} operational scale in ${company.headquarters}`,
        snippet: parsed.company_overview || `Synthesized from verified public record at ${primarySource}`,
        source_url: primarySource,
        is_hypothesis: !primarySource,
        retrieved_at: new Date().toISOString()
      }
    ];

    return {
      id: `enrich-${contact.id}`,
      lead_id: contact.id,
      company_id: company.id,
      company_overview: parsed.company_overview || `${company.name} operations profile in ${company.headquarters}`,
      location_count_verifiable: company.estimated_locations > 0 ? company.estimated_locations : undefined,
      location_count_evidence: parsed.location_count_evidence || (primarySource ? `Sourced from ${primarySource}` : 'Unverified location estimate'),
      operational_challenges: Array.isArray(parsed.operational_challenges) ? parsed.operational_challenges : [],
      verified_buying_signals: Array.isArray(parsed.verified_buying_signals) ? parsed.verified_buying_signals : [],
      personalization_hook: parsed.personalization_hook || `Noticed ${company.name}'s operational footprint and your leadership as ${contact.job_title}.`,
      personalization_evidence_claim: parsed.personalization_evidence_claim || `${contact.job_title} at ${company.name}`,
      confidence_score: typeof parsed.confidence_score === 'number' ? Math.min(100, Math.max(10, parsed.confidence_score)) : 75,
      confidence_explanation: `${parsed.confidence_explanation || 'Synthesized using Google Gemini LLM with grounded provider disclosures.'} (Model: ${this.model})`,
      last_verified_timestamp: new Date().toISOString(),
      evidence_sources: evidenceList,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Generates evidence-grounded 4-email sequence using Google Gemini LLM.
   */
  async generatePersonalizedSequence(
    contact: Contact,
    company: Company,
    enrichment: EnrichmentRecord
  ): Promise<EmailSequence> {
    const firstName = contact.full_name.split(' ')[0] || contact.full_name;
    const primarySource = company.source_urls[0] || company.website || 'https://www.osvi.ai';

    const prompt = `You are an expert enterprise B2B copywriter for OSVI.ai. We are pitching "Journey" to ${contact.full_name}, ${contact.job_title} at ${company.name}.
OSVI.ai Journey:
- Orchestration layer above traditional voice and chat bots.
- Multi-agent teamwork with persistent multi-day conversational memory.
- Strict guardrails, deterministic workflows, seamless store manager handoff.
- Proven case study: Domino's India rider reactivation (3x increase in chat conversions).
- Sender: Amay Mishra / GTM Lead at OSVI.ai (amaymishra1104@gmail.com).

Enrichment Context:
- Personalization Hook: "${enrichment.personalization_hook}"
- Evidence Claim: "${enrichment.personalization_evidence_claim}"
- Grounded Challenges: ${JSON.stringify(enrichment.operational_challenges)}
- Primary Source: "${primarySource}"

CRITICAL RULES:
1. Generate exactly 4 emails (Step 1: Introduction, Step 2: Domino's Use Case, Step 3: Thoughtful Workflow Question, Step 4: Polite Close-the-Loop).
2. For EACH email, provide:
   - "subject": string
   - "body": string (salutation "Hi ${firstName},", clear paragraphs, signoff from Amay Mishra, and opt-out footer)
   - "personalization_lines": array of strings (exact lines from the body that incorporate prospect/company facts)
   - "evidence_references": array of strings (the specific facts or citations backing those lines)
3. Do NOT make up false store counts or pretend we already know their internal metrics.

Return STRICT JSON:
{
  "email1": { "subject": "string", "body": "string", "personalization_lines": ["string"], "evidence_references": ["string"] },
  "email2": { "subject": "string", "body": "string", "personalization_lines": ["string"], "evidence_references": ["string"] },
  "email3": { "subject": "string", "body": "string", "personalization_lines": ["string"], "evidence_references": ["string"] },
  "email4": { "subject": "string", "body": "string", "personalization_lines": ["string"], "evidence_references": ["string"] }
}`;

    const parsed = await this.callGemini(prompt, true);

    const emailSteps: EmailMessage[] = [
      {
        sequence_step: 1,
        day_offset: 1,
        step_title: 'Initial Personalized Introduction',
        subject: parsed.email1?.subject || `Operations & journey orchestration at ${company.name}`,
        body: parsed.email1?.body || '',
        personalization_lines: parsed.email1?.personalization_lines || [enrichment.personalization_hook],
        evidence_references: parsed.email1?.evidence_references || [enrichment.personalization_evidence_claim]
      },
      {
        sequence_step: 2,
        day_offset: 4,
        step_title: 'Relevant Use Case & Business Value',
        subject: parsed.email2?.subject || `Multi-day journey orchestration (proof from Domino's India)`,
        body: parsed.email2?.body || '',
        personalization_lines: parsed.email2?.personalization_lines || [],
        evidence_references: parsed.email2?.evidence_references || ['Domino\'s India case study (3x conversion increase)']
      },
      {
        sequence_step: 3,
        day_offset: 8,
        step_title: 'Thoughtful Workflow Question',
        subject: parsed.email3?.subject || `Question on ${company.name}'s multi-day inquiry handoffs`,
        body: parsed.email3?.body || '',
        personalization_lines: parsed.email3?.personalization_lines || [],
        evidence_references: parsed.email3?.evidence_references || [`Role inquiry for ${contact.job_title}`]
      },
      {
        sequence_step: 4,
        day_offset: 13,
        step_title: 'Polite Close-the-Loop Message',
        subject: parsed.email4?.subject || `Closing the loop — OSVI Journey & ${company.name}`,
        body: parsed.email4?.body || '',
        personalization_lines: parsed.email4?.personalization_lines || [],
        evidence_references: parsed.email4?.evidence_references || ['Summary operational follow-up']
      }
    ];

    return {
      id: `seq-${contact.id}`,
      lead_id: contact.id,
      contact_name: contact.full_name,
      contact_email: contact.work_email,
      company_name: company.name,
      emails: emailSteps,
      status: 'GENERATED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
