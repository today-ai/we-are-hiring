import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to get Gemini AI instance if key is present
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

// AI-powered Resume Executive Summary Generator
app.post('/api/resume/summarize', async (req: Request, res: Response) => {
  try {
    const { candidateName, jobTitle, resumeText } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'heuristic',
        summary: generateHeuristicResumeSummary(candidateName, jobTitle, resumeText)
      });
    }

    const prompt = `You are a Principal Technical Recruiter and Executive Talent Assessor.
Generate a structured, high-signal 30-second executive summary of the following candidate's resume for the role: "${jobTitle || 'Engineering Role'}".

Candidate Name: ${candidateName || 'Candidate'}
Resume Text:
${(resumeText || '').slice(0, 4000)}

Highlight specifically:
1. Executive Snapshot: 1-2 punchy sentences summarizing their senior background, domain focus, and career tier.
2. Most Relevant Skills: Top 5-6 technical skills or tooling directly pertinent to ${jobTitle}.
3. Demonstrated Scale & Milestones: 2-3 concrete numerical accomplishments (e.g. volume handled, latency reductions, team size, revenue/pipeline impact).
4. Education & Credentials: Academic background, degrees, certifications, or notable publications.
5. Recruiter Quick Assessment: Brief 1-sentence verdict on suitability and match for this position.

Respond ONLY with valid JSON in this exact structure:
{
  "executiveSnapshot": "string",
  "relevantSkills": ["string", "string"],
  "scaleAndMilestones": ["string", "string"],
  "educationAndCredentials": "string",
  "recruiterQuickVerdict": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      summary: parsed
    });
  } catch (error: any) {
    console.error('Resume summary error:', error);
    return res.json({
      success: true,
      source: 'fallback',
      summary: generateHeuristicResumeSummary(req.body?.candidateName, req.body?.jobTitle, req.body?.resumeText)
    });
  }
});

// Candidate Resource Center: AI-Generated Interview Prep Kit
app.post('/api/prep/generate', async (req: Request, res: Response) => {
  try {
    const { jobTitle, department, techStack } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'heuristic',
        prepKit: generateHeuristicPrepKit(jobTitle)
      });
    }

    const prompt = `You are the Lead Talent Architect and Technical Hiring Director at AIREV Emerging Center in Karachi, Pakistan.
Generate a comprehensive, highly practical Candidate Interview Preparation Kit for the on-site role: "${jobTitle || 'AI Software Engineer'}" (${department || 'Engineering'}).
Tech stack: ${(techStack || []).join(', ') || 'Modern Engineering Stack'}.
Compensation band: 100k - 150k PKR/month (On-site Karachi).

Provide a structured, encouraging guide that empowers candidates to shine in both the 24/7 Autonomous AI Screening Room and the Round 2 On-Site Technical & Leadership Interview.

Respond ONLY with valid JSON in this exact structure:
{
  "roleOverview": "string (1-2 inspiring sentences on what the role achieves at AIREV Emerging Center)",
  "technicalFocusAreas": [
    {
      "topic": "string",
      "importance": "High",
      "tips": "string"
    }
  ],
  "sampleQuestions": [
    {
      "question": "string",
      "category": "string",
      "whatEvaluatorsLookFor": "string",
      "idealAnswerBlueprint": "string"
    }
  ],
  "corporateEthicsAndCultureTips": [
    "string"
  ],
  "dosAndDonts": {
    "dos": ["string"],
    "donts": ["string"]
  },
  "recommendedStudyTopics": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      prepKit: parsed
    });
  } catch (error: any) {
    console.error('Prep kit generation error:', error);
    return res.json({
      success: true,
      source: 'fallback',
      prepKit: generateHeuristicPrepKit(req.body?.jobTitle)
    });
  }
});

// Candidate Resource Center: Mock Answer Instant Practice Feedback
app.post('/api/prep/practice-feedback', async (req: Request, res: Response) => {
  try {
    const { jobTitle, question, practiceAnswer } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'heuristic',
        feedback: {
          score: 85,
          readinessVerdict: "Solid Foundation - Minor Polish",
          strengths: ["Clear mention of relevant tools and technologies", "Direct answer addressed to the question prompt"],
          improvements: ["Quantify your impact with concrete numerical scale (e.g. latency, concurrency, volume)"],
          revisedExampleSnippet: "Consider: 'I resolved this by orchestrating [Stack], which maintained 99.8% uptime and reduced P95 latency by 45%.'"
        }
      });
    }

    const prompt = `You are a Senior Technical Interview Coach at AIREV Emerging Center Karachi.
Review this candidate's mock practice answer for the role "${jobTitle}":
Interview Question: "${question}"
Candidate Mock Answer: "${practiceAnswer}"

Give them constructive, actionable feedback to polish their real interview response:
Respond ONLY with valid JSON:
{
  "score": number (0-100),
  "readinessVerdict": "Ready to Excel" | "Solid Foundation - Minor Polish" | "Needs More Technical Specifics",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "revisedExampleSnippet": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      feedback: parsed
    });
  } catch (error) {
    return res.json({
      success: true,
      source: 'fallback',
      feedback: {
        score: 82,
        readinessVerdict: "Solid Foundation - Minor Polish",
        strengths: ["Direct response to the problem scenario", "Structured technical terminology"],
        improvements: ["Add specific production metrics (e.g. TPS, latency reduction, send volume)"],
        revisedExampleSnippet: "I architected the solution using [Tool/Stack], ensuring sub-400ms latency and 99.8% reliability under concurrent load."
      }
    });
  }
});

function generateHeuristicPrepKit(jobTitle?: string) {
  const title = jobTitle || 'Engineering Specialist';
  const isAI = title.toLowerCase().includes('ai software') || title.toLowerCase().includes('llm');
  const isGrowth = title.toLowerCase().includes('deliverability') || title.toLowerCase().includes('growth');
  const isWeb = title.toLowerCase().includes('web') || title.toLowerCase().includes('full-stack');

  if (isGrowth) {
    return {
      roleOverview: 'Lead the architecture of high-volume outbound messaging infrastructure, domain reputation monitoring, and automated lead enrichment at AIREV Emerging Center.',
      technicalFocusAreas: [
        {
          topic: 'DNS Protocol Hardening (SPF, DKIM, DMARC)',
          importance: 'Critical',
          tips: 'Be prepared to explain automated SPF flattening (10-lookup limit), 2048-bit DKIM rotation via Cloudflare API, and DMARC enforcement (p=reject).'
        },
        {
          topic: 'Waterfall Data Enrichment in Clay & Apollo',
          importance: 'High',
          tips: 'Demonstrate how you chain enrichment providers to maximize verified email and direct-dial phone fill rates while controlling API credit burn.'
        },
        {
          topic: 'Domain Burn & Crisis Mitigation',
          importance: 'High',
          tips: 'Walk through your 4-step triage protocol when Google Workspace Postmaster spam rates exceed 0.1%.'
        }
      ],
      sampleQuestions: [
        {
          question: 'How do you configure and monitor SPF, DKIM, and DMARC across 40 secondary domains to ensure 98%+ primary inbox placement?',
          category: 'Authentication Protocols',
          whatEvaluatorsLookFor: 'Deep understanding of DNS records, Valimail/DMARC report aggregation, and secondary domain routing.',
          idealAnswerBlueprint: 'Structure: 1) Cloudflare automated API DNS provisioning, 2) DKIM 2048-bit key rotation, 3) DMARC p=reject with RUA alerts, 4) Ramp-up schedule (under 35 sends/day per inbox).'
        },
        {
          question: 'Walk us through your lead enrichment workflow in Clay chaining multiple data providers.',
          category: 'Data Toolchains',
          whatEvaluatorsLookFor: 'Logic gates, conditional fallbacks, cost optimization, and verification using MillionVerifier.',
          idealAnswerBlueprint: 'Explain initiating with Apollo API for core firmographics, cascading to Clay enrichment webhooks, and filtering through MillionVerifier before CRM upload.'
        }
      ],
      corporateEthicsAndCultureTips: [
        'Strict CAN-SPAM and GDPR compliance: Never condone bought lists or deceptive subject headers.',
        'Punctuality & on-site collaboration: Daily 9:30 AM PKT standup with the marketing tech team in Karachi.',
        'Client confidentiality: Strict adherence to NDA for client domain lists and internal lead databases.'
      ],
      dosAndDonts: {
        dos: [
          'Mention concrete numbers: daily send volumes, inbox placement percentage, and bounce thresholds.',
          'Discuss how you monitor Google Postmaster Tools and Microsoft SNDS metrics proactively.',
          'Highlight experience with Cloudflare DNS management and API automation.'
        ],
        donts: [
          'Do not give generic advice like "just warm up emails for 2 weeks"—specify volume curves.',
          'Avoid ignoring compliance standards like one-click unsubscribe headers.',
          'Do not hesitate to explain past domain incidents and the exact remediation steps taken.'
        ]
      },
      recommendedStudyTopics: [
        { title: 'Google & Yahoo 2024 Bulk Sender Mandates', description: 'Master DMARC alignment, SPF requirements, and 0.3% spam threshold rules.' },
        { title: 'Clay Waterfall Logic & Webhooks', description: 'Learn automated conditional routing across Apollo, Clearbit, and Dropcontact.' }
      ]
    };
  }

  if (isAI) {
    return {
      roleOverview: 'Architect resilient Generative AI applications, low-latency LLM microservices, and semantic retrieval systems at AIREV Emerging Center Karachi.',
      technicalFocusAreas: [
        {
          topic: 'Gemini SDK & Structured JSON Output Schemas',
          importance: 'Critical',
          tips: 'Focus on deterministic JSON outputs using responseMimeType: application/json and responseSchema definitions without Markdown formatting drift.'
        },
        {
          topic: 'Vector Databases & RAG Architectures (pgvector)',
          importance: 'High',
          tips: 'Be prepared to explain chunking strategies, cosine similarity vs inner product, and hybrid lexical/vector indexing in PostgreSQL.'
        },
        {
          topic: 'Prompt Injection Defense & Guardrails',
          importance: 'High',
          tips: 'Understand indirect prompt injection vectors in uploaded files, system prompt encapsulation, and output sanitization.'
        }
      ],
      sampleQuestions: [
        {
          question: 'How do you guarantee strict structured JSON adherence when prompting LLMs in production systems?',
          category: 'Structured Output Engineering',
          whatEvaluatorsLookFor: 'Use of native SDK responseSchema, Pydantic/Zod schemas, and schema validation retry wrappers.',
          idealAnswerBlueprint: 'Describe binding type schemas directly to the model configuration, temperature reduction (0.1), and parsing with fallback self-correction loops.'
        },
        {
          question: 'Can you walk through your design for a semantic document search pipeline handling thousands of technical queries daily?',
          category: 'RAG & Vector Search',
          whatEvaluatorsLookFor: 'Embedding model selection, chunk overlap strategies, pgvector HNSW indexing, and latency optimization.',
          idealAnswerBlueprint: 'Detail chunking documents into 500-token blocks with 50-token overlap, generating embeddings, indexing via pgvector HNSW, and caching hot queries in Redis.'
        }
      ],
      corporateEthicsAndCultureTips: [
        'Ethical AI stewardship: Always audit model outputs for bias, toxicity, and accuracy hallucinations.',
        'Code ownership: Write clean, well-tested Python/TypeScript services with comprehensive error boundary fallbacks.',
        'On-site agile discipline: Active participation in architecture design reviews and peer code feedback.'
      ],
      dosAndDonts: {
        dos: [
          'Highlight hands-on production experience with modern SDKs (@google/genai, FastAPI, Docker).',
          'Discuss latency numbers: P95 response times, token consumption budgeting, and streaming.',
          'Emphasize disciplined Git workflows, pull request reviews, and type safety.'
        ],
        donts: [
          'Do not rely solely on theory—cite real projects, challenges, and architectural trade-offs.',
          'Avoid vague answers like "I used prompt engineering"—specify exact techniques (few-shot, chain-of-thought, system constraints).',
          'Do not overlook error handling when external AI APIs experience rate limits or transient timeouts.'
        ]
      },
      recommendedStudyTopics: [
        { title: 'Google Gen AI SDK v2+ Patterns', description: 'Explore model generateContent, systemInstruction, and structured JSON generation.' },
        { title: 'PostgreSQL pgvector HNSW Indexing', description: 'Learn similarity search tuning and hybrid search ranking.' }
      ]
    };
  }

  return {
    roleOverview: 'Engineer scalable web applications, robust APIs, and fluid user interfaces powering AIREV Emerging Center’s digital operations.',
    technicalFocusAreas: [
      {
        topic: 'React 19 & Modern Component Lifecycle',
        importance: 'Critical',
        tips: 'Master Server Components, optimistic UI updates, custom hooks, and Tailwind CSS responsive architecture.'
      },
      {
        topic: 'Node.js Express & PostgreSQL Optimization',
        importance: 'High',
        tips: 'Focus on connection pooling, indexing, secure token authentication, and RESTful API contract design.'
      },
      {
        topic: 'Security & Enterprise Performance',
        importance: 'High',
        tips: 'Understand CORS, CSRF protection, rate limiting, and bundle size reduction.'
      }
    ],
    sampleQuestions: [
      {
        question: 'How do you optimize state management and avoid unnecessary re-renders in a complex React dashboard?',
        category: 'Frontend Architecture',
        whatEvaluatorsLookFor: 'Component memoization, custom hooks, atomic state management, and separation of UI and business logic.',
        idealAnswerBlueprint: 'Discuss state colocation, keeping state close to where it is used, utilizing useMemo/useCallback appropriately, and leveraging optimistic updates.'
      }
    ],
    corporateEthicsAndCultureTips: [
      'Clean Code & Documentation: Maintain readable, well-commented modules and adhere to shared linting rules.',
      'On-site Reliability: Respect core working hours and sprint commitments at our Karachi center.',
      'Constructive Teamwork: Approach code reviews with empathy and a collaborative mindset.'
    ],
    dosAndDonts: {
      dos: ['Showcase real web projects with responsive design and clean API integrations.', 'Highlight proficiency with TypeScript.'],
      donts: ['Avoid inline styles and unhandled promise rejections.', 'Do not neglect accessible UI design.']
    },
    recommendedStudyTopics: [
      { title: 'Modern React 19 Patterns', description: 'Server Actions, Actions hooks, and form state management.' },
      { title: 'Express & PostgreSQL Performance', description: 'Indexing, query optimization, and connection pooling.' }
    ]
  };
}

function generateHeuristicResumeSummary(name?: string, jobTitle?: string, resumeText?: string) {
  const candidateName = name || 'Candidate';
  const role = jobTitle || 'Engineering Specialist';
  const text = resumeText || '';
  
  if (role.toLowerCase().includes('deliverability') || text.toLowerCase().includes('dmarc') || text.toLowerCase().includes('smtp')) {
    return {
      executiveSnapshot: `${candidateName} brings extensive hands-on experience architecting high-volume outbound email infrastructure, domain warmups, and automated lead enrichment pipelines.`,
      relevantSkills: ['SPF/DKIM/DMARC (p=reject)', 'BIMI & DNS Routing', 'Clay & Apollo Waterfall', 'Postfix/SMTP Relays', 'Postmaster Analytics'],
      scaleAndMilestones: [
        'Scaled outbound clusters to 2M+ monthly sends sustaining 98%+ primary inbox placement',
        'Built automated domain-burn circuit breakers to throttle traffic when bounce rates exceed 1%'
      ],
      educationAndCredentials: 'B.S. in Computer Science or equivalent operational industry mastery with Cloudflare & DNS certifications',
      recruiterQuickVerdict: 'Strong technical fit for senior/lead email infrastructure and deliverability roles.'
    };
  }

  return {
    executiveSnapshot: `${candidateName} is an experienced software and systems practitioner demonstrating proven delivery across modern application stacks and AI pipelines.`,
    relevantSkills: ['TypeScript / Node.js', 'PostgreSQL & pgvector', 'LLM Prompt Architecture', 'System Design & APIs', 'Docker / CI/CD'],
    scaleAndMilestones: [
      'Engineered low-latency production pipelines maintaining sub-second P95 performance',
      'Implemented automated evaluation benchmarks and regression testing suites'
    ],
    educationAndCredentials: 'Degree in Computer Science or Software Engineering with specialized AI/ML coursework',
    recruiterQuickVerdict: 'Promising profile with well-rounded full-stack and systems engineering fundamentals.'
  };
}

// Real-time dynamic interview questions initialization
app.post('/api/screen/init', async (req: Request, res: Response) => {
  try {
    const { jobTitle, jobRequirements, candidateName, resumeText } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback with intelligent domain-specific question templates
      return res.json({
        success: true,
        source: 'fallback',
        questions: generateFallbackQuestions(jobTitle)
      });
    }

    const prompt = `You are a Lead Talent Assessor and Chief Interview Architect conducting a first-round technical and situational screening for the position: "${jobTitle}".
Job Requirements:
${jobRequirements || 'Domain competency, problem solving, system scale, and high-impact execution'}

Candidate Profile:
Name: ${candidateName || 'Candidate'}
Resume Summary / Extracted Text:
${(resumeText || 'Experienced practitioner applying for the role').slice(0, 3000)}

Generate exactly 5 targeted, highly relevant interview questions tailored to their resume and this role:
1. One Icebreaker / Background deep dive regarding their proudest scaling milestone.
2. Two deep Technical Competency / Domain Mastery questions (e.g. for Deliverability: SPF/DKIM/DMARC, custom bounce handling, IP warmup, or Apollo/Clay enrichment; for AI: evals, prompt engineering, RAG latency).
3. One Situational Judgment / Crisis Resolution question (e.g. deliverability sudden drop to spam, production LLM hallucination).
4. One Forward-Looking / Architecture Problem-Solving question.

Respond ONLY with valid JSON in this exact structure:
{
  "questions": [
    {
      "id": 1,
      "category": "Experience & Scale",
      "question": "text",
      "competencyFocus": "Brief focus note",
      "idealAnswerKeywords": ["keyword1", "keyword2"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      source: 'gemini',
      questions: parsed.questions || generateFallbackQuestions(jobTitle)
    });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.json({
      success: true,
      source: 'fallback-error',
      questions: generateFallbackQuestions(req.body?.jobTitle || 'Lead Growth Engineer')
    });
  }
});

// Dynamic interview conversational follow-up / validation
app.post('/api/screen/converse', async (req: Request, res: Response) => {
  try {
    const { question, candidateAnswer, questionIndex, totalQuestions, jobTitle } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        needsFollowUp: candidateAnswer.trim().split(/\s+/).length < 20,
        followUpQuestion: candidateAnswer.trim().split(/\s+/).length < 20
          ? "Could you elaborate with specific metrics or tools you utilized in that scenario?"
          : null,
        acknowledgement: "Thank you for sharing those details. Let's move to the next area."
      });
    }

    const prompt = `You are an AI Screening Agent interviewing a candidate for ${jobTitle}.
Current Question (${questionIndex + 1} of ${totalQuestions}): "${question}"
Candidate's Answer: "${candidateAnswer}"

Analyze if this answer is too vague, evasive, or lacks concrete detail (less than 20 words or devoid of specifics).
If it is too vague or lacks depth, flag needsFollowUp: true and provide a sharp, respectful single follow-up question asking for concrete tools, metrics, or specifics.
If the answer is sufficient and detailed, flag needsFollowUp: false, and provide a 1-sentence professional acknowledgement.

Respond ONLY with valid JSON:
{
  "needsFollowUp": boolean,
  "followUpQuestion": string | null,
  "acknowledgement": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      needsFollowUp: Boolean(parsed.needsFollowUp),
      followUpQuestion: parsed.followUpQuestion || null,
      acknowledgement: parsed.acknowledgement || 'Thank you, insightful response.'
    });
  } catch (error: any) {
    console.error('Converse error:', error);
    return res.json({
      success: true,
      needsFollowUp: false,
      followUpQuestion: null,
      acknowledgement: 'Recorded. Let us continue with the next assessment point.'
    });
  }
});

// Candidate Scoring & Auto-generated scorecard
app.post('/api/screen/evaluate', async (req: Request, res: Response) => {
  try {
    const { jobTitle, candidateName, resumeText, transcript } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'heuristic',
        scorecard: generateHeuristicScorecard(jobTitle, transcript)
      });
    }

    const prompt = `You are the Principal AI Talent Evaluator. Evaluate this candidate based on their interview transcript and background for the role: "${jobTitle}".
Candidate: ${candidateName}
Resume Summary: ${(resumeText || '').slice(0, 1500)}

Interview Transcript:
${JSON.stringify(transcript, null, 2)}

Provide an objective, calibrated assessment evaluating:
1. Skills Match Score (0 - 100) based on role requirements.
2. Technical & Domain Competency Score (0 - 100).
3. Problem Solving & Communication Score (0 - 100).
4. Overall Match Score (0 - 100).
5. Recommendation: Exactly one of "SHORTLIST", "HOLD", or "REJECT".
6. Executive Summary: 2-3 sentences synthesizing their background and interview performance.
7. Strengths: Array of 3-4 bullet points highlighting demonstrated expertise, metrics, or tools.
8. Risks / Red Flags: Array of 1-3 bullet points noting gaps, vagueness, or areas requiring deeper technical validation in round 2.
9. Recommended Human Interview Focus Areas: 2-3 specific technical probing questions for the hiring manager.

Respond ONLY with valid JSON in this exact structure:
{
  "skillsMatchScore": number,
  "technicalScore": number,
  "problemSolvingScore": number,
  "overallScore": number,
  "recommendation": "SHORTLIST" | "HOLD" | "REJECT",
  "executiveSummary": "string",
  "strengths": ["string", "string"],
  "risks": ["string"],
  "recommendedHumanQuestions": ["string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      scorecard: {
        skillsMatchScore: parsed.skillsMatchScore || 82,
        technicalScore: parsed.technicalScore || 85,
        problemSolvingScore: parsed.problemSolvingScore || 80,
        overallScore: parsed.overallScore || 83,
        recommendation: parsed.recommendation || 'SHORTLIST',
        executiveSummary: parsed.executiveSummary || 'Candidate demonstrates robust domain expertise with clear technical communication.',
        strengths: parsed.strengths || ['Solid architecture knowledge', 'Practical scaling experience'],
        risks: parsed.risks || ['Could provide deeper metrics on edge-case failure modes'],
        recommendedHumanQuestions: parsed.recommendedHumanQuestions || ['Inquire about specific distributed system failure handling.']
      }
    });
  } catch (error: any) {
    console.error('Evaluation error:', error);
    return res.json({
      success: true,
      source: 'heuristic-fallback',
      scorecard: generateHeuristicScorecard(req.body?.jobTitle || 'Lead Growth Engineer', req.body?.transcript || [])
    });
  }
});

function generateFallbackQuestions(jobTitle: string) {
  if (jobTitle.toLowerCase().includes('deliverability') || jobTitle.toLowerCase().includes('growth')) {
    return [
      {
        id: 1,
        category: 'Scale & Architecture',
        question: 'Could you walk us through the largest outbound cold email or messaging infrastructure you have designed or managed, including volume (daily/monthly) and server architecture?',
        competencyFocus: 'Infrastructure Scale & Volume',
        idealAnswerKeywords: ['SMTP clusters', '100k+/day', 'dedicated IPs', 'Postmaster']
      },
      {
        id: 2,
        category: 'Deliverability & Protocols',
        question: 'How do you configure and monitor SPF, DKIM, DMARC (with p=reject), and BIMI across dozens of secondary domains to prevent domain burn and ensure 98%+ inbox placement?',
        competencyFocus: 'Authentication Protocols & Inbox Placement',
        idealAnswerKeywords: ['DMARC alignment', 'DKIM 2048-bit', 'Google Postmaster', 'Mailreach']
      },
      {
        id: 3,
        category: 'Data Enrichment & Tooling',
        question: 'What modern data enrichment and scraping toolchain (e.g., Clay, Apollo, Waterfall enrichment, custom headless scrapers) do you deploy to maximize verified phone and email fill rates?',
        competencyFocus: 'Data Enrichment & Toolchain',
        idealAnswerKeywords: ['Clay tables', 'Apollo API', 'MillionVerifier', 'Waterfall logic']
      },
      {
        id: 4,
        category: 'Situational Crisis Resolution',
        question: 'Suppose your primary sender domain suddenly drops from 95% to 40% inbox placement on Google Workspace recipients overnight. What is your immediate 4-step triage protocol?',
        competencyFocus: 'Incident Triage & Remediation',
        idealAnswerKeywords: ['Halt sends', 'Postmaster check', 'spam complaint spike', 'IP rotation']
      },
      {
        id: 5,
        category: 'Execution & Ethics',
        question: 'How do you strike the balance between hyper-aggressive campaign scaling and strict CAN-SPAM / GDPR compliance with opt-out mechanisms?',
        competencyFocus: 'Compliance & Governance',
        idealAnswerKeywords: ['List hygiene', 'physical address', 'unsubscribe header', 'GDPR consent']
      }
    ];
  }

  // Default AI/Software Engineer fallback
  return [
    {
      id: 1,
      category: 'System Architecture',
      question: 'Can you describe the most complex production system or AI pipeline you built from scratch, detailing the architecture and key technical trade-offs you navigated?',
      competencyFocus: 'Architecture & Technical Trade-offs',
      idealAnswerKeywords: ['Microservices', 'latency', 'caching', 'PostgreSQL']
    },
    {
      id: 2,
      category: 'Domain Competency',
      question: 'How do you structure LLM or backend evaluation pipelines to detect regressions, latency spikes, or schema deviations before hitting production?',
      competencyFocus: 'Testing, Evals & Reliability',
      idealAnswerKeywords: ['Golden datasets', 'structured outputs', 'P99 latency', 'CI/CD evals']
    },
    {
      id: 3,
      category: 'Data & Performance',
      question: 'When optimizing high-throughput APIs or complex database queries under heavy load, what profiling tools and caching strategies do you rely on?',
      competencyFocus: 'High Throughput & Database Tuning',
      idealAnswerKeywords: ['Redis', 'connection pooling', 'EXPLAIN ANALYZE', 'indexes']
    },
    {
      id: 4,
      category: 'Situational Judgment',
      question: 'Tell us about a time a major release or external dependency caused unexpected downtime. How did you diagnose, mitigate, and post-mortem the event?',
      competencyFocus: 'Incident Response & Post-Mortem',
      idealAnswerKeywords: ['Circuit breaker', 'rollback', 'observability', 'RCA']
    },
    {
      id: 5,
      category: 'Collaboration & Leadership',
      question: 'How do you mentor engineers and establish technical excellence when working in fast-paced startup velocity?',
      competencyFocus: 'Engineering Culture & Mentorship',
      idealAnswerKeywords: ['Code reviews', 'RFCs', 'pair programming', 'clear documentation']
    }
  ];
}

function generateHeuristicScorecard(jobTitle: string, transcript: any[]) {
  const answeredCount = Array.isArray(transcript) ? transcript.filter(t => t.answer && t.answer.trim().length > 10).length : 0;
  const avgLength = Array.isArray(transcript) && answeredCount > 0
    ? transcript.reduce((acc, t) => acc + (t.answer ? t.answer.split(/\s+/).length : 0), 0) / answeredCount
    : 0;

  let baseScore = 75;
  if (avgLength > 40) baseScore += 12;
  if (answeredCount >= 4) baseScore += 5;

  const skillsMatchScore = Math.min(96, Math.max(68, baseScore + 2));
  const technicalScore = Math.min(98, Math.max(65, baseScore + 4));
  const problemSolvingScore = Math.min(95, Math.max(60, baseScore - 3));
  const overallScore = Math.round((skillsMatchScore * 0.4) + (technicalScore * 0.4) + (problemSolvingScore * 0.2));

  const recommendation = overallScore >= 80 ? 'SHORTLIST' : (overallScore >= 70 ? 'HOLD' : 'REJECT');

  return {
    skillsMatchScore,
    technicalScore,
    problemSolvingScore,
    overallScore,
    recommendation,
    executiveSummary: `Candidate completed structured first-round screening for ${jobTitle} answering ${answeredCount} core questions with an average detail depth of ${Math.round(avgLength)} words per response.`,
    strengths: [
      'Comprehensive understanding of core production requirements and tooling',
      'Demonstrated methodical problem breakdown during crisis scenario',
      'Clear articulation of architecture trade-offs and scaling constraints'
    ],
    risks: [
      'Further probe on hands-on edge-case remediation and distributed debugging in round 2'
    ],
    recommendedHumanQuestions: [
      'Deep dive into real-world P99 latency bottlenecks experienced on their past major project',
      'Verify their direct hands-on configuration experience with automated CI/CD failovers'
    ]
  };
}

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AIREV Emerging Center Portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
