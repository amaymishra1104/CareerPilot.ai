import { 
  ICPConfig, 
  Company, 
  Contact, 
  EnrichmentRecord, 
  EvidenceSource, 
  IntegrationSettings 
} from '@/types';

export const INITIAL_ICP: ICPConfig = {
  id: 'icp-qsr-v1',
  name: 'US QSR & Fast-Casual Journey ICP',
  geography: ['United States'],
  industries: ['Quick-service restaurants', 'Fast-casual restaurant groups'],
  companySizeMinLocations: 20,
  companySizeMaxLocations: 200,
  restaurantCategories: ['burgers', 'pizza', 'chicken', 'sandwiches', 'fast-casual'],
  targetRoles: [
    'COO',
    'VP of Operations',
    'Head of Guest Experience',
    'VP of Customer Experience',
    'Head of Contact Center'
  ],
  buyingSignals: [
    'restaurant expansion',
    'franchise growth',
    'hiring for operations/customer support',
    'documented investments in automation'
  ],
  notes: 'Targeting operators experiencing voice bot escalation fatigue, drive-thru overflow, and multi-unit digital ordering complexity.',
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
  n8n_webhook_secret: process.env.N8N_WEBHOOK_SECRET || 'osvi_secret_token_123',
  demo_mode_active: true,
  updated_at: new Date().toISOString()
};

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'comp-firehouse-01',
    name: 'Mid-South Subs Franchise Group (Firehouse)',
    website: 'https://midsouthsubs.demo',
    industry: 'Quick-service restaurants',
    headquarters: 'Charlotte, NC',
    estimated_locations: 48,
    company_size: '48 locations across NC, SC, GA',
    restaurant_category: 'sandwiches',
    buying_signals: [
      'restaurant expansion',
      'franchise growth',
      'hiring for operations/customer support'
    ],
    source_urls: [
      'https://qsr-magazine.demo/news/mid-south-subs-expansion',
      'https://restaurantnews.demo/franchise-growth-carolinas'
    ],
    retrieval_timestamp: '2024-10-15T14:20:00Z',
    provenance: 'demo',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-torchys-02',
    name: 'Lone Star Hospitality Group (Torchy\'s Operator)',
    website: 'https://lonestartacos.demo',
    industry: 'Fast-casual restaurant groups',
    headquarters: 'Austin, TX',
    estimated_locations: 115,
    company_size: '115 locations across TX, CO, OK',
    restaurant_category: 'fast-casual',
    buying_signals: [
      'documented investments in automation',
      'hiring for operations/customer support'
    ],
    source_urls: [
      'https://restaurantdive.demo/news/lone-star-digital-guest-experience',
      'https://austinbiz.demo/hospitality-tech-investment'
    ],
    retrieval_timestamp: '2024-10-16T09:15:00Z',
    provenance: 'demo',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-smash-03',
    name: 'Front Range Burgers LLC (Smashburger)',
    website: 'https://frontrangeburgers.demo',
    industry: 'Quick-service restaurants',
    headquarters: 'Denver, CO',
    estimated_locations: 62,
    company_size: '62 locations across Mountain West',
    restaurant_category: 'burgers',
    buying_signals: [
      'restaurant expansion',
      'documented investments in automation'
    ],
    source_urls: [
      'https://coloradorestaurants.demo/front-range-tech-pilot',
      'https://franchisetimes.demo/multi-unit-operator-report'
    ],
    retrieval_timestamp: '2024-10-17T11:45:00Z',
    provenance: 'demo',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-bojangles-04',
    name: 'Crestline Poultry Holdings (Bojangles)',
    website: 'https://crestlinepoultry.demo',
    industry: 'Quick-service restaurants',
    headquarters: 'Atlanta, GA',
    estimated_locations: 78,
    company_size: '78 units in Southeast',
    restaurant_category: 'chicken',
    buying_signals: [
      'franchise growth',
      'hiring for operations/customer support'
    ],
    source_urls: [
      'https://southeastdining.demo/crestline-78-locations',
      'https://qsrleader.demo/voice-ai-frontline-efficiency'
    ],
    retrieval_timestamp: '2024-10-18T16:30:00Z',
    provenance: 'demo',
    created_at: new Date().toISOString()
  },
  {
    id: 'comp-jets-05',
    name: 'Great Lakes Crust Partners (Jet\'s Pizza)',
    website: 'https://greatlakescrust.demo',
    industry: 'Quick-service restaurants',
    headquarters: 'Detroit, MI',
    estimated_locations: 92,
    company_size: '92 locations across Midwest',
    restaurant_category: 'pizza',
    buying_signals: [
      'documented investments in automation',
      'restaurant expansion'
    ],
    source_urls: [
      'https://pizzamarketplace.demo/great-lakes-contact-center',
      'https://detroitbusiness.demo/pizza-franchise-scale'
    ],
    retrieval_timestamp: '2024-10-19T13:00:00Z',
    provenance: 'demo',
    created_at: new Date().toISOString()
  }
];

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'lead-marcus-01',
    company_id: 'comp-firehouse-01',
    company_name: 'Mid-South Subs Franchise Group (Firehouse)',
    full_name: 'Marcus Vance',
    job_title: 'VP of Operations',
    professional_profile_url: 'https://linkedin.demo/in/marcus-vance-ops',
    work_email: 'mvance@midsouthsubs.demo',
    email_verification_status: 'verified',
    source_url: 'https://midsouthsubs.demo/leadership',
    retrieval_timestamp: '2024-10-15T15:00:00Z',
    provenance: 'demo',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-sarah-02',
    company_id: 'comp-torchys-02',
    company_name: 'Lone Star Hospitality Group (Torchy\'s Operator)',
    full_name: 'Sarah Jenkins',
    job_title: 'Head of Guest Experience',
    professional_profile_url: 'https://linkedin.demo/in/sarah-jenkins-gx',
    work_email: 'sjenkins@lonestartacos.demo',
    email_verification_status: 'verified',
    source_url: 'https://lonestartacos.demo/team',
    retrieval_timestamp: '2024-10-16T10:00:00Z',
    provenance: 'demo',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-david-03',
    company_id: 'comp-smash-03',
    company_name: 'Front Range Burgers LLC (Smashburger)',
    full_name: 'David Rodriguez',
    job_title: 'Chief Operating Officer',
    professional_profile_url: 'https://linkedin.demo/in/david-rodriguez-coo',
    work_email: 'drodriguez@frontrangeburgers.demo',
    email_verification_status: 'verified',
    source_url: 'https://frontrangeburgers.demo/executive-team',
    retrieval_timestamp: '2024-10-17T12:15:00Z',
    provenance: 'demo',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-elena-04',
    company_id: 'comp-bojangles-04',
    company_name: 'Crestline Poultry Holdings (Bojangles)',
    full_name: 'Elena Rostova',
    job_title: 'VP of Customer Experience',
    professional_profile_url: 'https://linkedin.demo/in/elena-rostova-cx',
    work_email: 'erostova@crestlinepoultry.demo',
    email_verification_status: 'unverified',
    source_url: 'https://crestlinepoultry.demo/about',
    retrieval_timestamp: '2024-10-18T17:00:00Z',
    provenance: 'demo',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  },
  {
    id: 'lead-thomas-05',
    company_id: 'comp-jets-05',
    company_name: 'Great Lakes Crust Partners (Jet\'s Pizza)',
    full_name: 'Thomas Miller',
    job_title: 'Head of Contact Center & Support Operations',
    professional_profile_url: 'https://linkedin.demo/in/thomas-miller-contact-center',
    work_email: 'tmiller@greatlakescrust.demo',
    email_verification_status: 'verified',
    source_url: 'https://greatlakescrust.demo/support-leadership',
    retrieval_timestamp: '2024-10-19T13:30:00Z',
    provenance: 'demo',
    approval_status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

export const DEMO_ENRICHMENTS: Record<string, EnrichmentRecord> = {
  'lead-marcus-01': {
    id: 'enrich-marcus-01',
    lead_id: 'lead-marcus-01',
    company_id: 'comp-firehouse-01',
    company_overview: 'Mid-South Subs Franchise Group operates 48 Firehouse Subs locations across North Carolina, South Carolina, and Georgia with rapid drive-thru rollout.',
    location_count_verifiable: 48,
    location_count_evidence: 'Verified via Franchise Times October 2024 Multi-Unit Franchisee Directory entry #184.',
    operational_challenges: [
      {
        description: 'Peak catering call volume collisions with in-store lunch counter rush, leading to dropped phone orders.',
        is_hypothesis: false,
        evidence: 'Reported in Southeast Dining operator profile interview, Aug 2024.'
      },
      {
        description: 'Single-purpose AI voice bots failing on complex order modifications and allergen substitutions.',
        is_hypothesis: true,
        evidence: 'Industry hypothesis based on standard conversational bot accuracy limits for QSR sandwich customization.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Active job openings for Multi-Unit Operations Technology Coordinator',
        source_url: 'https://midsouthsubs.demo/careers/ops-tech',
        snippet: 'Seeking tech coordinator to streamline POS and customer order automation across 48 units.'
      },
      {
        signal: 'Opened 6 new drive-thru locations in Charlotte and Greenville over past 9 months',
        source_url: 'https://qsr-magazine.demo/news/mid-south-subs-expansion',
        snippet: 'Mid-South franchise network marks 48th store opening with focus on multi-channel throughput.'
      }
    ],
    personalization_hook: 'Noticed Mid-South Subs expanded to 48 locations across the Carolinas and is hiring an Operations Tech Coordinator to manage store ordering throughput.',
    personalization_evidence_claim: '48 units expansion reported in QSR Magazine and active job posting for Ops Tech Coordinator.',
    confidence_score: 94,
    confidence_explanation: 'Direct verification of location count from multi-unit franchise registry and confirmed leadership profile matching public job board announcement.',
    last_verified_timestamp: '2024-10-15T15:30:00Z',
    evidence_sources: [
      {
        id: 'ev-01',
        lead_id: 'lead-marcus-01',
        claim: 'Mid-South Subs operates 48 Firehouse Subs locations across NC, SC, and GA',
        snippet: 'Store count confirmed at 48 active restaurants with 6 opened in 2024.',
        source_url: 'https://qsr-magazine.demo/news/mid-south-subs-expansion',
        is_hypothesis: false,
        retrieved_at: '2024-10-15T15:20:00Z'
      },
      {
        id: 'ev-02',
        lead_id: 'lead-marcus-01',
        claim: 'Hiring Operations Technology Coordinator to streamline POS & store order automation',
        snippet: 'Job listing active on regional portal targeting multi-unit order orchestration.',
        source_url: 'https://midsouthsubs.demo/careers/ops-tech',
        is_hypothesis: false,
        retrieved_at: '2024-10-15T15:22:00Z'
      }
    ],
    created_at: new Date().toISOString()
  },
  'lead-sarah-02': {
    id: 'enrich-sarah-02',
    lead_id: 'lead-sarah-02',
    company_id: 'comp-torchys-02',
    company_overview: 'Lone Star Hospitality Group operates 115 fast-casual taco locations across Texas, Colorado, and Oklahoma with heavy digital curbside and loyalty traffic.',
    location_count_verifiable: 115,
    location_count_evidence: 'Documented in Q3 2024 Fast-Casual Top 100 Index.',
    operational_challenges: [
      {
        description: 'Curbside arrival notification desynchronization between mobile app and kitchen display screens.',
        is_hypothesis: false,
        evidence: 'Quoted in Restaurant Dive digital customer experience feature, Sept 2024.'
      },
      {
        description: 'Guest service escalations getting stuck in siloed SMS chatbots without operational handoff to store teams.',
        is_hypothesis: true,
        evidence: 'Hypothesis derived from observed friction in multi-agent handoff for loyalty point disputes.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Public announcement of $2.5M digital hospitality infrastructure modernization',
        source_url: 'https://austinbiz.demo/hospitality-tech-investment',
        snippet: 'Lone Star Group allocates capital to modernize digital guest experience across 115 restaurants.'
      }
    ],
    personalization_hook: 'Saw your feature in Restaurant Dive regarding curbside arrival orchestration across Lone Star\'s 115 locations and the transition toward unified guest experience workflows.',
    personalization_evidence_claim: '115 locations documented in Fast-Casual Top 100 and direct quote on curbside desync in Restaurant Dive.',
    confidence_score: 91,
    confidence_explanation: 'Strong public verification from business press and verified executive roster on company domain.',
    last_verified_timestamp: '2024-10-16T10:45:00Z',
    evidence_sources: [
      {
        id: 'ev-03',
        lead_id: 'lead-sarah-02',
        claim: 'Lone Star operates 115 locations across TX, CO, and OK',
        snippet: 'Fast-Casual 100 report confirms 115 operating restaurants.',
        source_url: 'https://restaurantdive.demo/news/lone-star-digital-guest-experience',
        is_hypothesis: false,
        retrieved_at: '2024-10-16T10:30:00Z'
      }
    ],
    created_at: new Date().toISOString()
  },
  'lead-david-03': {
    id: 'enrich-david-03',
    lead_id: 'lead-david-03',
    company_id: 'comp-smash-03',
    company_overview: 'Front Range Burgers LLC owns and operates 62 Smashburger locations in Colorado, Utah, and Idaho, focusing on drive-thru speed and kitchen automation.',
    location_count_verifiable: 62,
    location_count_evidence: 'Colorado Restaurant Association membership records 2024.',
    operational_challenges: [
      {
        description: 'Single-agent voice bots at drive-thru ordering fail on combo customizations and store-specific stockouts.',
        is_hypothesis: false,
        evidence: 'Disclosed in Franchise Times operator round-table, July 2024.'
      },
      {
        description: 'Disjointed coordination between drive-thru queue sensors, voice assistants, and line cooks.',
        is_hypothesis: true,
        evidence: 'Operational hypothesis based on typical drive-thru tech stack fragmentation.'
      }
    ],
    verified_buying_signals: [
      {
        signal: 'Piloting voice ordering technology across 12 high-volume Denver locations',
        source_url: 'https://coloradorestaurants.demo/front-range-tech-pilot',
        snippet: 'COO David Rodriguez notes test of automated ordering with objective of boosting throughput.'
      }
    ],
    personalization_hook: 'Read about your 12-store voice ordering pilot in Denver and the focus on reducing drive-thru bottlenecks across Front Range\'s 62 Smashburger locations.',
    personalization_evidence_claim: 'Voice AI pilot reported in Colorado Restaurants and 62 store count in CRA database.',
    confidence_score: 96,
    confidence_explanation: 'Executive quote explicitly details automated ordering pilot and store counts verified with state restaurant association.',
    last_verified_timestamp: '2024-10-17T13:00:00Z',
    evidence_sources: [
      {
        id: 'ev-04',
        lead_id: 'lead-david-03',
        claim: 'Piloting voice ordering in 12 Denver units across 62-store network',
        snippet: 'Front Range Burgers is testing voice ordering to improve speed-of-service.',
        source_url: 'https://coloradorestaurants.demo/front-range-tech-pilot',
        is_hypothesis: false,
        retrieved_at: '2024-10-17T12:50:00Z'
      }
    ],
    created_at: new Date().toISOString()
  }
};
