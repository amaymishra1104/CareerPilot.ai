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

// ============================================================================
// CareerPilot AI Seed Data
// ============================================================================

import {
  UserProfile,
  JobPreferences,
  ResumeRecord,
  JobListing,
  RecruiterContact,
  JobMatchResult,
  JobApplicationRecord,
  DailyAutomationConfig
} from '@/types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-amay-01',
  name: 'Amay Mishra',
  email: 'amaymishra1104@gmail.com',
  headline: 'Computer Science & AI Senior | Full-Stack & Machine Learning Engineer',
  bio: 'Driven Computer Science student passionate about building scalable full-stack applications, intelligent agent workflows, and machine learning systems. Seeking high-impact software engineering or AI internships and fresher roles.',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco Bay Area, CA',
  linkedin_url: 'https://linkedin.com/in/amaymishra',
  github_url: 'https://github.com/amaymishra',
  portfolio_url: 'https://amaymishra.dev',
  default_signature: 'Best regards,\nAmay Mishra\nB.S. in Computer Science\namaymishra1104@gmail.com | (555) 234-5678\nhttps://github.com/amaymishra',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEFAULT_JOB_PREFERENCES: JobPreferences = {
  id: 'pref-user-01',
  user_id: 'user-amay-01',
  target_roles: [
    'Software Engineer Intern',
    'Full Stack Engineer',
    'Machine Learning Intern',
    'AI Engineer',
    'Product Management Intern'
  ],
  employment_types: ['internship', 'full_time'],
  locations: ['Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Bangalore, India'],
  remote_preference: 'any',
  skills: [
    'TypeScript',
    'Python',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'PyTorch',
    'Docker',
    'REST APIs',
    'Tailwind CSS',
    'Git'
  ],
  industries: ['AI & Machine Learning', 'Developer Tools', 'SaaS', 'FinTech'],
  experience_level: 'internship',
  willing_to_relocate: true,
  expected_salary_or_stipend: '$40 - $65 / hr or $7,000 - $10,000 / month',
  preferred_company_types: ['High-growth Startups', 'Tech Giants', 'Open Source Companies', 'Research Labs'],
  updated_at: new Date().toISOString()
};

export const DEFAULT_RESUMES: ResumeRecord[] = [
  {
    id: 'resume-tech-01',
    user_id: 'user-amay-01',
    profile_type: 'technical',
    title: 'Technical Resume (Software Engineering & Systems)',
    version: 1,
    is_default: true,
    file_name: 'Amay_Mishra_Technical_Resume.pdf',
    file_type: 'pdf',
    raw_content: 'Technical Resume of Amay Mishra. Focused on Full Stack, Systems, TypeScript, Python, Next.js, and Databases.',
    extracted_text: `AMAY MISHRA
Email: amaymishra1104@gmail.com | Phone: (555) 234-5678 | GitHub: github.com/amaymishra | LinkedIn: linkedin.com/in/amaymishra

EDUCATION
Bachelor of Science in Computer Science | Senior (Graduation: June 2026) | GPA: 3.88/4.00
Relevant Coursework: Distributed Systems, Operating Systems, Data Structures & Algorithms, Database Systems, Computer Networks.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, C++, SQL, HTML/CSS
Frameworks & Libraries: React, Next.js 15, Node.js, Express, Fastify, Tailwind CSS, Redux, Vitest, Jest
Databases & Cloud: PostgreSQL, Redis, Supabase, SQLite, Docker, AWS (S3, Lambda), Git, CI/CD GitHub Actions

EXPERIENCE
Software Engineering Intern | CloudScale Systems | June 2025 – August 2025
- Architected and implemented high-throughput asynchronous worker pipelines in TypeScript and Node.js, processing 100K+ daily analytics events.
- Optimized PostgreSQL indexing strategy and query execution plans, reducing p95 database query latency by 41%.
- Authored 45+ unit and integration tests using Vitest and Mock Service Worker, elevating test coverage from 64% to 88%.
- Collaborated in an agile scrum team of 8 engineers, participating in bi-weekly sprints, daily standups, and rigorous peer code reviews.

TECHNICAL PROJECTS
Distributed Task Queue & State Machine Engine (TypeScript, Redis, Docker)
- Engineered a distributed, fault-tolerant background task execution engine supporting priority scheduling, delayed retries, and exponential backoff.
- Integrated Redis pub/sub with Redis Streams for persistent event delivery and zero message loss during worker crashes.
- Implemented real-time telemetry dashboard in Next.js displaying queue health, throughput metrics, and worker node status.

Real-Time Collaborative Code Playground (Next.js, WebSockets, Node.js, Docker)
- Developed an interactive browser-based code playground allowing simultaneous multi-user code editing with sub-50ms sync latency.
- Containerized isolated runner sandboxes in Docker to execute untrusted JavaScript and Python snippets with CPU and memory cgroups limits.
- Designed responsive dark-mode interface with Monaco Editor and Tailwind CSS.

Automated B2B Data Orchestration Platform (Next.js, TypeScript, PostgreSQL)
- Built enterprise workflow automation tool with multi-stage execution pipelines, human-in-the-loop review gates, and RFC-compliant draft generation.
- Implemented robust error handling, rate limiting, and structured audit logs.

HONORS & CERTIFICATIONS
- AWS Certified Solutions Architect - Associate (2025)
- First Place Winner, HackInnovate Collegiate Hackathon (350+ participants)
- Dean's Honor List (Fall 2023, Spring 2024, Fall 2024, Spring 2025)`,
    structured_data: {
      summary: 'Computer Science senior with extensive hands-on experience in full-stack web development, distributed systems, TypeScript, Node.js, and relational databases. Proven track record in building fault-tolerant applications and high-throughput pipelines.',
      skills: [
        'TypeScript',
        'JavaScript',
        'Python',
        'Go',
        'React',
        'Next.js',
        'Node.js',
        'PostgreSQL',
        'Redis',
        'Docker',
        'AWS',
        'REST APIs',
        'Git',
        'CI/CD',
        'Vitest'
      ],
      education: [
        {
          institution: 'State University of Technology',
          degree: 'Bachelor of Science',
          field_of_study: 'Computer Science',
          start_date: 'August 2022',
          end_date: 'June 2026',
          gpa: '3.88/4.0',
          honors: ["Dean's Honor List (4 semesters)", 'Merit Scholarship Recipient']
        }
      ],
      experience: [
        {
          company: 'CloudScale Systems',
          role: 'Software Engineering Intern',
          location: 'San Francisco, CA (Hybrid)',
          start_date: 'June 2025',
          end_date: 'August 2025',
          current: false,
          description_bullets: [
            'Architected and implemented high-throughput asynchronous worker pipelines in TypeScript and Node.js, processing 100K+ daily analytics events.',
            'Optimized PostgreSQL indexing strategy and query execution plans, reducing p95 database query latency by 41%.',
            'Authored 45+ unit and integration tests using Vitest and Mock Service Worker, elevating test coverage from 64% to 88%.',
            'Collaborated in an agile scrum team of 8 engineers, participating in bi-weekly sprints, daily standups, and rigorous peer code reviews.'
          ],
          technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Vitest']
        }
      ],
      projects: [
        {
          title: 'Distributed Task Queue & State Machine Engine',
          description: 'Fault-tolerant background task execution engine with priority scheduling and delayed retries.',
          bullet_points: [
            'Engineered a distributed, fault-tolerant background task execution engine supporting priority scheduling, delayed retries, and exponential backoff.',
            'Integrated Redis pub/sub with Redis Streams for persistent event delivery and zero message loss during worker crashes.',
            'Implemented real-time telemetry dashboard in Next.js displaying queue health, throughput metrics, and worker node status.'
          ],
          technologies: ['TypeScript', 'Redis', 'Node.js', 'Docker', 'Next.js'],
          link: 'https://github.com/amaymishra/distributed-task-queue'
        },
        {
          title: 'Real-Time Collaborative Code Playground',
          description: 'Interactive browser-based code playground with isolated Docker execution sandboxes.',
          bullet_points: [
            'Developed an interactive browser-based code playground allowing simultaneous multi-user code editing with sub-50ms sync latency.',
            'Containerized isolated runner sandboxes in Docker to execute untrusted JavaScript and Python snippets with CPU and memory cgroups limits.',
            'Designed responsive dark-mode interface with Monaco Editor and Tailwind CSS.'
          ],
          technologies: ['Next.js', 'WebSockets', 'Node.js', 'Docker', 'Tailwind CSS'],
          link: 'https://github.com/amaymishra/collaborative-code'
        },
        {
          title: 'Automated B2B Data Orchestration Platform',
          description: 'Enterprise workflow automation tool with multi-stage pipelines and review gates.',
          bullet_points: [
            'Built enterprise workflow automation tool with multi-stage execution pipelines, human-in-the-loop review gates, and RFC-compliant draft generation.',
            'Implemented robust error handling, rate limiting, and structured audit logs.'
          ],
          technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
          link: 'https://github.com/amaymishra/workflow-orchestrator'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect - Associate',
          issuer: 'Amazon Web Services',
          issue_date: 'March 2025'
        }
      ],
      achievements: [
        'First Place Winner, HackInnovate Collegiate Hackathon (350+ participants)',
        "Dean's Honor List (4 consecutive semesters)",
        'Open-Source Contributor to popular TypeScript libraries'
      ]
    },
    is_immutable_original: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'resume-aiml-02',
    user_id: 'user-amay-01',
    profile_type: 'ai_ml',
    title: 'AI / Machine Learning Engineering Resume',
    version: 1,
    is_default: false,
    file_name: 'Amay_Mishra_AIML_Resume.pdf',
    file_type: 'pdf',
    raw_content: 'AI/ML Resume of Amay Mishra. Focused on Machine Learning, LLMs, PyTorch, RAG pipelines, Hugging Face, Python.',
    extracted_text: `AMAY MISHRA
Email: amaymishra1104@gmail.com | Phone: (555) 234-5678 | GitHub: github.com/amaymishra | LinkedIn: linkedin.com/in/amaymishra

EDUCATION
Bachelor of Science in Computer Science (Concentration: AI & Machine Learning) | Senior (June 2026) | GPA: 3.88/4.00
Relevant Coursework: Deep Learning, Natural Language Processing, Machine Learning Systems, Linear Algebra, Probability & Statistics.

AI & ML SKILLS
Languages: Python, C++, SQL, TypeScript
ML Frameworks: PyTorch, Hugging Face Transformers, LangChain, LlamaIndex, Scikit-Learn, NumPy, Pandas
LLM & Generative AI: Fine-Tuning (LoRA/QLoRA), RAG Pipelines, Vector Databases (Chroma, Pinecone, FAISS), Prompt Engineering, vLLM
MLOps & Infrastructure: Docker, MLflow, FastAPI, Weights & Biases, CUDA, ONNX Runtime

EXPERIENCE
AI Research Assistant | University Cognitive Intelligence Lab | January 2025 – Present
- Investigated parameter-efficient fine-tuning (PEFT) methods on 7B-parameter open-weight language models for specialized technical reasoning.
- Engineered hybrid retrieval-augmented generation (RAG) evaluation benchmarks comparing dense vs BM25 sparse retrievers across 12,000 queries.
- Profiled GPU VRAM utilization and kernel throughput, achieving 28% speedup in batch inference using vLLM and FlashAttention-2.

PROJECTS
Production RAG Knowledge Engine for Technical Documentation (Python, PyTorch, LangChain, Chroma, FastAPI)
- Built an enterprise question-answering system combining recursive character semantic chunking, Cohere reranking, and self-query metadata filtering.
- Implemented ground-truth hallucination detection using cosine similarity thresholds and automated factual consistency verification.
- Packaged backend into a high-concurrency FastAPI microservice with automated unit tests and Docker orchestration.

Task-Specific LLM Fine-Tuning via QLoRA (Python, PyTorch, Hugging Face, Transformers)
- Fine-tuned Llama-3-8B on 15,000 synthetic JSON tool-calling demonstrations, improving multi-step API function call accuracy from 68% to 92.4%.
- Conducted systematic ablation studies on rank (r=8, 16, 32) and alpha scaling to minimize catastrophic forgetting.

Vision-Based Defect Classification Pipeline (PyTorch, Torchvision, OpenCV)
- Trained convolutional and Vision Transformer (ViT) architectures on 25,000 industrial component images with custom augmentations.
- Deployed lightweight quantized model via ONNX runtime, achieving 97.2% top-1 accuracy with 14ms inference latency per frame.

PUBLICATIONS & HONORS
- Co-author on undergraduate research paper on Efficient Semantic Chunking in RAG Pipelines (under review).
- Kaggle Competition Silver Medalist (NLP classification challenge).
- DeepLearning.AI Specialization Certificate (Deep Learning, Natural Language Processing).`,
    structured_data: {
      summary: 'AI/ML-focused Computer Science senior with strong theoretical foundation and practical experience developing deep learning models, fine-tuning LLMs, building production RAG pipelines, and deploying scalable machine learning services.',
      skills: [
        'Python',
        'PyTorch',
        'Hugging Face Transformers',
        'LangChain',
        'LlamaIndex',
        'Vector Databases',
        'FastAPI',
        'Docker',
        'Scikit-Learn',
        'NumPy',
        'Pandas',
        'MLflow',
        'CUDA',
        'RAG'
      ],
      education: [
        {
          institution: 'State University of Technology',
          degree: 'Bachelor of Science',
          field_of_study: 'Computer Science (Concentration: Artificial Intelligence)',
          start_date: 'August 2022',
          end_date: 'June 2026',
          gpa: '3.88/4.0',
          honors: ['Outstanding Undergraduate Researcher Award', "Dean's Honor List"]
        }
      ],
      experience: [
        {
          company: 'University Cognitive Intelligence Lab',
          role: 'AI Research Assistant',
          location: 'Campus Research Center',
          start_date: 'January 2025',
          end_date: 'Present',
          current: true,
          description_bullets: [
            'Investigated parameter-efficient fine-tuning (PEFT) methods on 7B-parameter open-weight language models for specialized technical reasoning.',
            'Engineered hybrid retrieval-augmented generation (RAG) evaluation benchmarks comparing dense vs BM25 sparse retrievers across 12,000 queries.',
            'Profiled GPU VRAM utilization and kernel throughput, achieving 28% speedup in batch inference using vLLM and FlashAttention-2.'
          ],
          technologies: ['Python', 'PyTorch', 'Hugging Face', 'vLLM', 'CUDA', 'LangChain']
        }
      ],
      projects: [
        {
          title: 'Production RAG Knowledge Engine for Technical Documentation',
          description: 'Enterprise question-answering system with semantic chunking and automated hallucination detection.',
          bullet_points: [
            'Built an enterprise question-answering system combining recursive character semantic chunking, Cohere reranking, and self-query metadata filtering.',
            'Implemented ground-truth hallucination detection using cosine similarity thresholds and automated factual consistency verification.',
            'Packaged backend into a high-concurrency FastAPI microservice with automated unit tests and Docker orchestration.'
          ],
          technologies: ['Python', 'PyTorch', 'LangChain', 'ChromaDB', 'FastAPI', 'Docker'],
          link: 'https://github.com/amaymishra/production-rag-engine'
        },
        {
          title: 'Task-Specific LLM Fine-Tuning via QLoRA',
          description: 'Parameter-efficient fine-tuning of 8B parameter models for multi-step JSON tool calling.',
          bullet_points: [
            'Fine-tuned Llama-3-8B on 15,000 synthetic JSON tool-calling demonstrations, improving multi-step API function call accuracy from 68% to 92.4%.',
            'Conducted systematic ablation studies on rank (r=8, 16, 32) and alpha scaling to minimize catastrophic forgetting.'
          ],
          technologies: ['Python', 'PyTorch', 'Hugging Face', 'PEFT', 'Weights & Biases'],
          link: 'https://github.com/amaymishra/qlora-function-calling'
        },
        {
          title: 'Vision-Based Defect Classification Pipeline',
          description: 'Vision Transformer defect detection with ONNX quantized edge inference.',
          bullet_points: [
            'Trained convolutional and Vision Transformer (ViT) architectures on 25,000 industrial component images with custom augmentations.',
            'Deployed lightweight quantized model via ONNX runtime, achieving 97.2% top-1 accuracy with 14ms inference latency per frame.'
          ],
          technologies: ['PyTorch', 'Torchvision', 'OpenCV', 'ONNX Runtime'],
          link: 'https://github.com/amaymishra/vision-defect-classification'
        }
      ],
      certifications: [
        {
          name: 'Deep Learning Specialization',
          issuer: 'DeepLearning.AI',
          issue_date: 'October 2024'
        },
        {
          name: 'Natural Language Processing Specialization',
          issuer: 'DeepLearning.AI',
          issue_date: 'December 2024'
        }
      ],
      achievements: [
        'Co-author on undergraduate research paper on Efficient Semantic Chunking in RAG Pipelines',
        'Kaggle Competition Silver Medalist in NLP multi-class prediction',
        'Top 1% score in university algorithmic problem solving competition'
      ]
    },
    is_immutable_original: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'resume-business-03',
    user_id: 'user-amay-01',
    profile_type: 'business_gtm',
    title: 'Business / GTM & Product Management Resume',
    version: 1,
    is_default: false,
    file_name: 'Amay_Mishra_Business_GTM_Resume.pdf',
    file_type: 'pdf',
    raw_content: 'Business and GTM Resume of Amay Mishra. Focused on Product Management, Developer Relations, Growth, Analytics, and Customer Discovery.',
    extracted_text: `AMAY MISHRA
Email: amaymishra1104@gmail.com | Phone: (555) 234-5678 | LinkedIn: linkedin.com/in/amaymishra

EDUCATION
Bachelor of Science in Computer Science & Business Administration Minor | Senior (June 2026) | GPA: 3.88/4.00
Coursework: Product Management, Technology Strategy, Quantitative Marketing Analysis, Financial Accounting, Technical Writing.

BUSINESS & PRODUCT SKILLS
Product & Strategy: Product Requirements Documents (PRDs), User Research, Customer Journey Mapping, Competitor Analysis, Wireframing (Figma)
Data & Analytics: SQL, Mixpanel, PostHog, Google Analytics, Excel/Google Sheets Modeling, A/B Testing, Tableau
GTM & Outreach: Developer Evangelism, Technical Documentation, Content Strategy, B2B SaaS Sales Motion, Email Campaign Design

EXPERIENCE
Product Operations & Growth Intern | LaunchPad Ventures | May 2024 – August 2024
- Conducted 30+ structured user discovery interviews with engineering managers to evaluate pain points in developer onboarding pipelines.
- Formulated data-driven user persona segmentation model using Mixpanel cohort analytics, contributing to 22% higher activation rates.
- Authored comprehensive Product Requirements Document (PRD) for internal founder portal adopted by 45 portfolio founders.
- Coordinated weekly feature prioritization sprint meetings between engineering leads, design, and executive stakeholders.

PROJECTS & INITIATIVES
Campus Developer Community Growth Initiative (President & Lead Organizer)
- Grew student developer chapter from 120 to 1,500+ active members across 6 colleges by organizing 14 technical hackathons and workshops.
- Secured $18,000 in corporate sponsorships from leading developer tool and cloud infrastructure companies.
- Managed 8-person organizing committee overseeing event logistics, partner relations, and social outreach campaigns.

Developer Tool Product Teardown & Growth Playbook
- Published comprehensive 24-page analytical teardown of developer-first API platforms, analyzing pricing tiers, documentation UX, and time-to-first-hello-world.
- Shared publicly on Substack and received over 12,000 views and endorsements from senior developer advocates.

SaaS Customer Funnel & Retention Analysis (SQL, Tableau, Python)
- Analyzed 80,000 synthetic SaaS user session events to uncover friction points in trial-to-paid conversion funnels.
- Built interactive Tableau dashboard modeling churn sensitivity and lifetime value (LTV) across customer acquisition channels.

LEADERSHIP & CERTIFICATIONS
- President, Collegiate Tech & Entrepreneurship Society (2024 – 2025)
- Google Project Management Professional Certificate (2025)
- Winner, Regional Intercollegiate Business Case Competition (24 competing universities)`,
    structured_data: {
      summary: 'Technically grounded Computer Science senior with passion for Product Management, Developer Relations, and Go-To-Market execution. Skilled in customer discovery, data-backed feature prioritization, SQL analytics, and technical communication.',
      skills: [
        'Product Strategy',
        'User Research',
        'Customer Discovery',
        'PRD Authoring',
        'SQL',
        'Mixpanel',
        'PostHog',
        'Wireframing (Figma)',
        'A/B Testing',
        'Go-To-Market Strategy',
        'Developer Relations',
        'Technical Writing'
      ],
      education: [
        {
          institution: 'State University of Technology',
          degree: 'Bachelor of Science',
          field_of_study: 'Computer Science (Minor: Business Administration)',
          start_date: 'August 2022',
          end_date: 'June 2026',
          gpa: '3.88/4.0',
          honors: ['Presidential Student Leadership Award', "Dean's Honor List"]
        }
      ],
      experience: [
        {
          company: 'LaunchPad Ventures',
          role: 'Product Operations & Growth Intern',
          location: 'San Francisco, CA',
          start_date: 'May 2024',
          end_date: 'August 2024',
          current: false,
          description_bullets: [
            'Conducted 30+ structured user discovery interviews with engineering managers to evaluate pain points in developer onboarding pipelines.',
            'Formulated data-driven user persona segmentation model using Mixpanel cohort analytics, contributing to 22% higher activation rates.',
            'Authored comprehensive Product Requirements Document (PRD) for internal founder portal adopted by 45 portfolio founders.',
            'Coordinated weekly feature prioritization sprint meetings between engineering leads, design, and executive stakeholders.'
          ],
          technologies: ['Mixpanel', 'SQL', 'Figma', 'Product Analytics', 'Notion']
        }
      ],
      projects: [
        {
          title: 'Campus Developer Community Growth Initiative',
          description: 'Grew student developer organization to 1,500+ active members and secured $18K sponsorships.',
          bullet_points: [
            'Grew student developer chapter from 120 to 1,500+ active members across 6 colleges by organizing 14 technical hackathons and workshops.',
            'Secured $18,000 in corporate sponsorships from leading developer tool and cloud infrastructure companies.',
            'Managed 8-person organizing committee overseeing event logistics, partner relations, and social outreach campaigns.'
          ],
          technologies: ['Community Growth', 'Event Management', 'Sponsorship Relations'],
          link: 'https://github.com/amaymishra/developer-community'
        },
        {
          title: 'Developer Tool Product Teardown & Growth Playbook',
          description: 'In-depth analytical teardown of developer-first API onboarding and pricing dynamics.',
          bullet_points: [
            'Published comprehensive 24-page analytical teardown of developer-first API platforms, analyzing pricing tiers, documentation UX, and time-to-first-hello-world.',
            'Shared publicly on Substack and received over 12,000 views and endorsements from senior developer advocates.'
          ],
          technologies: ['Product Teardown', 'User Journey Mapping', 'Technical Writing'],
          link: 'https://github.com/amaymishra/devtool-growth-playbook'
        },
        {
          title: 'SaaS Customer Funnel & Retention Analysis',
          description: 'Interactive analytics dashboard analyzing user churn sensitivity and trial conversion.',
          bullet_points: [
            'Analyzed 80,000 synthetic SaaS user session events to uncover friction points in trial-to-paid conversion funnels.',
            'Built interactive Tableau dashboard modeling churn sensitivity and lifetime value (LTV) across customer acquisition channels.'
          ],
          technologies: ['SQL', 'Tableau', 'Python', 'Statistical Modeling'],
          link: 'https://github.com/amaymishra/saas-funnel-analytics'
        }
      ],
      certifications: [
        {
          name: 'Google Project Management Professional Certificate',
          issuer: 'Google',
          issue_date: 'February 2025'
        }
      ],
      achievements: [
        'President, Collegiate Tech & Entrepreneurship Society (2024 – 2025)',
        'Winner, Regional Intercollegiate Business Case Competition (24 competing universities)',
        'Invited Speaker, Student Entrepreneurship Summit 2025'
      ]
    },
    is_immutable_original: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEMO_JOB_LISTINGS: JobListing[] = [
  {
    id: 'job-stripe-swe-01',
    title: 'Software Engineer Intern - Systems & Infrastructure',
    company: 'Stripe',
    description: 'Join Stripes infrastructure engineering team building foundational platforms that move billions of dollars every day. As an intern, you will design, build, and deploy high-reliability services using TypeScript, Go, and distributed data systems. Requirements: B.S. or M.S. in Computer Science (graduating 2026/2027), strong knowledge of data structures, algorithms, and systems engineering.',
    location: 'San Francisco, CA / Remote (US)',
    employment_type: 'Internship',
    experience_level: 'Internship',
    required_skills: ['TypeScript', 'Go', 'Distributed Systems', 'PostgreSQL', 'Git', 'REST APIs'],
    preferred_skills: ['Redis', 'Docker', 'Kubernetes'],
    salary_range: '$58 - $65 / hr ($9,500 - $10,500 / mo)',
    job_url: 'https://stripe.com/jobs/listing/software-engineer-intern-2026',
    publication_date: '2026-04-15',
    application_deadline: '2026-06-30',
    data_source: 'Stripe Official Careers Portal',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    is_expired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-vercel-fullstack-02',
    title: 'Junior Full Stack Developer - Developer Experience',
    company: 'Vercel',
    description: 'Vercel is looking for an enthusiastic Junior Full Stack Developer to help build the next generation of web developer tooling. You will collaborate on Next.js framework features, frontend component libraries, and serverless runtime integrations. Requirements: Deep understanding of React, Next.js, TypeScript, and modern CSS. Passion for open source and clean developer interfaces.',
    location: 'Remote (Global)',
    employment_type: 'Full-time',
    experience_level: 'Fresher / Entry Level (0-1 yrs)',
    required_skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git'],
    preferred_skills: ['Serverless', 'Vercel Platform', 'Vitest'],
    salary_range: '$95,000 - $125,000 / yr',
    job_url: 'https://vercel.com/careers/junior-fullstack-developer',
    publication_date: '2026-04-18',
    application_deadline: '2026-05-31',
    data_source: 'Vercel Greenhouse Board',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    is_expired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-hf-aiml-03',
    title: 'Machine Learning Engineering Intern - Open Models & Inference',
    company: 'Hugging Face',
    description: 'Hugging Face is hiring an ML Intern to work directly with our Open Science team on model evaluation, RAG benchmarks, and lightweight inference runtimes. Requirements: Solid Python programming, experience with PyTorch and Transformers library, understanding of parameter-efficient fine-tuning (LoRA), and active curiosity for open-weight AI.',
    location: 'Remote (US / Europe)',
    employment_type: 'Internship',
    experience_level: 'Internship',
    required_skills: ['Python', 'PyTorch', 'Hugging Face Transformers', 'RAG', 'FastAPI'],
    preferred_skills: ['vLLM', 'CUDA', 'Docker'],
    salary_range: '$50 - $60 / hr',
    job_url: 'https://huggingface.co/jobs/ml-engineering-intern',
    publication_date: '2026-04-19',
    application_deadline: '2026-06-15',
    data_source: 'Hugging Face Lever Feed',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    is_expired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-figma-apm-04',
    title: 'Associate Product Manager Intern - Collaboration Tools',
    company: 'Figma',
    description: 'Join Figma as an APM Intern to help define and build features that power collaborative design for millions of makers worldwide. You will partner with engineers, designers, and researchers to discover user pain points, write PRDs, and analyze usage data. Requirements: Enrolled in undergrad program (graduating 2026), demonstrated product sense, technical background in CS or equivalent.',
    location: 'San Francisco, CA (Hybrid)',
    employment_type: 'Internship',
    experience_level: 'Internship',
    required_skills: ['Product Strategy', 'User Research', 'PRD Authoring', 'SQL', 'Wireframing (Figma)'],
    preferred_skills: ['PostHog', 'A/B Testing'],
    salary_range: '$55 - $62 / hr',
    job_url: 'https://figma.com/careers/associate-product-manager-intern',
    publication_date: '2026-04-14',
    application_deadline: '2026-05-25',
    data_source: 'Figma Careers Board',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    is_expired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-scaleai-aieng-05',
    title: 'AI Engineer (New Grad) - Generative AI Solutions',
    company: 'Scale AI',
    description: 'Scale AI powers enterprise generative AI deployments. As a New Grad AI Engineer, you will build agent evaluation harnesses, prompt pipelines, and multi-modal model fine-tuning frameworks. Requirements: Strong CS fundamentals, Python proficiency, experience building with PyTorch, LangChain, or vector search engines.',
    location: 'San Francisco, CA / New York, NY',
    employment_type: 'Full-time',
    experience_level: 'Fresher / Entry Level (0-1 yrs)',
    required_skills: ['Python', 'PyTorch', 'LangChain', 'Docker', 'REST APIs'],
    preferred_skills: ['Vector Databases', 'Weights & Biases'],
    salary_range: '$140,000 - $175,000 / yr + Equity',
    job_url: 'https://scale.com/careers/ai-engineer-new-grad',
    publication_date: '2026-04-20',
    application_deadline: '2026-06-01',
    data_source: 'Scale AI Ashby Board',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    is_expired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-cloudflare-backend-06',
    title: 'Systems & Backend Engineer Intern',
    company: 'Cloudflare',
    description: 'Help build a better internet at Cloudflare! You will work alongside our Edge Infrastructure team developing high-performance edge proxy services and distributed storage. Requirements: Working knowledge of systems programming (Go, Rust, or C++), operating systems principles, and networking protocols (TCP/UDP, HTTP/3).',
    location: 'Austin, TX / San Francisco, CA / Remote',
    employment_type: 'Internship',
    experience_level: 'Internship',
    required_skills: ['Go', 'TypeScript', 'Distributed Systems', 'Git', 'Docker'],
    preferred_skills: ['Rust', 'Linux Internals'],
    salary_range: '$52 - $60 / hr',
    job_url: 'https://cloudflare.com/careers/jobs/intern-systems-backend',
    publication_date: '2026-04-12',
    application_deadline: '2026-06-15',
    data_source: 'Cloudflare Greenhouse Feed',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    is_expired: false,
    created_at: new Date().toISOString()
  }
];

export const DEMO_RECRUITER_CONTACTS: RecruiterContact[] = [
  {
    id: 'recruiter-stripe-01',
    job_id: 'job-stripe-swe-01',
    company: 'Stripe',
    name: 'Sarah Chen',
    title: 'University & Early Career Recruiting Lead',
    email: 'unavailable',
    email_verification_status: 'unavailable',
    public_profile_url: 'https://www.linkedin.com/in/sarah-chen-recruiting-stripe',
    source_provider: 'apollo',
    is_company_verified: true,
    verification_notes: 'Verified via Apollo Organization match for stripe.com. Official contact path: university-recruiting@stripe.com.',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'live',
    created_at: new Date().toISOString()
  },
  {
    id: 'recruiter-vercel-02',
    job_id: 'job-vercel-fullstack-02',
    company: 'Vercel',
    name: 'Marcus Brody',
    title: 'Senior Technical Talent Partner - Frontend & DX',
    email: 'unavailable',
    email_verification_status: 'unavailable',
    public_profile_url: 'https://www.linkedin.com/in/marcus-brody-talent',
    source_provider: 'apollo',
    is_company_verified: true,
    verification_notes: 'Verified via Apollo Organization match for vercel.com. Official careers portal: vercel.com/careers.',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'live',
    created_at: new Date().toISOString()
  },
  {
    id: 'recruiter-hf-03',
    job_id: 'job-hf-aiml-03',
    company: 'Hugging Face',
    name: 'Elise Laurent',
    title: 'People & Science Operations Lead',
    email: 'unavailable',
    email_verification_status: 'unavailable',
    public_profile_url: 'https://www.linkedin.com/in/elise-laurent-hf',
    source_provider: 'public_careers_page',
    is_company_verified: true,
    verification_notes: 'Verified via Hugging Face Open Science team page. Official inbox: jobs@huggingface.co.',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'real_public_web',
    created_at: new Date().toISOString()
  },
  {
    id: 'recruiter-figma-04',
    job_id: 'job-figma-apm-04',
    company: 'Figma',
    name: 'David Ortiz',
    title: 'University Recruiting Program Manager',
    email: 'unavailable',
    email_verification_status: 'unavailable',
    public_profile_url: 'https://www.linkedin.com/in/david-ortiz-figma-recruiting',
    source_provider: 'apollo',
    is_company_verified: true,
    verification_notes: 'Verified via Apollo Directory. Application routing handled through Figma official APM cohort.',
    retrieval_timestamp: new Date().toISOString(),
    provenance: 'live',
    created_at: new Date().toISOString()
  }
];

export const DEMO_JOB_MATCHES: Record<string, JobMatchResult> = {
  'job-stripe-swe-01': {
    id: 'match-stripe-01',
    job_id: 'job-stripe-swe-01',
    user_id: 'user-amay-01',
    recommended_resume_id: 'resume-tech-01',
    recommended_profile_type: 'technical',
    match_score: 94,
    matching_skills: ['TypeScript', 'Go', 'Distributed Systems', 'PostgreSQL', 'Git', 'REST APIs', 'Redis', 'Docker'],
    missing_skills: ['Kubernetes'],
    score_reasons: [
      'Strong skill alignment: Matches 8 of 9 required and preferred technologies (89% skill score).',
      'Relevant project experience: Built a high-throughput Distributed Task Queue with Redis and TypeScript.',
      'Previous internship experience: CloudScale Systems internship demonstrated async pipelines and PostgreSQL query optimization.',
      'Education match: Senior in Computer Science with 3.88 GPA meeting Stripe 2026 graduation requirements.'
    ],
    project_overlap_score: 95,
    experience_compatibility: 'High (Software Engineering Intern at CloudScale Systems matches intern tier)',
    location_compatibility: 'High (Remote / San Francisco matches target preferences)',
    selection_rationale: 'Automatically recommended Technical Resume because the opening prioritizes systems architecture, TypeScript, distributed queues, and PostgreSQL, which constitute 94% of your technical portfolio.',
    created_at: new Date().toISOString()
  },
  'job-vercel-fullstack-02': {
    id: 'match-vercel-02',
    job_id: 'job-vercel-fullstack-02',
    user_id: 'user-amay-01',
    recommended_resume_id: 'resume-tech-01',
    recommended_profile_type: 'technical',
    match_score: 96,
    matching_skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git', 'Vitest'],
    missing_skills: ['Serverless runtime deep internals'],
    score_reasons: [
      'Exceptional framework match: Extensively demonstrated Next.js 15, React 19, TypeScript, and Tailwind CSS.',
      'Project relevance: Built Real-Time Collaborative Code Playground and enterprise workflow apps in Next.js.',
      'Testing rigor: 45+ Vitest suites written at CloudScale Systems internship directly aligns with DX team quality bar.'
    ],
    project_overlap_score: 98,
    experience_compatibility: 'High (Fresher / Entry level is a direct match for 2026 graduate)',
    location_compatibility: 'High (Remote Global aligns with any preference)',
    selection_rationale: 'Recommended Technical Resume due to heavy Next.js and frontend systems focus matching 96% of requirements.',
    created_at: new Date().toISOString()
  },
  'job-hf-aiml-03': {
    id: 'match-hf-03',
    job_id: 'job-hf-aiml-03',
    user_id: 'user-amay-01',
    recommended_resume_id: 'resume-aiml-02',
    recommended_profile_type: 'ai_ml',
    match_score: 92,
    matching_skills: ['Python', 'PyTorch', 'Hugging Face Transformers', 'RAG', 'FastAPI', 'Docker'],
    missing_skills: ['CUDA custom kernel authoring'],
    score_reasons: [
      'Direct ML framework match: Hands-on experience with PyTorch, Hugging Face Transformers, and PEFT / QLoRA fine-tuning.',
      'Applied RAG project: Built production RAG pipeline with semantic chunking and hallucination detection.',
      'Research experience: Active AI Research Assistant at Cognitive Intelligence Lab optimizing vLLM inference speedup.'
    ],
    project_overlap_score: 94,
    experience_compatibility: 'High (AI Research Assistant experience matches ML intern qualifications)',
    location_compatibility: 'High (Remote US matches user preferences)',
    selection_rationale: 'Automatically selected AI/ML Resume because the opening requires PyTorch, Hugging Face Transformers, and RAG evaluation, which is the exact specialty of this profile.',
    created_at: new Date().toISOString()
  },
  'job-figma-apm-04': {
    id: 'match-figma-04',
    job_id: 'job-figma-apm-04',
    user_id: 'user-amay-01',
    recommended_resume_id: 'resume-business-03',
    recommended_profile_type: 'business_gtm',
    match_score: 88,
    matching_skills: ['Product Strategy', 'User Research', 'PRD Authoring', 'SQL', 'Wireframing (Figma)'],
    missing_skills: ['A/B Testing multi-armed bandit statistics'],
    score_reasons: [
      'Strong product skillset: Authored PRDs, conducted 30 user interviews at LaunchPad Ventures.',
      'Technical CS foundation provides the rare technical depth sought by Figma APM program.',
      'Demonstrated student leadership: Led 1,500-member developer community with $18K sponsor backing.'
    ],
    project_overlap_score: 86,
    experience_compatibility: 'High (Product Operations Intern experience fits APM cohort)',
    location_compatibility: 'High (San Francisco Bay Area is local)',
    selection_rationale: 'Automatically selected Business/GTM Resume because Figma APM is a cross-functional product leadership role requiring PRDs, user interviews, and strategic metrics.',
    created_at: new Date().toISOString()
  }
};

export const DEMO_APPLICATIONS: JobApplicationRecord[] = [
  {
    id: 'app-stripe-01',
    user_id: 'user-amay-01',
    job_id: 'job-stripe-swe-01',
    company: 'Stripe',
    role: 'Software Engineer Intern - Systems & Infrastructure',
    job_url: 'https://stripe.com/jobs/listing/software-engineer-intern-2026',
    contact_id: 'recruiter-stripe-01',
    contact_name: 'Sarah Chen',
    contact_email: 'sarah.chen@stripe.com (Routing: Test Inbox)',
    status: 'Draft Created',
    tailored_resume_id: 'tailored-stripe-01',
    email_draft_id: 'draft-stripe-01',
    match_score: 94,
    date_discovered: '2026-04-16T10:00:00Z',
    follow_up_reminder_date: '2026-05-02T10:00:00Z',
    notes: 'Tailored resume emphasizing Redis task queue project and PostgreSQL query optimization. Gmail draft created in operator inbox for review.',
    created_at: '2026-04-16T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'app-vercel-02',
    user_id: 'user-amay-01',
    job_id: 'job-vercel-fullstack-02',
    company: 'Vercel',
    role: 'Junior Full Stack Developer - Developer Experience',
    job_url: 'https://vercel.com/careers/junior-fullstack-developer',
    contact_id: 'recruiter-vercel-02',
    contact_name: 'Marcus Brody',
    contact_email: 'marcus.brody@vercel.com (Routing: Test Inbox)',
    status: 'Resume Tailored',
    tailored_resume_id: 'tailored-vercel-02',
    match_score: 96,
    date_discovered: '2026-04-18T14:30:00Z',
    notes: 'Resume tailored highlighting Next.js 15, collaborative Monaco playground, and 45 Vitest suites.',
    created_at: '2026-04-18T14:30:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'app-hf-03',
    user_id: 'user-amay-01',
    job_id: 'job-hf-aiml-03',
    company: 'Hugging Face',
    role: 'Machine Learning Engineering Intern',
    job_url: 'https://huggingface.co/jobs/ml-engineering-intern',
    contact_id: 'recruiter-hf-03',
    contact_name: 'Elise Laurent',
    contact_email: 'jobs@huggingface.co',
    status: 'Matched',
    match_score: 92,
    date_discovered: '2026-04-19T09:15:00Z',
    notes: 'AI/ML Resume auto-selected. 92% match score. Ready to tailor resume and generate outreach email.',
    created_at: '2026-04-19T09:15:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'app-figma-04',
    user_id: 'user-amay-01',
    job_id: 'job-figma-apm-04',
    company: 'Figma',
    role: 'Associate Product Manager Intern',
    job_url: 'https://figma.com/careers/associate-product-manager-intern',
    contact_id: 'recruiter-figma-04',
    contact_name: 'David Ortiz',
    status: 'Discovered',
    match_score: 88,
    date_discovered: '2026-04-20T11:00:00Z',
    notes: 'Discovered from Figma official board. Fits Business/GTM profile.',
    created_at: '2026-04-20T11:00:00Z',
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_DAILY_AUTOMATION_CONFIG: DailyAutomationConfig = {
  id: 'auto-config-01',
  user_id: 'user-amay-01',
  is_enabled: true,
  frequency: 'daily',
  max_jobs_per_run: 10,
  auto_tailor_resumes: true,
  auto_generate_drafts: true,
  last_run_timestamp: new Date().toISOString(),
  last_run_status: 'SUCCESS',
  last_run_summary: 'Discovered 6 new tech openings, matched 4 above 85% threshold, prepared 2 tailored resumes and 1 outreach draft awaiting approval.'
};

