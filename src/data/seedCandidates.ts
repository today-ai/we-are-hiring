import { CandidateApplication } from '../types';

export const SAMPLE_RESUME_PROFILES = [
  {
    name: 'Hamza Farooq',
    email: 'hamza.farooq.dev@example.com',
    phone: '+92 300 8291455',
    linkedinUrl: 'https://linkedin.com/in/hamza-farooq-karachi',
    portfolioUrl: 'https://hamzafarooq.dev',
    yearsOfExperience: 4,
    jobId: 'airev-growth-deliv-03',
    jobTitle: 'Growth & Email Deliverability Specialist',
    resumeFileName: 'Hamza_Farooq_CV_Karachi.pdf',
    resumeFileSize: '2.1 MB',
    resumeText: `Hamza Farooq — Outbound Growth & Email Deliverability Specialist
Location: Gulshan-e-Iqbal, Karachi, Pakistan.
Education: BS in Computer Science, FAST-NUCES Karachi (2022).

Professional Summary:
4 years of on-site and hybrid experience architecting scalable cold email infrastructures, automated DNS fleets, and multi-vendor lead enrichment pipelines. Managed 1.8M monthly outbound events with sustained 98.2% inbox placement across Google Workspace and Office 365.

Core Competencies & Tools:
- Email Infrastructure: Custom Haraka/Postfix relays, Mailgun, dedicated IP pools, warmup algorithms.
- DNS Protocols: SPF flattening (Cloudflare API), DKIM (2048-bit rotation), DMARC (enforced p=reject), BIMI.
- Data Enrichment: Clay (waterfall schemas), Apollo.io API, MillionVerifier, Python web scrapers.
- Diagnostics & Compliance: Google Postmaster Tools API, SNDS, CAN-SPAM & GDPR compliance standards.

Professional Milestones & Corporate Impact:
- Rebuilt client sending infrastructure across 40 domains, decreasing bounce rates from 4.2% to 0.7%.
- Engineered automated alerting bot using Node.js that halts campaign dispatch within 10 minutes of spam rate spike exceeding 0.1%.
- Maintained 100% adherence to corporate data ethics, client confidentiality, and on-site sprint milestones.`
  },
  {
    name: 'Zainab Siddiqui',
    email: 'zainab.siddiqui.ai@example.com',
    phone: '+92 333 4912087',
    linkedinUrl: 'https://linkedin.com/in/zainab-siddiqui-ai',
    portfolioUrl: 'https://zainab-ai.io',
    yearsOfExperience: 3.5,
    jobId: 'airev-ai-eng-01',
    jobTitle: 'AI Software Engineer (Generative AI & LLMs)',
    resumeFileName: 'Zainab_Siddiqui_AI_Engineer_CV.pdf',
    resumeFileSize: '1.9 MB',
    resumeText: `Zainab Siddiqui — AI Software Engineer
Location: PECHS, Karachi, Pakistan.
Education: BE in Software Engineering, NED University of Engineering & Technology, Karachi (2022).

Professional Summary:
3.5 years of software engineering experience specializing in production Generative AI integration, low-latency LLM orchestration, and RAG architectures using Python and TypeScript.

Core Technical Skills:
- AI & LLMs: Gemini 3.8 Flash SDK, OpenAI API, Anthropic Claude, custom prompt evaluation state machines.
- Backend & DB: Python (FastAPI), TypeScript (Node.js/Express), PostgreSQL (pgvector embeddings), Redis caching.
- Evaluation & Evals: Ragas, DeepEval, prompt injection vulnerability testing, structured JSON Schema adherence.
- Engineering Practices: Clean architecture, strict type safety, Git branching, Jira sprint accountability.

Key Projects & Milestones:
- Built real-time enterprise AI documentation search utilizing pgvector and Gemini, reducing internal inquiry response time by 75%.
- Implemented structured output validation preventing schema drift with 99.8% reliability under concurrent loads.
- Winner of National AI Hackathon 2024 (Karachi chapter). Committed to professional corporate ethics and collaborative on-site team culture.`
  }
];

export const INITIAL_CANDIDATES: CandidateApplication[] = [
  {
    id: 'cand-khi-001',
    jobId: 'airev-growth-deliv-03',
    fullName: 'Hamza Farooq',
    email: 'hamza.farooq.dev@example.com',
    phone: '+92 300 8291455',
    linkedinUrl: 'https://linkedin.com/in/hamza-farooq-karachi',
    portfolioUrl: 'https://hamzafarooq.dev',
    yearsOfExperience: 4,
    resumeFileName: 'Hamza_Farooq_CV_Karachi.pdf',
    resumeFileSize: '2.1 MB',
    resumeText: SAMPLE_RESUME_PROFILES[0].resumeText,
    coverLetter: 'I am applying for the on-site Growth & Deliverability Specialist role at AIREV Emerging Center in Karachi. I look forward to contributing my 4 years of DNS, SMTP, and Clay enrichment experience.',
    appliedAt: '2026-10-03T11:30:00Z',
    status: 'Shortlisted',
    resumeAiSummary: {
      executiveSnapshot: 'Hamza Farooq is a FAST-NUCES Karachi graduate with 4 years hands-on experience scaling outbound email clusters, DMARC p=reject protocols, and Clay waterfall enrichment.',
      relevantSkills: ['SPF/DKIM/DMARC (p=reject)', 'Cloudflare DNS API', 'Clay & Apollo Waterfall', 'Postfix Relays', 'Google Postmaster Tools'],
      scaleAndMilestones: [
        'Scaled outbound campaigns to 1.8M monthly emails sustaining 98.2% primary inbox placement',
        'Decreased bounce rate from 4.2% to 0.7% with automated spam-spike triage bots'
      ],
      educationAndCredentials: 'BS in Computer Science, FAST-NUCES Karachi (2022)',
      recruiterQuickVerdict: 'Excellent candidate for on-site Karachi team; strong technical competency and corporate work ethics.'
    },
    scorecard: {
      skillsMatchScore: 94,
      technicalScore: 96,
      problemSolvingScore: 91,
      overallScore: 94,
      recommendation: 'SHORTLIST',
      executiveSummary: 'Top-tier local engineering profile. Demonstrates solid operational mastery over domain authentication, automated waterfall enrichment in Clay, and crisis mitigation in email deliverability.',
      strengths: [
        'Proven scale: Managed 1.8M monthly sends with 98.2% inbox placement from Karachi.',
        'DNS mastery: Detailed automated SPF flattening and 2048-bit DKIM rotation.',
        'High workplace professionalism and alignment with corporate culture.'
      ],
      risks: [
        'Confirm preferred shift timings for on-site collaboration at Karachi Emerging Center.'
      ],
      recommendedHumanQuestions: [
        'Discuss your real-world triage when Google Workspace Postmaster user spam rates rise above 0.1%.',
        'How do you manage Clay webhook rate limits when chaining Apollo and MillionVerifier APIs?'
      ],
      evaluatedAt: '2026-10-03T11:48:22Z'
    },
    transcript: [
      {
        questionId: 1,
        category: 'Scale & Architecture',
        question: 'Could you walk us through the largest outbound cold email or messaging infrastructure you have designed or managed, including volume and server architecture?',
        answer: 'I managed an infrastructure sending 1.8 million emails monthly. We deployed 40 secondary domains on Cloudflare DNS with dedicated Mailgun IP pools and Postfix relays, keeping per-inbox volume strictly under 35 daily sends.',
        timestamp: '2026-10-03T11:35:00Z'
      },
      {
        questionId: 2,
        category: 'Deliverability & Protocols',
        question: 'How do you configure and monitor SPF, DKIM (2048-bit rotation), DMARC (with p=reject), and BIMI across secondary domains to prevent domain burn?',
        answer: 'We use Cloudflare API for automated DNS provisioning. SPF is flattened to stay under the 10-lookup limit. DKIM is 2048-bit, rotated quarterly. DMARC policy is set to p=reject with automated RUA report aggregation via Valimail.',
        timestamp: '2026-10-03T11:39:15Z'
      }
    ]
  },
  {
    id: 'cand-khi-002',
    jobId: 'airev-ai-eng-01',
    fullName: 'Zainab Siddiqui',
    email: 'zainab.siddiqui.ai@example.com',
    phone: '+92 333 4912087',
    linkedinUrl: 'https://linkedin.com/in/zainab-siddiqui-ai',
    portfolioUrl: 'https://zainab-ai.io',
    yearsOfExperience: 3.5,
    resumeFileName: 'Zainab_Siddiqui_AI_Engineer_CV.pdf',
    resumeFileSize: '1.9 MB',
    resumeText: SAMPLE_RESUME_PROFILES[1].resumeText,
    coverLetter: 'Applying for the AI Software Engineer position at AIREV Emerging Center. Excited about building cutting-edge Generative AI applications on-site in Karachi.',
    appliedAt: '2026-10-03T15:10:00Z',
    status: 'Evaluated',
    resumeAiSummary: {
      executiveSnapshot: 'Zainab Siddiqui is an NED University software engineering graduate with 3.5 years experience building production LLM apps with Gemini SDK, FastAPI, and pgvector.',
      relevantSkills: ['Gemini 3.8 Flash SDK', 'Python / FastAPI', 'PostgreSQL & pgvector', 'Prompt Evaluation & Evals', 'Docker & Git'],
      scaleAndMilestones: [
        'Built enterprise semantic search engine cutting internal inquiry response time by 75%',
        'Maintained 99.8% structured JSON Schema adherence under high concurrency'
      ],
      educationAndCredentials: 'BE in Software Engineering, NED University Karachi (2022)',
      recruiterQuickVerdict: 'Ideal match for on-site Karachi AI Software Engineer position (125k - 150k PKR band).'
    },
    scorecard: {
      skillsMatchScore: 92,
      technicalScore: 94,
      problemSolvingScore: 89,
      overallScore: 92,
      recommendation: 'SHORTLIST',
      executiveSummary: 'Outstanding candidate with rigorous analytical foundations from NED University. Demonstrated hands-on fluency in low-latency LLM orchestration, structured schemas, and ethical AI development.',
      strengths: [
        'Solid technical foundations in Gemini SDK and pgvector embeddings.',
        'High standard of code quality, unit testing, and team collaboration.',
        'Local Karachi resident, ready for immediate full-time on-site onboarding.'
      ],
      risks: [
        'Confirm readiness to lead architecture design reviews with cross-functional junior developers.'
      ],
      recommendedHumanQuestions: [
        'Walk through your design choices when implementing hybrid vector + BM25 keyword search in PostgreSQL.',
        'How do you handle prompt injection defense when parsing candidate-supplied files?'
      ],
      evaluatedAt: '2026-10-03T15:28:40Z'
    },
    transcript: [
      {
        questionId: 1,
        category: 'System Architecture',
        question: 'Can you describe the most complex production AI pipeline you built from scratch, detailing the architecture and key technical trade-offs you navigated?',
        answer: 'I engineered an automated document extraction pipeline using the direct Gemini SDK with strict JSON Schema outputs, orchestrated with FastAPI and PostgreSQL pgvector. We achieved a P95 response latency under 450ms.',
        timestamp: '2026-10-03T15:16:00Z'
      }
    ]
  }
];
