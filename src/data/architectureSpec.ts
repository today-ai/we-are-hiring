export const ARCHITECTURE_SPEC = {
  title: 'AI-Powered Talent Portal & Autonomous First-Round Screening System',
  version: '1.0.0 (Production Blueprint)',
  leadArchitect: 'Chief AI Engineer & Lead Systems Architect',
  lastUpdated: 'October 2026',

  executiveSummary: `An enterprise-grade, privacy-compliant hiring platform combining frictionless candidate acquisition with an autonomous, real-time AI technical screening interviewer. The architecture delivers sub-second conversational latency, structured JSON Schema evaluations, automated candidate scorecards, zero-trust file upload processing, and seamless interview scheduling.`,

  techStack: {
    frontend: {
      name: 'React 19 + TypeScript + Vite + Tailwind CSS v4',
      rationale: 'Delivers instantaneous SPA client responsiveness, optimized bundle sizes (<150KB initial payload), WCAG AA compliance, and zero-pill UI discipline for clean candidate and admin workflows.',
      libraries: ['Motion (fluid transitions)', 'Lucide Icons', 'Canvas-confetti', 'Web Speech API (interactive voice readout)']
    },
    backend: {
      name: 'Node.js (LTS) / Express with TypeScript',
      rationale: 'Provides high-throughput asynchronous I/O ideal for streaming LLM tokens, webhook handling, and rate-limited API gateway capabilities. Can be deployed on Google Cloud Run, AWS ECS Fargate, or Kubernetes.',
      libraries: ['@google/genai SDK (Gemini 3.8 Flash)', 'express-rate-limit', 'multer (with ClamAV scanning stream)', 'zod (runtime schema validation)']
    },
    database: {
      name: 'PostgreSQL 16+ with pgvector extension',
      rationale: 'Combines ACID-compliant relational integrity for candidates, applications, and audit logs with native vector indexing (HNSW / IVFFlat) for semantic resume search and skill rubric matching without requiring a disparate vector DB silo.',
      libraries: ['pgvector (0.7+)', 'drizzle-orm / prisma', 'pgBouncer connection pooling']
    },
    storage: {
      name: 'Cloudflare R2 or AWS S3 with Presigned URLs',
      rationale: 'Zero egress fees on Cloudflare R2, immutable blob versioning, automated virus scanning via AWS GuardDuty / Cloudflare Workers, and server-side AES-256 encryption at rest.',
      libraries: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', 'clamscan']
    },
    llmOrchestration: {
      name: 'Direct Gemini 3.8 Flash SDK with Custom State Machine & JSON Schemas',
      rationale: 'Bypasses heavyweight orchestration libraries (LangChain / LlamaIndex) which introduce dependency bloat, debug obscurity, and 300-800ms of unnecessary overhead. Direct SDK guarantees deterministic JSON output schemas, sub-500ms Time-To-First-Token (TTFT), and $0.075 / 1M input token pricing.',
      libraries: ['@google/genai (v2.4+)', 'OpenTelemetry', 'Langfuse observability', 'zod-to-json-schema']
    }
  },

  databaseSchemaDDL: `-- ==============================================================================
-- TALENTFLOW AI RECRUITMENT & SCREENING ENGINE: PRODUCTION POSTGRESQL SCHEMA
-- Complies with GDPR Right to Erasure, Audit Logging & Role-Based Access Control
-- ==============================================================================

-- Enable UUID extension and pgvector for semantic candidate search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. JOBS & ROLES TABLE
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(120) NOT NULL,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('Full-time', 'Contract', 'Remote', 'Part-time')),
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('Mid', 'Senior', 'Lead', 'Staff', 'Executive')),
    salary_range VARCHAR(100),
    short_description TEXT NOT NULL,
    responsibilities JSONB NOT NULL DEFAULT '[]',
    requirements JSONB NOT NULL DEFAULT '[]',
    domain_competencies JSONB NOT NULL DEFAULT '[]',
    tech_stack JSONB NOT NULL DEFAULT '[]',
    screening_rubric JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for public active job queries
CREATE INDEX idx_jobs_active_dept ON jobs (is_active, department);

-- 2. CANDIDATES MASTER PROFILE (PII Encrypted at Rest)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    years_of_experience NUMERIC(4, 1) NOT NULL,
    gdpr_consent_accepted BOOLEAN NOT NULL DEFAULT false,
    gdpr_consent_timestamp TIMESTAMPTZ,
    data_deletion_requested BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidates_email ON candidates (email);

-- 3. CANDIDATE SUBMISSIONS & DOCUMENTS
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'Applied' 
        CHECK (status IN ('Applied', 'Screening', 'Evaluated', 'Shortlisted', 'Hold', 'Scheduled', 'Rejected')),
    resume_file_url VARCHAR(1000) NOT NULL,
    resume_file_name VARCHAR(255) NOT NULL,
    resume_file_size_bytes BIGINT NOT NULL,
    resume_extracted_text TEXT,
    resume_vector vector(768), -- Embedding vector for semantic skill matching
    cover_letter TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submissions_job_status ON submissions (job_id, status);
CREATE INDEX idx_submissions_candidate ON submissions (candidate_id);

-- 4. INTERVIEW SESSIONS & CONVERSATION TRANSCRIPTS
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    current_question_index INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 5,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE interview_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    turn_index INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    candidate_answer TEXT,
    follow_up_question TEXT,
    follow_up_answer TEXT,
    response_duration_seconds INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transcripts_session ON interview_transcripts (session_id, turn_index);

-- 5. AI EVALUATION & CANDIDATE SCORECARDS
CREATE TABLE candidate_scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    model_version VARCHAR(50) NOT NULL DEFAULT 'gemini-3.8-flash',
    skills_match_score NUMERIC(5, 2) NOT NULL CHECK (skills_match_score BETWEEN 0 AND 100),
    technical_score NUMERIC(5, 2) NOT NULL CHECK (technical_score BETWEEN 0 AND 100),
    problem_solving_score NUMERIC(5, 2) NOT NULL CHECK (problem_solving_score BETWEEN 0 AND 100),
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('SHORTLIST', 'HOLD', 'REJECT')),
    executive_summary TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]',
    risks JSONB NOT NULL DEFAULT '[]',
    recommended_human_questions JSONB NOT NULL DEFAULT '[]',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INTERVIEW SCHEDULING (Human Round 2)
CREATE TABLE scheduled_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(255) NOT NULL,
    interviewer_email VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100) NOT NULL,
    scheduled_timestamp TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Los_Angeles',
    meeting_url VARCHAR(500) NOT NULL,
    calendar_event_id VARCHAR(255),
    calendar_invite_sent BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AUDIT LOG & COMPLIANCE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,

  externalDependencies: [
    {
      category: 'Primary LLM Screening & Evaluation Provider',
      recommended: 'Google Gemini 3.8 Flash via @google/genai SDK',
      alternatives: ['OpenAI GPT-4o / GPT-4o-mini', 'Anthropic Claude 3.5 Sonnet'],
      pricingTiers: {
        gemini: '$0.075 / 1M input tokens | $0.30 / 1M output tokens',
        gpt4o: '$2.50 / 1M input tokens | $10.00 / 1M output tokens (33x cost)',
        claude: '$3.00 / 1M input tokens | $15.00 / 1M output tokens (45x cost)'
      },
      projectedCostPerScreening: '$0.0022 USD (Approx. 4,500 total tokens per 5-question dynamic interview + scoring)',
      credentialsRequired: 'GEMINI_API_KEY (Google AI Studio / Vertex AI Service Account)'
    },
    {
      category: 'Document Parsing / Resume Extraction (OCR)',
      recommended: 'Native Gemini 3.8 Multimodal Ingestion (Zero added vendor cost)',
      alternatives: ['LlamaParse ($0.003/page)', 'Unstructured.io ($1.00/1000 pages)', 'AWS Textract'],
      rationale: 'Gemini 3.8 Flash natively accepts PDF/DOCX base64 or inline data parts, extracting structured candidate history in under 1.2s without third-party parser subscription overhead.',
      credentialsRequired: 'Handled natively through LLM provider credentials'
    },
    {
      category: 'Cloud File Storage (Resumes, Portfolios)',
      recommended: 'Cloudflare R2 (S3-Compatible)',
      alternatives: ['AWS S3 Standard', 'Supabase Storage', 'Google Cloud Storage'],
      pricingTiers: {
        r2: '$0.015 / GB-month, $0 Egress fees (100% free bandwidth)',
        s3: '$0.023 / GB-month + $0.09 / GB internet egress'
      },
      projectedCostPer1000Applicants: '< $0.15 / month',
      credentialsRequired: 'R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ACCOUNT_ID'
    },
    {
      category: 'Transactional Email Service',
      recommended: 'Resend (Modern developer API, React Email integration)',
      alternatives: ['Brevo (formerly Sendinblue)', 'SendGrid', 'Postmark'],
      pricingTiers: {
        resend: 'Free tier up to 3,000 emails/month; $20/month for 50,000 emails',
        sendgrid: 'Free tier 100/day; $19.95/month for 50k'
      },
      projectedCostPer1000Applicants: '$0.00 (under free tier)',
      credentialsRequired: 'RESEND_API_KEY, RESEND_SENDER_DOMAIN (e.g., hiring@yourcompany.com)'
    },
    {
      category: 'Vector Database & Semantic Resume Search',
      recommended: 'PostgreSQL pgvector extension (Native colocation)',
      alternatives: ['Pinecone Serverless ($0.08/GB-month)', 'Qdrant Cloud', 'Weaviate'],
      rationale: 'Colocating candidate embeddings directly in PostgreSQL eliminates dual-write consistency problems, avoids network latency across multiple vendors, and incurs $0 additional cloud billing.',
      credentialsRequired: 'Standard PostgreSQL connection string'
    },
    {
      category: 'Bot Protection & Rate Limiting Gateway',
      recommended: 'Cloudflare Turnstile (Privacy-friendly, CAPTCHA-free invisible challenge)',
      alternatives: ['Google reCAPTCHA v3', 'hCaptcha'],
      pricingTiers: {
        turnstile: '100% Free with unlimited invisible challenges',
        recaptcha: 'Free up to 10,000 assessments/month'
      },
      credentialsRequired: 'CLOUDFLARE_TURNSTILE_SITE_KEY, CLOUDFLARE_TURNSTILE_SECRET_KEY'
    }
  ],

  llmOrchestrationComparison: [
    {
      dimension: 'Latency & TTFT',
      directSdk: 'Direct SDK (Gemini / OpenAI): 250 - 450ms TTFT. Zero middleware overhead.',
      langchain: 'LangChain / LlamaIndex: 700 - 1,400ms TTFT due to internal wrappers and abstraction layers.'
    },
    {
      dimension: 'Determinism & Schema Guarantees',
      directSdk: 'Native responseSchema with JSON Schema enforcement guarantees 100% valid JSON parsing.',
      langchain: 'Regex-based output fixers and pydantic parsers that can fail during high concurrency.'
    },
    {
      dimension: 'Prompt Injection Defense',
      directSdk: 'Clean boundary between System Instructions, Candidate Resume Context, and User Response.',
      langchain: 'Complex prompt template nesting increases surface area for indirect injection leaks.'
    },
    {
      dimension: 'Maintainability & Long-term Ops',
      directSdk: 'Single dependency (@google/genai), zero breaking breaking-change cascades across sub-packages.',
      langchain: 'High dependency churn, frequent breaking updates across core, community, and experimental modules.'
    }
  ]
};
