import { JobPosting } from '../types';

export const OPEN_JOBS: JobPosting[] = [
  {
    id: 'airev-ai-eng-01',
    title: 'AI Software Engineer (Generative AI & LLMs)',
    department: 'Artificial Intelligence & Emerging Systems',
    location: 'Karachi, Pakistan (On-Site)',
    type: 'Full-time',
    experienceLevel: 'Senior',
    salaryRange: '125,000 – 150,000 PKR / month',
    shortDescription: 'Build enterprise Generative AI workflows, multi-agent systems, and low-latency API integrations at our emerging tech center in Karachi.',
    responsibilities: [
      'Architect and deploy production LLM pipelines utilizing Gemini 3.8 Flash, OpenAI API, and open-source models with strict JSON schema outputs.',
      'Construct automated prompt evaluation frameworks, regression testing benchmarks, and hallucination detection checks.',
      'Integrate vector search solutions (PostgreSQL pgvector) for domain-specific RAG knowledge extraction.',
      'Participate actively in on-site agile sprints, daily standups, and collaborative architecture whiteboarding.',
      'Uphold corporate confidentiality, data privacy, and ethical AI development guidelines.'
    ],
    requirements: [
      'Bachelor’s degree in Computer Science, Software Engineering, or related field (FAST, NED, IBA, NUST or equivalent preferred).',
      '2.5 to 5 years of software engineering experience with at least 1.5 years deploying production AI/LLM applications.',
      'Proficiency in TypeScript/Node.js or Python, REST/GraphQL APIs, and relational databases (PostgreSQL).',
      'Strong understanding of prompt engineering, model temperature tuning, context window limits, and token economics.',
      'High standard of workplace ethics, punctuality, and professional written/verbal communication.'
    ],
    domainCompetencies: [
      'Gemini & OpenAI API Orchestration',
      'Structured JSON Schema Generation',
      'RAG & Vector Embeddings (pgvector)',
      'Prompt Injection Defense & Guardrails',
      'Corporate Code Review & Clean Architecture'
    ],
    perks: [
      'Competitive monthly compensation (125,000 – 150,000 PKR) with guaranteed 1st-of-the-month direct deposit',
      'Fully equipped air-conditioned modern office on Shahrah-e-Faisal / Clifton, Karachi',
      'Uninterrupted high-speed dual fiber internet + dedicated 24/7 generator backup power',
      'Annual performance bonus & Eid festive allowances',
      'Comprehensive health coverage (Hospitalization & OPD allowance)',
      'Daily complimentary gourmet tea, coffee, and evening refreshments',
      'Direct mentorship from industry architects and sponsored certification vouchers'
    ],
    techStack: ['Python', 'TypeScript', 'Gemini SDK', 'PostgreSQL', 'Docker', 'FastAPI', 'Git'],
    openPositions: 2
  },
  {
    id: 'airev-fullstack-02',
    title: 'Full-Stack Web Developer (React 19 & Node.js)',
    department: 'Web Engineering & Core Platform',
    location: 'Karachi, Pakistan (On-Site)',
    type: 'Full-time',
    experienceLevel: 'Mid',
    salaryRange: '110,000 – 140,000 PKR / month',
    shortDescription: 'Develop responsive, high-performance web applications and enterprise portals with clean component architecture and RESTful APIs.',
    responsibilities: [
      'Build responsive, production-ready frontend user interfaces using React 19, TypeScript, and Tailwind CSS.',
      'Develop robust Node.js / Express backend services with secure authentication, rate limiting, and database queries.',
      'Collaborate with UI/UX designers and AI engineers on-site to turn Figma prototypes into fluid, accessible web experiences.',
      'Maintain disciplined Git branching models, write clean modular code, and conduct peer pull request reviews.',
      'Adhere strictly to corporate work ethics, timely task execution in Jira/Trello, and client data protection protocols.'
    ],
    requirements: [
      'Bachelor’s in CS/SE or equivalent practical development background.',
      '2 to 4 years of proven hands-on full-stack development experience.',
      'Solid command of JavaScript (ES2022+), TypeScript, React, state management, and Tailwind CSS.',
      'Strong backend knowledge in Node.js, Express, PostgreSQL, and API authentication.',
      'Commitment to on-site office collaboration, punctuality, and transparent communication.'
    ],
    domainCompetencies: [
      'React 19 & Modern SPA State Management',
      'Node.js REST API Development',
      'PostgreSQL Relational Modeling & Indexing',
      'Tailwind CSS & Responsive UI Design',
      'Git Workflow & Agile Sprint Discipline'
    ],
    perks: [
      'Monthly package of 110,000 – 140,000 PKR based on technical depth and experience',
      'Comfortable on-site workplace with dedicated ergonomic setup and multi-monitor workstations',
      '24/7 electricity backup (UPS + standby generator) ensuring zero work interruption',
      'Paid annual leaves (20 days) + gazetted national holidays',
      'Health insurance plan for employee and immediate dependents',
      'Bi-annual performance evaluations with merit-based increments',
      'Friendly, respectful, and growth-oriented corporate team culture'
    ],
    techStack: ['React 19', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Vite'],
    openPositions: 2
  },
  {
    id: 'airev-growth-deliv-03',
    title: 'Growth & Email Deliverability Specialist',
    department: 'Growth Infrastructure & Marketing Tech',
    location: 'Karachi, Pakistan (On-Site)',
    type: 'Full-time',
    experienceLevel: 'Mid',
    salaryRange: '100,000 – 135,000 PKR / month',
    shortDescription: 'Manage multi-domain outbound email infrastructure, SPF/DKIM/DMARC authentication, and automated lead enrichment toolchains.',
    responsibilities: [
      'Configure and manage domain fleets, DNS records, SPF flattening, 2048-bit DKIM keys, and DMARC enforcement (p=reject).',
      'Monitor inbox placement rates, bounce telemetry, and Google Postmaster Tools metrics across secondary domains.',
      'Build automated waterfall enrichment pipelines utilizing Clay, Apollo.io API, and email verification services.',
      'Enforce zero-spam policies and ensure compliance with global outbound email regulations (CAN-SPAM, GDPR).',
      'Maintain ethical data sourcing standards and report deliverability health dashboards to leadership.'
    ],
    requirements: [
      '2+ years of hands-on experience in cold email deliverability, DNS administration, or growth infrastructure.',
      'Deep technical understanding of MX, SPF, DKIM, DMARC, BIMI, and mailbox provider spam filters.',
      'Familiarity with Clay, Apollo, Instantly/Smartlead, and DNS managers (Cloudflare).',
      'High integrity, methodical analytical mindset, and data hygiene discipline.',
      'Availability for full-time on-site work at our Karachi office.'
    ],
    domainCompetencies: [
      'SPF / DKIM / DMARC (p=reject) DNS Records',
      'Inbox Placement Diagnostics & Warmup Ramps',
      'Clay & Apollo Waterfall Data Enrichment',
      'Bounce & Spam Trap Triage Protocols',
      'Corporate Compliance & Anti-Spam Governance'
    ],
    perks: [
      'Fixed monthly salary of 100,000 – 135,000 PKR with quarterly milestone bonuses',
      'Dedicated high-spec workstation with dual monitors at our Karachi Emerging Center',
      'Comprehensive OPD and hospitalization health insurance coverage',
      'Annual leaves, sick leaves, and Eid bonuses',
      'Tea/coffee bar and daily catered snacks in our breakroom',
      'Structured career roadmap transitioning into Growth Engineering Lead'
    ],
    techStack: ['Cloudflare DNS', 'Clay', 'Apollo API', 'Postmaster Tools', 'Google Workspace', 'Node.js'],
    openPositions: 1
  },
  {
    id: 'airev-prompt-qa-04',
    title: 'AI Prompt & Data Evaluation Associate',
    department: 'AI Quality Assurance & Operations',
    location: 'Karachi, Pakistan (On-Site)',
    type: 'Full-time',
    experienceLevel: 'Mid',
    salaryRange: '100,000 – 125,000 PKR / month',
    shortDescription: 'Calibrate AI model outputs, curate benchmark evaluation datasets, and run systematic quality audits on automated screening transcripts.',
    responsibilities: [
      'Evaluate model responses, interview transcripts, and resume summaries against rigorous quality rubrics.',
      'Craft synthetic adversarial prompts to stress-test screening agents for hallucination, bias, and prompt injection vulnerabilities.',
      'Collaborate with AI engineering leads on-site to refine system instructions and structured JSON output schemas.',
      'Maintain meticulous quality logs and accuracy scorecards in Google Sheets / internal dashboards.',
      'Uphold strict objectivity, confidentiality, and corporate reporting standards.'
    ],
    requirements: [
      'Bachelor’s degree in Computer Science, Data Sciences, Linguistics, or related analytical discipline.',
      '1 to 3 years experience in software testing, prompt engineering, content operations, or data evaluation.',
      'Exceptional written English command, critical thinking, and keen eye for technical inaccuracy.',
      'Familiarity with Generative AI tools (Gemini, ChatGPT, Claude) and basic programming concepts.',
      'Commitment to on-site corporate ethics, punctuality, and constructive team collaboration.'
    ],
    domainCompetencies: [
      'Prompt Testing & Edge-Case Calibration',
      'Dataset Annotation & Accuracy Auditing',
      'Hallucination & Bias Identification',
      'Structured Reporting & Metric Tracking',
      'Ethical AI Governance & Compliance'
    ],
    perks: [
      'Starting monthly salary: 100,000 – 125,000 PKR with bi-annual performance appraisals',
      'Modern, air-conditioned corporate environment in central Karachi',
      'Reliable power backup and high-speed broadband ensuring zero downtime',
      'Health insurance plan and paid festival holidays',
      'Internal AI workshops and hands-on exposure to cutting-edge LLM frameworks',
      'Opportunity to transition into full-time AI Engineer or Data Scientist roles'
    ],
    techStack: ['Gemini', 'Python Basics', 'Google Sheets', 'Jira', 'Notion', 'Langfuse'],
    openPositions: 1
  }
];
