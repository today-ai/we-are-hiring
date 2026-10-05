export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
  experienceLevel: 'Mid' | 'Senior' | 'Lead' | 'Staff';
  salaryRange: string;
  shortDescription: string;
  responsibilities: string[];
  requirements: string[];
  domainCompetencies: string[];
  perks: string[];
  techStack: string[];
  openPositions: number;
}

export interface ResumeAiSummary {
  executiveSnapshot: string;
  relevantSkills: string[];
  scaleAndMilestones: string[];
  educationAndCredentials: string;
  recruiterQuickVerdict: string;
}

export interface TechnicalFocusArea {
  topic: string;
  importance: 'Foundational' | 'High' | 'Critical';
  tips: string;
}

export interface PrepSampleQuestion {
  question: string;
  category: string;
  whatEvaluatorsLookFor: string;
  idealAnswerBlueprint: string;
}

export interface CandidatePrepKit {
  roleOverview: string;
  technicalFocusAreas: TechnicalFocusArea[];
  sampleQuestions: PrepSampleQuestion[];
  corporateEthicsAndCultureTips: string[];
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
  recommendedStudyTopics: Array<{
    title: string;
    description: string;
  }>;
}

export interface MockAnswerFeedback {
  score: number;
  readinessVerdict: string;
  strengths: string[];
  improvements: string[];
  revisedExampleSnippet: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  whatsappAvailable?: boolean;
  city?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  role: 'admin' | 'portal_manager' | 'recruiter' | 'candidate';
  isPortalManager?: boolean;
  permissions?: string[];
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface CalendarSlot {
  id: string;
  date: string;
  timeSlot: string;
  interviewType: 'AI Autonomous Screening' | 'Technical Deep-Dive' | 'System Architecture Whiteboard' | 'Hiring Manager Sync';
  interviewerName: string;
  interviewerRole: string;
  isBooked: boolean;
  bookedByEmail?: string;
}

export interface CandidateApplication {
  id: string;
  jobId: string;
  candidateUid?: string;
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  yearsOfExperience: number;
  resumeFileName: string;
  resumeFileSize: string;
  resumeText: string;
  resumeAiSummary?: ResumeAiSummary;
  coverLetter?: string;
  appliedAt: string;
  status: 'Applied' | 'Screening' | 'Evaluated' | 'Shortlisted' | 'Hold' | 'Scheduled' | 'Rejected';
  scorecard?: CandidateScorecard;
  transcript?: InterviewTurn[];
  scheduledInterview?: ScheduledInterview;
  recruiterNotes?: string;
}

export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  competencyFocus: string;
  idealAnswerKeywords?: string[];
}

export interface InterviewTurn {
  questionId: number;
  category: string;
  question: string;
  answer: string;
  followUpQuestion?: string | null;
  followUpAnswer?: string | null;
  timestamp: string;
}

export interface CandidateScorecard {
  skillsMatchScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  overallScore: number;
  recommendation: 'SHORTLIST' | 'HOLD' | 'REJECT';
  executiveSummary: string;
  strengths: string[];
  risks: string[];
  recommendedHumanQuestions: string[];
  evaluatedAt: string;
}

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewType: 'Technical Deep-Dive' | 'System Architecture Whiteboard' | 'Hiring Manager Sync' | 'Culture & Values';
  interviewerName: string;
  interviewerRole: string;
  date: string;
  timeSlot: string;
  timezone: string;
  meetingLink: string;
  calendarInviteSent: boolean;
}

export interface EmailConfiguration {
  mode: 'default' | 'external';
  senderEmail: string;
  senderName: string;
  replyToEmail: string;
  provider: 'brevo' | 'resend';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EmailDispatchLog {
  id: string;
  to: string;
  from?: string;
  replyTo?: string;
  recipientName: string;
  subject: string;
  type: 'application_acknowledgement' | 'screening_invitation' | 'interview_confirmed' | 'rejection_notice' | 'test_dispatch';
  timestamp: string;
  contentHtml: string;
  status: 'Delivered' | 'Queued' | 'Opened';
  providerUsed?: string;
}
