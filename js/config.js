/* =====================================================================
   NEU GOID — CONFIGURATION
   ---------------------------------------------------------------------
   Edit this file to change branding, navigation, sectors, countries,
   categories, the official scoring weights, thresholds, verification
   labels, decision statuses and database fields.
   Anything changed in the in-app Settings panel is saved in the browser
   and layered on top of these defaults ("Restore defaults" returns here).
   ===================================================================== */
window.GOID = window.GOID || {};

GOID.config = {
  app: {
    shortName: 'NEU GOID',
    logo: 'assets/goid-mark.svg',   // replace with any image file (SVG/PNG) to change the sidebar logo
    institution: 'New Era University',
    title: 'Global Opportunity Intelligence Dashboard',
    subtitle: 'International Market and Opportunity Intelligence Dashboard',
    classification: 'International Business Intelligence and Strategic Decision-Support System',
    banner: 'NEW ERA UNIVERSITY GLOBAL OPPORTUNITY INTELLIGENCE DASHBOARD — WORKING PROTOTYPE / FOR DEVELOPMENT AND EVALUATION',
    demoUser: { name: 'Demo Reviewer', role: 'RIO (proposed) · demonstration account', initials: 'DR' }
  },

  storageKey: 'neu-goid-prototype-v1',

  /* Sidebar navigation — reorder, rename or remove items here.
     Each id must match a file in js/views/ that registers GOID.views[id]. */
  nav: [
    { id: 'overview',       label: 'Executive Overview',            icon: 'grid',     stage: '' },
    { id: 'explorer',       label: 'Opportunity Explorer',          icon: 'compass',  stage: 'Discover' },
    { id: 'database',       label: 'Opportunity Database',          icon: 'database', stage: 'Centralize' },
    { id: 'evaluation',     label: 'Evaluation Center',             icon: 'sliders',  stage: 'Evaluate' },
    { id: 'compare',        label: 'Compare Opportunities',         icon: 'columns',  stage: 'Compare' },
    { id: 'decisions',      label: 'Strategic Decisions',           icon: 'flag',     stage: 'Decide' },
    { id: 'analytics',      label: 'Analytics and Insights',        icon: 'chart',    stage: 'Prioritize' },
    { id: 'methodology',    label: 'Data Sources and Methodology',  icon: 'book',     stage: '' },
    { id: 'implementation', label: 'Implementation Plan',           icon: 'calendar', stage: '' }
  ],

  workflow: [
    { stage: 'Discover',   view: 'explorer',   text: 'Find opportunities across 4 sectors and 5 markets' },
    { stage: 'Centralize', view: 'database',   text: 'Keep every record in one searchable database' },
    { stage: 'Evaluate',   view: 'evaluation', text: 'Score each record on the 100-point method' },
    { stage: 'Compare',    view: 'compare',    text: 'Line up options side by side' },
    { stage: 'Prioritize', view: 'analytics',  text: 'Rank by score, benefit, feasibility and urgency' },
    { stage: 'Decide',     view: 'decisions',  text: 'Pursue, monitor, investigate or reject' }
  ],

  /* The four official sectors (do not add primary sectors). */
  sectors: [
    { id: 'academic',  label: 'Academic Internationalization',          short: 'Academic',          color: 'var(--c1)',
      covers: ['Student exchange', 'Scholarships', 'Academic mobility', 'International educational programs'] },
    { id: 'research',  label: 'Research Internationalization',          short: 'Research',          color: 'var(--c3)',
      covers: ['International grants', 'Research funding', 'Collaborative research', 'Foreign research partnerships'] },
    { id: 'business',  label: 'Business/Industry Internationalization', short: 'Business/Industry', color: 'var(--c4)',
      covers: ['International business partnerships', 'Global trade opportunities', 'Industry collaborations', 'Foreign market connections'] },
    { id: 'community', label: 'Community/MSME Internationalization',    short: 'Community/MSME',    color: 'var(--c2)',
      covers: ['Export opportunities', 'International trade fairs', 'Export assistance', 'Global market expansion'] }
  ],

  /* Initial geographic scope: five Asian markets. lat/lon place them on the schematic map. */
  countries: [
    { id: 'JP', name: 'Japan',       region: 'East Asia',      lat: 36.2, lon: 138.3 },
    { id: 'KR', name: 'South Korea', region: 'East Asia',      lat: 36.5, lon: 127.9 },
    { id: 'SG', name: 'Singapore',   region: 'Southeast Asia', lat: 1.35, lon: 103.8 },
    { id: 'MY', name: 'Malaysia',    region: 'Southeast Asia', lat: 4.2,  lon: 101.9 },
    { id: 'TH', name: 'Thailand',    region: 'Southeast Asia', lat: 15.5, lon: 101.0 }
  ],
  futureMarkets: ['China', 'Taiwan', 'Vietnam', 'Indonesia', 'Australia', 'United Arab Emirates'],

  stakeholders: ['Students', 'Faculty & Researchers', 'MSMEs & Student Entrepreneurs'],

  /* Categories offered in the form. Users may also type a new category. */
  categories: [
    'Student Exchange', 'Scholarship', 'Internship', 'Short Course / Training', 'Academic Competition',
    'Research Grant', 'Research Collaboration', 'Research Exchange', 'Conference', 'Academic Partnership',
    'Industry Partnership', 'Business Collaboration', 'Foreign Market Connection',
    'Export Market', 'Trade Fair', 'Export Assistance'
  ],

  products: [
    { id: '',       label: 'None' },
    { id: 'abaca',  label: 'Philippine abaca fiber' },
    { id: 'coffee', label: 'Philippine local coffee' }
  ],

  /* ---------------- OFFICIAL 100-POINT EVALUATION ----------------
     Weighted score = (rating / 5) x weight. Overall = sum (out of 100).
     Risk and Estimated Difficulty are inverse: 5 = low risk / easier. */
  criteria: [
    { id: 'benefit',     label: 'Potential Benefit',    short: 'Benefit',    weight: 30, inverse: false,
      question: 'How much value could this bring to the stakeholder?',
      levels: ['Minimal value', 'Limited value', 'Moderate value', 'Strong value', 'Exceptional value'] },
    { id: 'feasibility', label: 'Feasibility',          short: 'Feasib.', weight: 25, inverse: false,
      question: 'Can the stakeholder realistically meet the requirements with current resources?',
      levels: ['Not feasible now', 'Hard to meet', 'Possible with effort', 'Readily achievable', 'Fully achievable'] },
    { id: 'relevance',   label: 'Strategic Relevance',  short: 'Relev.',  weight: 20, inverse: false,
      question: 'How closely does it fit NEU and stakeholder priorities?',
      levels: ['Off-strategy', 'Weak fit', 'Partial fit', 'Good fit', 'Core priority'] },
    { id: 'risk',        label: 'Risk',                 short: 'Risk', weight: 15, inverse: true,
      question: 'How manageable are the financial, legal and reputational risks? (5 = low risk)',
      levels: ['Unacceptable risk', 'High risk', 'Moderate risk', 'Low risk', 'Minimal / manageable risk'] },
    { id: 'difficulty',  label: 'Estimated Difficulty', short: 'Diff.', weight: 10, inverse: true,
      question: 'How easy is it to implement? (5 = easier)',
      levels: ['Very difficult', 'Difficult', 'Moderate effort', 'Fairly easy', 'Easy to implement'] }
  ],

  /* Proposed initial prototype thresholds (editable in Evaluation Center). */
  thresholds: { high: 80, medium: 60 },

  /* Six supporting dimensions — mapped into the five criteria; they add NO weights. */
  supporting: [
    { id: 'alignment',   label: 'Strategic Alignment',   informs: ['relevance'] },
    { id: 'impact',      label: 'Potential Impact',      informs: ['benefit'] },
    { id: 'feasibility', label: 'Feasibility',           informs: ['feasibility'] },
    { id: 'financial',   label: 'Financial Potential',   informs: ['benefit', 'feasibility'] },
    { id: 'time',        label: 'Time Sensitivity',      informs: [], derived: true, note: 'Shown as the deadline urgency indicator, not scored.' },
    { id: 'competitive', label: 'Competitive Advantage', informs: ['relevance', 'benefit'] }
  ],

  /* Deadline urgency windows (days). */
  urgency: { critical: 14, approaching: 45 },

  verification: [
    { id: 'VERIFIED',                     tone: 'teal'  },
    { id: 'PENDING VERIFICATION',         tone: 'amber' },
    { id: 'EXPIRED',                      tone: 'rose'  },
    { id: 'ARCHIVED',                     tone: 'slate' },
    { id: 'SIMULATED DEMONSTRATION DATA', tone: 'sim'   }
  ],

  decisions: [
    { id: 'PURSUE',              tone: 'teal',  text: 'Strong strategic value, favorable feasibility and manageable risk. Act now.' },
    { id: 'MONITOR',             tone: 'blue',  text: 'Potential value. Keep watching for deadlines, eligibility changes or new developments.' },
    { id: 'INVESTIGATE FURTHER', tone: 'amber', text: 'Needs verification, market research, feasibility checks or clarification before deciding.' },
    { id: 'REJECT',              tone: 'rose',  text: 'Poor strategic value, unacceptable risk, unfavorable feasibility or clear ineligibility.' }
  ],

  /* Ready-made comparison sets (by record ID). */
  comparePresets: [
    { label: 'Student exchange vs. scholarships',          ids: ['GOID-001', 'GOID-002', 'GOID-006'] },
    { label: 'Research grants vs. research collaborations', ids: ['GOID-007', 'GOID-009', 'GOID-008'] },
    { label: 'Abaca vs. coffee export markets',             ids: ['GOID-018', 'GOID-021', 'GOID-019', 'GOID-024'] },
    { label: 'Trade fairs across countries',                ids: ['GOID-020', 'GOID-022'] }
  ],

  /* ---------------- DATABASE FIELDS ----------------
     Drives the Add/Edit form AND the Data Dictionary.
     type: text | textarea | select | datalist | date | url | checkbox | rating | auto | derived
     Add a new field here and it appears in both places automatically. */
  fields: [
    // Basic Information
    { key: 'id',          group: 'Basic Information', label: 'Opportunity ID',           type: 'auto',     dtype: 'Text (unique)', purpose: 'Unique reference for each record', example: 'GOID-018' },
    { key: 'title',       group: 'Basic Information', label: 'Opportunity title',        type: 'text',     dtype: 'Text', required: true, purpose: 'Name shown in lists and rankings', example: 'Philippine Abaca Fiber Export Market Opportunity — Japan' },
    { key: 'category',    group: 'Basic Information', label: 'Opportunity category',     type: 'datalist', options: 'categories', dtype: 'Text (list or custom)', purpose: 'Finer grouping inside a sector', example: 'Export Market' },
    { key: 'sector',      group: 'Basic Information', label: 'Sector',                   type: 'select',   options: 'sectors', dtype: 'Category (4 official sectors)', required: true, purpose: 'Official four-sector classification', example: 'Community/MSME Internationalization' },
    { key: 'stakeholder', group: 'Basic Information', label: 'Target stakeholder',       type: 'select',   options: 'stakeholders', dtype: 'Category', required: true, purpose: 'Who the opportunity is for', example: 'MSMEs & Student Entrepreneurs' },
    { key: 'country',     group: 'Basic Information', label: 'Country',                  type: 'select',   options: 'countries', dtype: 'Category (5 markets)', required: true, purpose: 'Target market for filtering and mapping', example: 'Japan' },
    { key: 'region',      group: 'Basic Information', label: 'Region',                   type: 'derived',  dtype: 'Text (from country)', purpose: 'Regional classification for grouping', example: 'East Asia' },
    { key: 'product',     group: 'Basic Information', label: 'MSME product focus',       type: 'select',   options: 'products', dtype: 'Category (optional)', purpose: 'Links record to abaca or coffee market intelligence', example: 'abaca' },
    { key: 'description', group: 'Basic Information', label: 'Opportunity description',  type: 'textarea', dtype: 'Long text', purpose: 'Summary of what the opportunity offers', example: 'Buyer-matching window for Philippine abaca fiber…' },
    // Opportunity Details
    { key: 'eligibility',    group: 'Opportunity Details', label: 'Eligibility requirements',          type: 'textarea', dtype: 'Long text', purpose: 'Who can apply and conditions', example: 'Registered MSME with export-grade fiber supply' },
    { key: 'sourceOrg',      group: 'Opportunity Details', label: 'Source organization',               type: 'text',     dtype: 'Text', purpose: 'Organization that publishes the opportunity', example: 'Department of Trade and Industry (to be verified)' },
    { key: 'sourceUrl',      group: 'Opportunity Details', label: 'Official source website',           type: 'url',      dtype: 'URL', purpose: 'Traceable link to the original source', example: 'https://… (official page)' },
    { key: 'applicationUrl', group: 'Opportunity Details', label: 'Official application link',         type: 'url',      dtype: 'URL', purpose: 'Where to apply (disabled for simulated records)', example: 'https://… (application portal)' },
    { key: 'deadline',       group: 'Opportunity Details', label: 'Application deadline',              type: 'date',     dtype: 'Date (blank = rolling)', purpose: 'Drives urgency indicator and calendar', example: '2027-01-10' },
    { key: 'funding',        group: 'Opportunity Details', label: 'Funding or financial assistance',   type: 'text',     dtype: 'Text', purpose: 'Money or support provided', example: 'Simulated: booth subsidy (placeholder)' },
    { key: 'benefits',       group: 'Opportunity Details', label: 'Potential benefits',                type: 'textarea', dtype: 'Long text', purpose: 'Expected gains for the stakeholder', example: 'Access to buyers, market feedback' },
    { key: 'documents',      group: 'Opportunity Details', label: 'Required documents',                type: 'textarea', dtype: 'Long text', purpose: 'Checklist for applicants', example: 'Business registration, product samples' },
    { key: 'difficultyNote', group: 'Opportunity Details', label: 'Estimated implementation difficulty', type: 'textarea', dtype: 'Long text', purpose: 'Plain-language note on effort needed', example: 'Needs consistent volume and grading' },
    // Source & Verification
    { key: 'simulated',    group: 'Source and Verification', label: 'Simulated demonstration record', type: 'checkbox', dtype: 'Yes / No', purpose: 'Marks placeholder data; disables application links', example: 'Yes' },
    { key: 'verification', group: 'Source and Verification', label: 'Verification status',            type: 'select', options: 'verification', dtype: 'Category (5 labels)', purpose: 'Shows whether a human has confirmed the source', example: 'PENDING VERIFICATION' },
    { key: 'dateAccessed', group: 'Source and Verification', label: 'Date accessed',                  type: 'date', dtype: 'Date', purpose: 'When the source was last opened', example: '2026-11-05' },
    { key: 'lastVerified', group: 'Source and Verification', label: 'Last verification date',         type: 'date', dtype: 'Date', purpose: 'When a reviewer last confirmed details', example: '2026-11-06' },
    { key: 'reviewer',     group: 'Source and Verification', label: 'Responsible reviewer',           type: 'text', dtype: 'Text', purpose: 'Person accountable for verification', example: 'RIO staff (to be designated)' },
    // Evaluation
    { key: 'ratings.benefit',     group: 'Evaluation', label: 'Potential benefit (1–5)',             type: 'rating', dtype: 'Integer 1–5', purpose: '30% of overall score', example: '5' },
    { key: 'ratings.feasibility', group: 'Evaluation', label: 'Feasibility (1–5)',                   type: 'rating', dtype: 'Integer 1–5', purpose: '25% of overall score', example: '4' },
    { key: 'ratings.relevance',   group: 'Evaluation', label: 'Strategic relevance (1–5)',           type: 'rating', dtype: 'Integer 1–5', purpose: '20% of overall score', example: '5' },
    { key: 'ratings.risk',        group: 'Evaluation', label: 'Risk level (1–5, 5 = low risk)',      type: 'rating', dtype: 'Integer 1–5 (inverse)', purpose: '15% of overall score', example: '3' },
    { key: 'ratings.difficulty',  group: 'Evaluation', label: 'Estimated difficulty (1–5, 5 = easier)', type: 'rating', dtype: 'Integer 1–5 (inverse)', purpose: '10% of overall score', example: '3' },
    { key: 'score',               group: 'Evaluation', label: 'Overall weighted score',              type: 'derived', dtype: 'Number 0–100 (calculated)', purpose: 'Ranks opportunities', example: '85.0' },
    { key: 'priority',            group: 'Evaluation', label: 'Priority classification',             type: 'derived', dtype: 'High / Medium / Low (calculated)', purpose: 'Groups records by score thresholds', example: 'HIGH' },
    { key: 'evalNotes',           group: 'Evaluation', label: 'Evaluation explanation',              type: 'textarea', dtype: 'Long text', purpose: 'Why the ratings were given', example: 'Strong buyer interest; grading capacity limited' },
    // Decision
    { key: 'recommended',   group: 'Decision', label: 'Recommended action (system)', type: 'derived', dtype: 'Decision (calculated)', purpose: 'Rule-based suggestion; never final', example: 'PURSUE' },
    { key: 'decision',      group: 'Decision', label: 'Current decision status',     type: 'select', options: 'decisions', dtype: 'Category (4 statuses)', purpose: 'Decision made by reviewers', example: 'PURSUE' },
    { key: 'justification', group: 'Decision', label: 'Explanation or justification', type: 'textarea', dtype: 'Long text', purpose: 'Reasoning behind the decision', example: 'High demand fit; align with DTI programs' },
    { key: 'nextAction',    group: 'Decision', label: 'Suggested next action',       type: 'textarea', dtype: 'Long text', purpose: 'Concrete step to take next', example: 'Contact cooperatives for supply volumes' },
    { key: 'lastEvaluated', group: 'Decision', label: 'Date of last evaluation',     type: 'auto', dtype: 'Date (automatic)', purpose: 'When ratings or decision last changed', example: '2026-11-11' },
    // Record metadata
    { key: 'dateAdded',   group: 'Record', label: 'Date added',       type: 'date',     dtype: 'Date', purpose: 'Used for "recently added" and trends', example: '2026-06-05' },
    { key: 'lastUpdated', group: 'Record', label: 'Last-updated date', type: 'auto',    dtype: 'Date (automatic)', purpose: 'When any field last changed', example: '2026-11-11' },
    { key: 'archived',    group: 'Record', label: 'Archived',          type: 'checkbox', dtype: 'Yes / No', purpose: 'Hides record from active views without deleting', example: 'No' }
  ]
};
