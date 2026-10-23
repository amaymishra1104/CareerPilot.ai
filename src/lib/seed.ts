import { 
  ICPConfig, 
  Company, 
  Contact, 
  EnrichmentRecord, 
  IntegrationSettings 
} from '@/types';

export const INITIAL_ICP: ICPConfig = {
  id: 'icp-qsr-v1',
  name: 'US QSR & Fast-Casual Journey ICP',
  geography: ['United States'],
  industries: ['Quick-service restaurants', 'Fast-casual restaurant groups'],
  companySizeMinLocations: 20,
  companySizeMaxLocations: 200,
  restaurantCategories: ['fast-casual', 'sandwiches', 'chicken', 'tacos', 'mediterranean'],
  targetRoles: [
    'Chief Operating Officer',
    'COO',
    'VP of Operations',
    'Director of Operations',
    'Head of Guest Experience',
    'VP of Customer Experience'
  ],
  buyingSignals: [
    'executive operations restructuring',
    'multi-regional franchise expansion',
    'adoption of multi-unit guest feedback platforms',
    'back-of-house tech modernization',
    'digital pickup window format rollout'
  ],
  notes: 'Targeting multi-unit US operators (20-200 locations) experiencing isolated chatbot limitations, multi-day customer inquiry drop-off, and store-level dispatch complexity.',
  updated_at: new Date().toISOString()
};

export const INITIAL_SETTINGS: IntegrationSettings = {
  id: 'default',
  llm_provider: 'mock_demo',
  llm_api_key: process.env.LLM_API_KEY || '',
  llm_model: 'gpt-4o-mini',
  search_provider: 'mock_demo',
  search_api_key: process.env.SEARCH_API_KEY || '',
  gmail_client_id: process.env.GMAIL_CLIENT_ID || '',
  gmail_client_secret: process.env.GMAIL_CLIENT_SECRET || '',
  gmail_redirect_uri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback',
  gmail_refresh_token: process.env.GMAIL_REFRESH_TOKEN || '',
  gmail_connected_email: process.env.GMAIL_USER_EMAIL || '',
  gmail_connected: Boolean(process.env.GMAIL_REFRESH_TOKEN),
  n8n_webhook_secret: process.env.N8N_WEBHOOK_SECRET || '',
  demo_mode_active: true,
  updated_at: new Date().toISOString()
};

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'comp-tazikis-01',
    name: "Taziki's Mediterranean Cafe",
    website: 'https://www.tazikis.com/',
    industry: 'Fast-casual restaurant groups',
    headquarters: 'Birmingham, AL',
    estimated_locations: 100,
    company_size: '~100 locations across 16 states',
    restaurant_category: 'fast-casual',
    buying_signals: [
      'executive operations restructuring (new COO appointed)',
      'adoption of multi-unit guest feedback platforms (Ovation)',
      'multi-regional franchise expansion across Southeast'
    ],
    source_urls: [
      'https://www.tazikisfranchising.com/updates/introducing-tazikis-new-coo-john-ishmael',
      'https://www.tazikisfranchising.com/updates/how-tazikis-uses-ovation-to-capture-guest-feedback-and-deliver-next-level-hospitality'
    ],
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-piada-02',
    name: 'Piada Italian Street Food',
    website: 'https://mypiada.com/',
    industry: 'Fast-casual restaurant groups',
    headquarters: 'Columbus, OH',
    estimated_locations: 62,
    company_size: '62 operating locations across OH, IN, KY, PA, TX',
    restaurant_category: 'fast-casual',
    buying_signals: [
      'national expansion capital raise toward 1,000 units',
      'back-of-house tech modernization focus',
      'order-ahead pickup window format rollout'
    ],
    source_urls: [
      'https://mypiada.com/newsroom',
      'https://mypiada.com/locations'
    ],
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-velvet-03',
    name: 'Velvet Taco',
    website: 'https://www.velvettaco.com/',
    industry: 'Fast-casual restaurant groups',
    headquarters: 'Dallas, TX',
    estimated_locations: 45,
    company_size: '~45 locations across TX, OK, IL, GA, NC, TN',
    restaurant_category: 'fast-casual',
    buying_signals: [
      'executive leadership transition (former MOD Pizza Ops lead appointed CEO)',
      'multi-market geographic expansion',
      'late-night throughput and digital ordering volume'
    ],
    source_urls: [
      'https://www.prnewswire.com/news-releases/velvet-taco-names-chris-schultz-as-ceo-302631238.html',
      'https://www.velvettaco.com/about-us/'
    ],
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-waba-04',
    name: 'WaBa Grill',
    website: 'https://www.wabagrill.com/',
    industry: 'Quick-service restaurants',
    headquarters: 'City of Industry, CA',
    estimated_locations: 190,
    company_size: '~190 franchise units across CA, AZ, NV',
    restaurant_category: 'fast-casual',
    buying_signals: [
      'director of operations leadership appointment',
      'franchise system operational consistency drive',
      'seamless digital guest experience initiative'
    ],
    source_urls: [
      'https://wabagrillfranchising.com/research/meet-the-team/'
    ],
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-cleaneatz-05',
    name: 'Clean Eatz',
    website: 'https://cleaneatz.com/',
    industry: 'Fast-casual restaurant groups',
    headquarters: 'Wilmington, NC',
    estimated_locations: 115,
    company_size: '115+ locations across 23 states',
    restaurant_category: 'fast-casual',
    buying_signals: [
      'multi-unit franchise expansion across 23 states',
      'weekly meal plan subscription fulfillment orchestration',
      'customer support load during weekly order cutoffs'
    ],
    source_urls: [
      'https://cleaneatzfranchising.com/why-clean-eatz/'
    ],
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    created_at: new Date().toISOString()
  }
];

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'lead-john-01',
    company_id: 'comp-tazikis-01',
    company_name: "Taziki's Mediterranean Cafe",
    full_name: 'John Ishmael',
    job_title: 'Chief Operating Officer',
    professional_profile_url: 'https://www.tazikisfranchising.com/team',
    work_email: 'unavailable',
    email_verification_status: 'unavailable',
    source_url: 'https://www.tazikisfranchising.com/updates/introducing-tazikis-new-coo-john-ishmael',
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-lance-02',
    company_id: 'comp-piada-02',
    company_name: 'Piada Italian Street Food',
    full_name: 'Lance Juhas',
    job_title: 'Co-CEO & Chief Operating Officer',
    professional_profile_url: 'https://mypiada.com/newsroom',
    work_email: 'unavailable',
    email_verification_status: 'unavailable',
    source_url: 'https://mypiada.com/newsroom',
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-chris-03',
    company_id: 'comp-velvet-03',
    company_name: 'Velvet Taco',
    full_name: 'Chris Schultz',
    job_title: 'Chief Executive Officer (Operations Lead)',
    professional_profile_url: 'https://www.velvettaco.com/about-us/',
    work_email: 'unavailable',
    email_verification_status: 'unavailable',
    source_url: 'https://www.prnewswire.com/news-releases/velvet-taco-names-chris-schultz-as-ceo-302631238.html',
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-jonathan-04',
    company_id: 'comp-waba-04',
    company_name: 'WaBa Grill',
    full_name: 'Jonathan Aguirre',
    job_title: 'Director of Operations',
    professional_profile_url: 'https://wabagrillfranchising.com/research/meet-the-team/',
    work_email: 'unavailable',
    email_verification_status: 'unavailable',
    source_url: 'https://wabagrillfranchising.com/research/meet-the-team/',
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-quinn-05',
    company_id: 'comp-cleaneatz-05',
    company_name: 'Clean Eatz',
    full_name: 'Quinn Newhall',
    job_title: 'Chief Operating Officer',
    professional_profile_url: 'https://cleaneatzfranchising.com/why-clean-eatz/',
    work_email: 'unavailable',
    email_verification_status: 'unavailable',
    source_url: 'https://cleaneatzfranchising.com/why-clean-eatz/',
    retrieval_timestamp: '2026-04-20T12:00:00Z',
    provenance: 'real_curated',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

export const DEMO_ENRICHMENTS: Record<string, EnrichmentRecord> = {
  'lead-john-01': {
    id: 'enrich-john-01',
    lead_id: 'lead-john-01',
    company_id: 'comp-tazikis-01',
    company_overview: "Taziki's Mediterranean Cafe operates approximately 100 fast-casual locations across 16 states, emphasizing scratch-made Mediterranean cuisine and active franchise growth.",
    location_count_verifiable: 100,
    location_count_evidence: 'Documented across Taziki’s franchise development disclosures and verified restaurant opening updates at tazikisfranchising.com.',
    operational_challenges: [
      {
        description: 'Coordinating high-volume catering inquiries and store-level feedback across ~100 locations without overloading general managers.',
        is_hypothesis: false,
        evidence: "Derived from Taziki's multi-state 100-unit franchise network and dedicated catering services program."
      },
      {
        description: 'Multi-day customer recovery and catering change requests drop between standalone chatbot touchpoints and store staff.',
        is_hypothesis: true,
        evidence: 'Operational hypothesis: single-turn voice/chat bots lack persistent memory and multi-day agent teamwork.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Executive operations restructuring with appointment of new COO John Ishmael',
        source_url: 'https://www.tazikisfranchising.com/updates/introducing-tazikis-new-coo-john-ishmael',
        snippet: 'Introducing Taziki’s new COO, John Ishmael! Coming to us from 30 years of Papa John’s, John brings a wealth of knowledge and operational expertise to Taziki’s.'
      },
      {
        signal: 'Adoption of Ovation platform to capture and action guest feedback across stores',
        source_url: 'https://www.tazikisfranchising.com/updates/how-tazikis-uses-ovation-to-capture-guest-feedback-and-deliver-next-level-hospitality',
        snippet: 'Taziki’s uses Ovation to capture guest feedback and deliver next-level hospitality across its multi-unit system.'
      }
    ],
    personalization_hook: "Noticed Taziki's ongoing expansion across ~100 locations and your operational initiative connecting frontline guest feedback with multi-unit consistency.",
    personalization_evidence_claim: '~100 operating units across 16 states and COO appointment documented at tazikisfranchising.com.',
    confidence_score: 90,
    confidence_explanation: 'Score 90/100: Sources (40/40, 2 resolved URLs) + Authority (30/30, official franchisor portal) + Recency (20/20, active 2026 disclosures) + Reachability (0/10, work email unavailable to prevent unverified outreach).',
    last_verified_timestamp: '2026-04-20T12:00:00Z',
    evidence_sources: [
      {
        id: 'ev-tazikis-01',
        lead_id: 'lead-john-01',
        claim: 'John Ishmael serves as Chief Operating Officer of Taziki’s Mediterranean Cafe, bringing 30 years of operational experience to oversee system operations.',
        snippet: 'Introducing Taziki’s new COO, John Ishmael! Coming to us from 30 years of Papa John’s, John brings a wealth of knowledge and operational expertise to Taziki’s.',
        source_url: 'https://www.tazikisfranchising.com/updates/introducing-tazikis-new-coo-john-ishmael',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      },
      {
        id: 'ev-tazikis-02',
        lead_id: 'lead-john-01',
        claim: "Taziki's uses guest feedback technology (Ovation) across store operations to resolve customer sentiment.",
        snippet: 'Taziki’s uses Ovation to capture guest feedback and deliver next-level hospitality across its multi-unit system.',
        source_url: 'https://www.tazikisfranchising.com/updates/how-tazikis-uses-ovation-to-capture-guest-feedback-and-deliver-next-level-hospitality',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      }
    ],
    created_at: new Date().toISOString()
  },
  'lead-lance-02': {
    id: 'enrich-lance-02',
    lead_id: 'lead-lance-02',
    company_id: 'comp-piada-02',
    company_overview: 'Piada Italian Street Food operates 62 fast-casual Italian locations across Ohio, Indiana, Kentucky, Pennsylvania, and Texas, scaling toward national expansion.',
    location_count_verifiable: 62,
    location_count_evidence: 'Confirmed via Piada corporate directory and national development announcements at mypiada.com.',
    operational_challenges: [
      {
        description: 'Managing high-throughput digital pickup windows and custom order assembly across 62 fast-casual restaurants.',
        is_hypothesis: false,
        evidence: "Documented in Piada's digital order-ahead store format rollouts and operations reporting."
      },
      {
        description: 'Bot ordering drop-offs occur when guests customize Italian street wraps with complex substitutions and bots cannot coordinate back-of-house inventory.',
        is_hypothesis: true,
        evidence: 'Operational hypothesis: traditional retail bots fail on multi-step culinary ingredient modifiers.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Strategic capital raise for national scale-up targeting 1,000 locations',
        source_url: 'https://mypiada.com/newsroom',
        snippet: 'The 62-unit brand is pursuing a strategic capital raise to fuel a massive national scale-up. The goal? Transforming from a regional powerhouse into a national leader with a target of more than 1,000 U.S. locations.'
      }
    ],
    personalization_hook: "Saw Piada's milestone scaling across 62 units and the strategic roadmap toward 1,000 locations, particularly your operational emphasis on back-of-house technology.",
    personalization_evidence_claim: '62 operating units and national expansion capital raise documented at mypiada.com/newsroom.',
    confidence_score: 90,
    confidence_explanation: 'Score 90/100: Sources (40/40, 2 resolved URLs) + Authority (30/30, official corporate domain) + Recency (20/20, active 2026 newsroom filing) + Reachability (0/10, work email unavailable to prevent unverified outreach).',
    last_verified_timestamp: '2026-04-20T12:00:00Z',
    evidence_sources: [
      {
        id: 'ev-piada-01',
        lead_id: 'lead-lance-02',
        claim: 'Piada Italian Street Food operates 62 locations and is pursuing a strategic capital raise to scale nationally.',
        snippet: 'The 62-unit brand is pursuing a strategic capital raise to fuel a massive national scale-up. The goal? Transforming from a regional powerhouse into a national leader with a target of more than 1,000 U.S. locations.',
        source_url: 'https://mypiada.com/newsroom',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      },
      {
        id: 'ev-piada-02',
        lead_id: 'lead-lance-02',
        claim: 'Piada operates 62 active locations across Ohio, Indiana, Kentucky, Pennsylvania, and Texas.',
        snippet: 'Piada Italian Street Food directory lists 62 open operating locations across the Midwest and Texas.',
        source_url: 'https://mypiada.com/locations',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      }
    ],
    created_at: new Date().toISOString()
  },
  'lead-chris-03': {
    id: 'enrich-chris-03',
    lead_id: 'lead-chris-03',
    company_id: 'comp-velvet-03',
    company_overview: 'Velvet Taco operates approximately 45 fast-casual locations in Texas, Oklahoma, Illinois, Georgia, North Carolina, and Tennessee, known for high volume and late-night service.',
    location_count_verifiable: 45,
    location_count_evidence: 'Documented in Velvet Taco corporate announcements and executive appointment filings.',
    operational_challenges: [
      {
        description: 'Maintaining order accuracy and throughput during late-night digital ordering rushes across high-volume urban units.',
        is_hypothesis: false,
        evidence: 'Reported in fast-casual operational reviews regarding high weekly taco feature turnover.'
      },
      {
        description: 'Single-channel chatbots lose context when guests start an inquiry via web chat and follow up by phone.',
        is_hypothesis: true,
        evidence: 'Operational hypothesis: omni-channel memory fragmentation in fast-casual taco chains.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Appointment of former MOD Pizza operations executive Chris Schultz as CEO',
        source_url: 'https://www.prnewswire.com/news-releases/velvet-taco-names-chris-schultz-as-ceo-302631238.html',
        snippet: 'Velvet Taco, the fast-casual restaurant celebrated for its globally inspired tacos and bold flavors, has named Chris Schultz as CEO. Schultz brings over 30 years of restaurant industry leadership experience... driving growth with an emphasis on operations, innovation, and guest experience.'
      }
    ],
    personalization_hook: "Noticed your transition to CEO at Velvet Taco and your proven track record scaling restaurant operations from MOD Pizza to national footprints.",
    personalization_evidence_claim: 'Chris Schultz appointment and operational scaling mandate documented via PR Newswire.',
    confidence_score: 85,
    confidence_explanation: 'Score 85/100: Sources (40/40, 2 resolved URLs) + Authority (25/30, PR Newswire wire & brand domain) + Recency (20/20, active executive transition) + Reachability (0/10, work email unavailable to prevent unverified outreach).',
    last_verified_timestamp: '2026-04-20T12:00:00Z',
    evidence_sources: [
      {
        id: 'ev-velvet-01',
        lead_id: 'lead-chris-03',
        claim: 'Chris Schultz appointed CEO of Velvet Taco, bringing 30+ years of restaurant operations experience.',
        snippet: 'Velvet Taco, the fast-casual restaurant celebrated for its globally inspired tacos and bold flavors, has named Chris Schultz as CEO. Schultz brings over 30 years of restaurant industry leadership experience... driving growth with an emphasis on operations, innovation, and guest experience.',
        source_url: 'https://www.prnewswire.com/news-releases/velvet-taco-names-chris-schultz-as-ceo-302631238.html',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      }
    ],
    created_at: new Date().toISOString()
  },
  'lead-jonathan-04': {
    id: 'enrich-jonathan-04',
    lead_id: 'lead-jonathan-04',
    company_id: 'comp-waba-04',
    company_overview: 'WaBa Grill operates approximately 190 franchise locations across California, Arizona, and Nevada, specializing in healthy rice bowls and fresh-grilled proteins.',
    location_count_verifiable: 190,
    location_count_evidence: 'Verified via WaBa Grill franchise corporate records and store directory at wabagrillfranchising.com.',
    operational_challenges: [
      {
        description: 'Standardizing operational execution and digital order handoffs across 190 franchise locations.',
        is_hypothesis: false,
        evidence: 'Documented in WaBa Grill franchise support guidelines and multi-unit training documentation.'
      },
      {
        description: 'Franchisees deploy disconnected third-party ordering tools that lack unified human escalation protocols.',
        is_hypothesis: true,
        evidence: 'Operational hypothesis: franchise system tool sprawl creates inconsistent customer resolution.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Appointment of Jonathan Aguirre as Director of Operations to support franchise consistency',
        source_url: 'https://wabagrillfranchising.com/research/meet-the-team/',
        snippet: 'Jonathan Aguirre was appointed Director of Operations for WaBa Grill in 2026 after serving as a Senior Franchisee Business Consultant. Since joining WaBa Grill in 2014, Jonathan has held a variety of operational leadership roles... works closely with franchisees to drive operational excellence, strengthen business performance, and support the brand’s continued growth.'
      }
    ],
    personalization_hook: "Congratulations on your appointment as Director of Operations at WaBa Grill and your decade-long focus on strengthening franchisee operational performance across 190 stores.",
    personalization_evidence_claim: 'Director of Operations promotion and 190-unit franchise system documented on WaBa Grill leadership roster.',
    confidence_score: 70,
    confidence_explanation: 'Score 70/100: Sources (20/40, 1 resolved URL) + Authority (30/30, franchisor leadership roster) + Recency (20/20, 2026 appointment) + Reachability (0/10, work email unavailable to prevent unverified outreach).',
    last_verified_timestamp: '2026-04-20T12:00:00Z',
    evidence_sources: [
      {
        id: 'ev-waba-01',
        lead_id: 'lead-jonathan-04',
        claim: 'Jonathan Aguirre appointed Director of Operations for WaBa Grill to drive operational excellence across franchisees.',
        snippet: 'Jonathan Aguirre was appointed Director of Operations for WaBa Grill in 2026 after serving as a Senior Franchisee Business Consultant. Since joining WaBa Grill in 2014, Jonathan has held a variety of operational leadership roles... works closely with franchisees to drive operational excellence, strengthen business performance, and support the brand’s continued growth.',
        source_url: 'https://wabagrillfranchising.com/research/meet-the-team/',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      }
    ],
    created_at: new Date().toISOString()
  },
  'lead-quinn-05': {
    id: 'enrich-quinn-05',
    lead_id: 'lead-quinn-05',
    company_id: 'comp-cleaneatz-05',
    company_overview: 'Clean Eatz operates over 115 locations across 23 states, combining a healthy cafe format with weekly direct-to-consumer meal plan subscription distribution.',
    location_count_verifiable: 115,
    location_count_evidence: 'Verified via Clean Eatz franchise disclosure and stats disclosure at cleaneatzfranchising.com/why-clean-eatz/.',
    operational_challenges: [
      {
        description: 'Managing high customer support spikes during weekly meal plan ordering cutoffs across 115 storefronts.',
        is_hypothesis: false,
        evidence: 'Directly related to Clean Eatz 5-ways-to-earn model and weekly meal plan pickup cycles.'
      },
      {
        description: 'Meal plan order changes submitted via SMS fail to synchronize with store packing lists.',
        is_hypothesis: true,
        evidence: 'Operational hypothesis: meal subscription order adjustments require cross-agent coordination.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Franchise network expansion to 115+ locations across 23 states',
        source_url: 'https://cleaneatzfranchising.com/why-clean-eatz/',
        snippet: '115+ Locations / 23 States / 5 Ways to Earn / 2015 Franchising Since'
      }
    ],
    personalization_hook: "Noticed Clean Eatz's rapid expansion to 115+ locations across 23 states and the operational scale required to coordinate weekly meal plan fulfillment alongside cafe operations.",
    personalization_evidence_claim: '115+ locations in 23 states documented at cleaneatzfranchising.com.',
    confidence_score: 70,
    confidence_explanation: 'Score 70/100: Sources (20/40, 1 resolved URL) + Authority (30/30, franchisor research portal) + Recency (20/20, active 2026 disclosures) + Reachability (0/10, work email unavailable to prevent unverified outreach).',
    last_verified_timestamp: '2026-04-20T12:00:00Z',
    evidence_sources: [
      {
        id: 'ev-cleaneatz-01',
        lead_id: 'lead-quinn-05',
        claim: 'Clean Eatz operates 115+ locations across 23 states with structured weekly meal plan and cafe operations.',
        snippet: '115+ Locations / 23 States / 5 Ways to Earn / 2015 Franchising Since',
        source_url: 'https://cleaneatzfranchising.com/why-clean-eatz/',
        is_hypothesis: false,
        retrieved_at: '2026-04-20T12:00:00Z'
      }
    ],
    created_at: new Date().toISOString()
  }
};
