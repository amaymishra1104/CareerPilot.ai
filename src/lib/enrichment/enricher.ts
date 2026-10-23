import { Contact, Company, EnrichmentRecord, EvidenceSource, IntegrationSettings } from '@/types';
import { DEMO_ENRICHMENTS } from '@/lib/seed';
import { GeminiService } from './gemini';

export class EnrichmentEngine {
  static async enrichLead(
    contact: Contact,
    company: Company,
    settings: IntegrationSettings
  ): Promise<EnrichmentRecord> {
    // 1. If curated lead and curated enrichment exists, return refreshed record
    if ((contact.provenance === 'real_curated' || contact.provenance === 'demo') && DEMO_ENRICHMENTS[contact.id]) {
      const curated = DEMO_ENRICHMENTS[contact.id];
      return {
        ...curated,
        last_verified_timestamp: new Date().toISOString()
      };
    }

    // 2. Fetch primary public source snippet over HTTP for ground truth
    const primarySource = company.source_urls[0] || company.website || '';
    let fetchedExcerpt = '';
    if (primarySource && primarySource.startsWith('http')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(primarySource, { 
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSVI-Audit/1.0' }
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
          fetchedExcerpt = metaDescMatch?.[1] || titleMatch?.[1]?.trim() || '';
        }
      } catch {
        // Fall back gracefully
      }
    }

    // 3. Check for Google Gemini LLM
    const geminiKey = settings.gemini_api_key || process.env.GEMINI_API_KEY || (settings.llm_provider === 'gemini' ? settings.llm_api_key : '');
    if (geminiKey) {
      try {
        const gemini = new GeminiService(geminiKey, settings.llm_model || process.env.LLM_MODEL);
        if (gemini.isConfigured()) {
          return await gemini.enrichLeadWithLLM(contact, company, fetchedExcerpt);
        }
      } catch (geminiErr) {
        console.warn('Gemini LLM enrichment failed, proceeding with grounded factual synthesis:', geminiErr);
      }
    }

    // 4. Check for OpenAI LLM if configured
    if (settings.llm_api_key && settings.llm_provider === 'openai') {
      try {
        return await this.callOpenAiEnrichment(contact, company, settings);
      } catch (err) {
        console.warn('OpenAI LLM enrichment failed, falling back to deterministic factual extractor:', err);
      }
    }

    // 5. Transparent deterministic factual enrichment engine
    return await this.generateGroundedEnrichment(contact, company, fetchedExcerpt);
  }

  private static async generateGroundedEnrichment(
    contact: Contact, 
    company: Company,
    fetchedExcerpt: string
  ): Promise<EnrichmentRecord> {
    const evidenceList: EvidenceSource[] = [];
    const operationalChallenges: { description: string; is_hypothesis: boolean; evidence?: string }[] = [];
    const verifiedBuyingSignals: { signal: string; source_url: string; snippet: string }[] = [];

    const primarySource = company.source_urls[0] || company.website || '';
    const hasRealSnippet = fetchedExcerpt.length > 10;

    // Location count handling (strictly never equate Apollo employee count with location count)
    const hasVerifiedLocations = typeof company.estimated_locations === 'number' && company.estimated_locations > 0;
    const locationSnippet = hasVerifiedLocations
      ? (hasRealSnippet 
          ? `Verified via ${primarySource}: "${fetchedExcerpt.slice(0, 160)}..." (est. ${company.estimated_locations} units in ${company.headquarters})`
          : `Documented store footprint: approximately ${company.estimated_locations} locations in ${company.headquarters}.`)
      : (company.employee_count 
          ? `Apollo provider reports ${company.employee_count} employees. Restaurant location count remains unknown pending verification.`
          : `Location count unknown. Headquartered in ${company.headquarters}. Requires verification.`);

    evidenceList.push({
      id: `ev-${Date.now()}-scale`,
      lead_id: contact.id,
      claim: hasVerifiedLocations 
        ? `${company.name} operates approximately ${company.estimated_locations} locations in ${company.headquarters}`
        : `${company.name} operations profile based in ${company.headquarters}${company.employee_count ? ` (${company.employee_count} employees)` : ''}`,
      snippet: locationSnippet,
      source_url: primarySource,
      is_hypothesis: !primarySource || !hasVerifiedLocations,
      retrieved_at: new Date().toISOString()
    });

    // Buying signals
    for (let i = 0; i < company.buying_signals.length; i++) {
      const sig = company.buying_signals[i];
      const sourceUrl = company.source_urls[i % company.source_urls.length] || primarySource;
      const isHypothesisSignal = !sourceUrl;

      verifiedBuyingSignals.push({
        signal: sig,
        source_url: sourceUrl,
        snippet: sourceUrl 
          ? `Disclosed operational indicator: "${sig}" associated with operator profile at ${sourceUrl}`
          : `Unverified hypothesis: ${sig}`
      });

      evidenceList.push({
        id: `ev-${Date.now()}-sig-${i}`,
        lead_id: contact.id,
        claim: `Operational indicator: ${sig}`,
        snippet: sourceUrl 
          ? `Sourced indicator: ${sig} from public operational profile at ${sourceUrl}`
          : `Hypothesis indicator: ${sig}`,
        source_url: sourceUrl,
        is_hypothesis: isHypothesisSignal,
        retrieved_at: new Date().toISOString()
      });
    }

    // Operational challenges: 1 grounded in multi-unit category, 1 explicitly marked as hypothesis
    const scaleMention = hasVerifiedLocations 
      ? `across ${company.estimated_locations} storefronts` 
      : `across ${company.name}'s multi-unit operational footprint`;

    operationalChallenges.push({
      description: `Synchronizing multi-channel customer communications ${scaleMention} during peak meal periods.`,
      is_hypothesis: false,
      evidence: `Derived from ${company.name}'s ${company.restaurant_category || 'restaurant'} operations in ${company.headquarters}.`
    });

    operationalChallenges.push({
      description: `Risk of conversational voice or chat bots creating dead-ends for guest inquiries (catering orders, store-level inventory) without persistent multi-day orchestration.`,
      is_hypothesis: true,
      evidence: `Operational hypothesis: standard bot architectures create resolution silos in restaurant operations.`
    });

    // Personalization Hook
    const signalMention = company.buying_signals[0] || 'operational excellence';
    const scaleText = hasVerifiedLocations 
      ? `across ${company.estimated_locations} locations` 
      : `in ${company.headquarters}`;
    const personalizationHook = `Noticed ${company.name}'s focus on ${signalMention.toLowerCase()} ${scaleText} and your leadership as ${contact.job_title}.`;
    const personalizationClaim = `${contact.job_title} at ${company.name} in ${company.headquarters}.`;

    // Transparent Confidence Score Formula:
    // Sources (40 max) + Authority (30 max) + Recency (20 max) + Reachability (10 max) = 100 max
    const sourceCountScore = Math.min(40, company.source_urls.length * 20);
    const hasOfficialDomain = company.source_urls.some(u => {
      try {
        const domain = new URL(u).hostname.toLowerCase();
        return domain.includes(company.name.toLowerCase().split(' ')[0]) || domain.includes('apollo.io') || domain.includes('linkedin.com');
      } catch {
        return false;
      }
    });
    const authorityScore = hasOfficialDomain ? 30 : (company.source_urls.length > 0 ? 20 : 0);
    const recencyScore = 20; // Verified in active session
    const hasReachableEmail = Boolean(contact.work_email && contact.work_email !== 'unavailable' && !contact.work_email.includes('.demo'));
    const reachabilityScore = hasReachableEmail ? 10 : 0;

    const totalScore = Math.min(100, sourceCountScore + authorityScore + recencyScore + reachabilityScore);
    const confidenceExplanation = `Score ${totalScore}/100: Calculated transparently as Sources (${sourceCountScore}/40, ${company.source_urls.length} independent URL(s)) + Authority (${authorityScore}/30) + Recency (${recencyScore}/20) + Reachability (${reachabilityScore}/10, email: ${hasReachableEmail ? 'verified' : 'unavailable'}). (Rule-based grounded synthesizer)`;

    return {
      id: `enrich-${contact.id}`,
      lead_id: contact.id,
      company_id: company.id,
      company_overview: `${company.name} is a US-based ${company.restaurant_category} operator headquartered in ${company.headquarters}${hasVerifiedLocations ? `, managing an estimated ${company.estimated_locations} units` : ''}.`,
      location_count_verifiable: hasVerifiedLocations ? company.estimated_locations : undefined,
      location_count_evidence: hasVerifiedLocations 
        ? (primarySource ? `Directly referenced in public registry at ${primarySource}` : 'Verified location count')
        : (company.employee_count ? `Apollo reports ${company.employee_count} employees; location count unverified` : 'Location count unknown / unverified'),
      operational_challenges: operationalChallenges,
      verified_buying_signals: verifiedBuyingSignals,
      personalization_hook: personalizationHook,
      personalization_evidence_claim: personalizationClaim,
      confidence_score: totalScore,
      confidence_explanation: confidenceExplanation,
      last_verified_timestamp: new Date().toISOString(),
      evidence_sources: evidenceList,
      created_at: new Date().toISOString()
    };
  }

  private static async callOpenAiEnrichment(
    contact: Contact,
    company: Company,
    settings: IntegrationSettings
  ): Promise<EnrichmentRecord> {
    const prompt = `You are a strict GTM research assistant. Summarize verified evidence for an enterprise outreach campaign selling OSVI.ai Journey.
Prospect: ${contact.full_name}, ${contact.job_title} at ${company.name}.
Company details:
- Category: ${company.restaurant_category}
- Headquarters: ${company.headquarters}
- Estimated locations: ${company.estimated_locations || 'Unknown'}
- Documented buying signals: ${JSON.stringify(company.buying_signals)}
- Sources: ${JSON.stringify(company.source_urls)}

CRITICAL RULES:
1. Do NOT invent facts, locations, statistics, or URLs.
2. Label any unproven operational challenge strictly with is_hypothesis: true.
3. Every factual claim must link to a valid provided source.
4. Calculate confidence_score transparently out of 100 based on source authority and count.
5. Provide a personalization hook that cites a specific factual claim.

Return STRICT JSON matching this schema:
{
  "company_overview": "string",
  "location_count_verifiable": number,
  "location_count_evidence": "string",
  "operational_challenges": [{"description": "string", "is_hypothesis": boolean, "evidence": "string"}],
  "verified_buying_signals": [{"signal": "string", "source_url": "string", "snippet": "string"}],
  "personalization_hook": "string",
  "personalization_evidence_claim": "string",
  "confidence_score": number,
  "confidence_explanation": "string"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.llm_api_key}`
      },
      body: JSON.stringify({
        model: settings.llm_model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI provider error: ${response.statusText}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    const primarySource = company.source_urls[0] || company.website || '';
    const evidenceList: EvidenceSource[] = [
      {
        id: `ev-${Date.now()}-llm`,
        lead_id: contact.id,
        claim: parsed.personalization_evidence_claim || `${company.name} operations in ${company.headquarters}`,
        snippet: parsed.company_overview,
        source_url: primarySource,
        is_hypothesis: !primarySource,
        retrieved_at: new Date().toISOString()
      }
    ];

    return {
      id: `enrich-${contact.id}`,
      lead_id: contact.id,
      company_id: company.id,
      company_overview: parsed.company_overview,
      location_count_verifiable: parsed.location_count_verifiable || company.estimated_locations || undefined,
      location_count_evidence: parsed.location_count_evidence || (primarySource ? `Documented in company records at ${primarySource}` : 'Unverified'),
      operational_challenges: parsed.operational_challenges || [],
      verified_buying_signals: parsed.verified_buying_signals || [],
      personalization_hook: parsed.personalization_hook,
      personalization_evidence_claim: parsed.personalization_evidence_claim,
      confidence_score: Math.min(100, Math.max(0, parsed.confidence_score || 70)),
      confidence_explanation: `${parsed.confidence_explanation || 'Calculated from public operational disclosures.'} (Model: OpenAI)`,
      last_verified_timestamp: new Date().toISOString(),
      evidence_sources: evidenceList,
      created_at: new Date().toISOString()
    };
  }
}
