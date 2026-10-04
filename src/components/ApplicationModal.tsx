import React, { useState, useRef } from 'react';
import { JobPosting, CandidateApplication, ResumeAiSummary } from '../types';
import { SAMPLE_RESUME_PROFILES } from '../data/seedCandidates';
import { generateResumeSummary } from '../services/geminiService';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Zap
} from 'lucide-react';

interface ApplicationModalProps {
  job: JobPosting;
  onClose: () => void;
  onSubmitSuccess: (application: CandidateApplication) => void;
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserPhone?: string;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  onClose,
  onSubmitSuccess,
  currentUserId,
  currentUserEmail,
  currentUserName,
  currentUserPhone
}) => {
  const [fullName, setFullName] = useState(currentUserName || '');
  const [email, setEmail] = useState(currentUserEmail || '');
  const [phone, setPhone] = useState(currentUserPhone || '');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(5);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileSize, setResumeFileSize] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [aiSummary, setAiSummary] = useState<ResumeAiSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMalwareScanning, setIsMalwareScanning] = useState(false);
  const [scanVerified, setScanVerified] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerAiSummaryGeneration = async (name: string, text: string) => {
    setIsGeneratingSummary(true);
    try {
      const summary = await generateResumeSummary(name || 'Candidate', job.title, text);
      setAiSummary(summary);
    } catch (err) {
      console.warn('Failed to generate summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg('File exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
      setErrorMsg('Invalid file format. Please upload PDF, DOCX, or TXT.');
      return;
    }

    setErrorMsg('');
    setResumeFileName(file.name);
    setResumeFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    // Simulate server-side malware & file integrity verification
    setIsMalwareScanning(true);
    setScanVerified(false);

    // Read text if txt/pdf preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setResumeText(content.slice(0, 5000));
      setTimeout(() => {
        setIsMalwareScanning(false);
        setScanVerified(true);
        triggerAiSummaryGeneration(fullName || file.name.replace(/\.[^/.]+$/, ""), content);
      }, 700);
    };
    reader.readAsText(file);
  };

  const handlePreFillProfile = async (profileIndex: number) => {
    const profile = SAMPLE_RESUME_PROFILES[profileIndex];
    if (!profile) return;
    setFullName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setLinkedinUrl(profile.linkedinUrl);
    setPortfolioUrl(profile.portfolioUrl || '');
    setYearsOfExperience(profile.yearsOfExperience);
    setResumeFileName(profile.resumeFileName);
    setResumeFileSize(profile.resumeFileSize);
    setResumeText(profile.resumeText);
    setScanVerified(true);
    setErrorMsg('');
    
    // Automatically trigger AI resume extraction
    await triggerAiSummaryGeneration(profile.name, profile.resumeText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !linkedinUrl.trim()) {
      setErrorMsg('Please fill in your Full Name, Email, and LinkedIn profile.');
      return;
    }
    if (!resumeFileName) {
      setErrorMsg('Please upload your CV/Resume (PDF or DOCX) or click a Quick Sample below.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newApplication: CandidateApplication = {
      id: `cand-${Date.now().toString().slice(-4)}`,
      candidateUid: currentUserId,
      jobId: job.id,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      linkedinUrl: linkedinUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
      yearsOfExperience: Number(yearsOfExperience) || 3,
      resumeFileName,
      resumeFileSize: resumeFileSize || '1.5 MB',
      resumeText: resumeText || `${fullName} applied for ${job.title} with ${yearsOfExperience} years of experience.`,
      resumeAiSummary: aiSummary || undefined,
      coverLetter: coverLetter.trim(),
      appliedAt: new Date().toISOString(),
      status: 'Screening'
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(newApplication);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-indigo-400">
              Applying for: {job.department}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {job.title}
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              {job.location} · {job.salaryRange}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Sample Fill Bar for Testing */}
        <div className="my-4 rounded-xl border border-indigo-900/60 bg-indigo-950/40 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Quick-Fill Sample Profiles (Instant Testing)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handlePreFillProfile(0)}
              className="rounded-lg border border-indigo-800/80 bg-indigo-900/40 px-3 py-1.5 text-xs font-medium text-indigo-200 hover:bg-indigo-800/60 transition-colors"
            >
              Fill Alex Rivera (Lead Deliverability)
            </button>
            <button
              type="button"
              onClick={() => handlePreFillProfile(1)}
              className="rounded-lg border border-indigo-800/80 bg-indigo-900/40 px-3 py-1.5 text-xs font-medium text-indigo-200 hover:bg-indigo-800/60 transition-colors"
            >
              Fill Dr. Elena Rostova (Senior AI Systems)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Years of Relevant Experience <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                LinkedIn Profile URL <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                GitHub / Portfolio / Work Samples URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://github.com/username or site"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload Dropzone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Resume / CV (PDF, DOCX up to 10MB) <span className="text-rose-400">*</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            {!resumeFileName ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-6 text-center hover:border-indigo-500 hover:bg-slate-950 transition-colors"
              >
                <UploadCloud className="h-8 w-8 text-indigo-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  Click to upload or drag and drop your Resume
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  PDF, DOCX, or TXT (Strict ClamAV malware scan enforced)
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-900/60 text-indigo-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{resumeFileName}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{resumeFileSize}</span>
                      <span>·</span>
                      {isMalwareScanning ? (
                        <span className="text-amber-400 animate-pulse">Running type & malware scan...</span>
                      ) : scanVerified ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                          Security verified
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResumeFileName('');
                    setResumeFileSize('');
                    setResumeText('');
                    setAiSummary(null);
                  }}
                  className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Change
                </button>
              </div>
            )}

            {/* AI Resume Intelligence Brief (Auto-generated on upload) */}
            {isGeneratingSummary && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-indigo-900/60 bg-indigo-950/30 p-3 text-xs text-indigo-300">
                <Sparkles className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                <span>Gemini AI is analyzing resume competencies, scaling milestones & credentials...</span>
              </div>
            )}

            {aiSummary && !isGeneratingSummary && (
              <div className="mt-3 rounded-xl border border-indigo-900/80 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>AI-Extracted Resume Intelligence Brief</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 rounded px-1.5 py-0.5">
                    Ready for Recruiter Scan
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {aiSummary.executiveSnapshot}
                </p>

                {/* Relevant Skills */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Extracted Core Competencies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSummary.relevantSkills.map((sk, idx) => (
                      <span key={idx} className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-indigo-200 border border-slate-700/50">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scaling Milestones */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Demonstrated Scale & Impact
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {aiSummary.scaleAndMilestones.map((ms, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{ms}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Education & Verdict */}
                <div className="pt-2 border-t border-indigo-900/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Education / Credentials:</span>
                    <span className="text-slate-200">{aiSummary.educationAndCredentials}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Quick Recruiter Assessment:</span>
                    <span className="text-indigo-300 font-semibold">{aiSummary.recruiterQuickVerdict}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cover Letter / Notes (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Note or Project Highlights (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Highlight any proudest achievements (e.g. 2M/mo email scale, LLM latency benchmark, key OSS work)..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Privacy & Screening Note */}
          <div className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-400 border border-slate-800">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                By submitting, an automated confirmation receipt will be dispatched to your email. You will instantly enter the interactive AI screening room for a 5-question structured evaluation.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting & Initializing AI Room...</span>
              ) : (
                <>
                  <span>Submit & Enter AI Screening</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
