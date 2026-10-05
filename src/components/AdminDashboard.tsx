import React, { useState } from 'react';
import { CandidateApplication, JobPosting, CandidateScorecard, UserProfile, EmailConfiguration, EmailDispatchLog } from '../types';
import { HiringAnalytics } from './HiringAnalytics';
import { EmailConfigurationPanel } from './EmailConfigurationPanel';
import { 
  Users, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronRight, 
  Award, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  X, 
  BarChart3, 
  TrendingUp, 
  LayoutList,
  Shield,
  Trash2,
  PlusCircle,
  Check,
  RotateCcw,
  FileSpreadsheet,
  Mail
} from 'lucide-react';

interface AdminDashboardProps {
  candidates: CandidateApplication[];
  jobs: JobPosting[];
  currentUser?: UserProfile | null;
  emailConfig: EmailConfiguration;
  onUpdateCandidateStatus: (candidateId: string, newStatus: CandidateApplication['status'], notes?: string) => void;
  onScheduleInterview: (candidate: CandidateApplication) => void;
  onDeleteCandidate?: (candidateId: string) => void;
  onAddNewJob?: (job: JobPosting) => void;
  onSaveEmailConfig: (config: EmailConfiguration) => Promise<void>;
  onSendTestEmail?: (email: EmailDispatchLog) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  candidates,
  jobs,
  currentUser,
  emailConfig,
  onUpdateCandidateStatus,
  onScheduleInterview,
  onDeleteCandidate,
  onAddNewJob,
  onSaveEmailConfig,
  onSendTestEmail
}) => {
  const [dashboardTab, setDashboardTab] = useState<'pipeline' | 'analytics' | 'emailConfig'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'transcript' | 'resume'>('scorecard');
  const [recruiterNoteText, setRecruiterNoteText] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // New Job Modal state
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Artificial Intelligence & Emerging Systems');
  const [newJobSalary, setNewJobSalary] = useState('110,000 – 145,000 PKR / month');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobTech, setNewJobTech] = useState('Python, TypeScript, Gemini SDK, PostgreSQL');

  const isPortalManager = Boolean(
    currentUser?.isPortalManager || 
    currentUser?.role === 'admin' ||
    currentUser?.email === 'airev.pk@gmail.com' ||
    currentUser?.email === 'shakeelsaeedofficial@gmail.com'
  );

  const filteredCandidates = candidates.filter((c) => {
    const job = jobs.find((j) => j.id === c.jobId);
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job && job.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalCount = candidates.length;
  const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;
  const inScreeningCount = candidates.filter((c) => c.status === 'Screening').length;
  const scheduledCount = candidates.filter((c) => c.status === 'Scheduled').length;

  const downloadTranscript = (candidate: CandidateApplication) => {
    const data = {
      candidate: {
        id: candidate.id,
        name: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        appliedAt: candidate.appliedAt,
        status: candidate.status
      },
      scorecard: candidate.scorecard,
      transcript: candidate.transcript || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.fullName.replace(/\s+/g, '_')}_AI_Screening_Transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Candidate Name', 'Email', 'Phone', 'Role', 'Status', 'Overall Match %', 'Technical Score %', 'Applied Date'];
    const rows = candidates.map((c) => [
      c.id,
      `"${c.fullName}"`,
      c.email,
      c.phone || '',
      `"${jobs.find(j => j.id === c.jobId)?.title || 'Open Role'}"`,
      c.status,
      c.scorecard?.overallScore || 'N/A',
      c.scorecard?.technicalScore || 'N/A',
      new Date(c.appliedAt).toISOString().split('T')[0]
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIREV_Talent_Pipeline_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    const newJob: JobPosting = {
      id: `airev-custom-${Date.now().toString().slice(-4)}`,
      title: newJobTitle,
      department: newJobDept,
      location: 'Karachi, Pakistan (On-Site)',
      type: 'Full-time',
      experienceLevel: 'Senior',
      salaryRange: newJobSalary,
      shortDescription: newJobDesc || `Exciting on-site career opening for ${newJobTitle} at AIREV Emerging Center Karachi.`,
      responsibilities: [
        'Deliver high-quality software engineering artifacts aligned with corporate job ethics.',
        'Collaborate on-site with cross-functional AI architects and engineering leads in Karachi.',
        'Ensure code maintainability, clean unit tests, and rigorous peer review standards.'
      ],
      requirements: [
        'Demonstrated practical experience in the specified domain technology stack.',
        'Strong problem-solving capability, punctuality, and professional workplace communication.',
        'Availability for full-time on-site work at Karachi Emerging Center.'
      ],
      domainCompetencies: newJobTech.split(',').map(s => s.trim()).filter(Boolean),
      perks: [
        `Competitive package (${newJobSalary}) with 1st-of-month bank direct deposit`,
        'Modern Karachi facility with 24/7 generator backup and dual fiber internet',
        'Health insurance coverage and paid festival leaves'
      ],
      techStack: newJobTech.split(',').map(s => s.trim()).filter(Boolean),
      openPositions: 1
    };

    onAddNewJob?.(newJob);
    setIsAddJobOpen(false);
    setNewJobTitle('');
    setNewJobDesc('');
  };

  const getJobTitle = (jobId: string) => {
    return jobs.find((j) => j.id === jobId)?.title || 'Open Role';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Portal Manager Banner */}
      <div className="rounded-xl border border-blue-600/40 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-orange-400">
                Portal Manager Command & Controls
              </span>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-800/60">
                Full Power Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Authorized Admins: <strong className="text-white">airev.pk@gmail.com</strong> & <strong className="text-white">shakeelsaeedofficial@gmail.com</strong>
            </p>
          </div>
        </div>

        {/* Manager Power Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddJobOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition-all"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Post Karachi Vacancy</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dashboard Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>Recruitment Command Center</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">AIREV Talent Pipeline & Intelligence</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate tracking, AI screening scorecards, and interactive analytics
          </p>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 shadow-sm">
          <button
            onClick={() => setDashboardTab('pipeline')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              dashboardTab === 'pipeline'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutList className="h-4 w-4" />
            <span>Candidate Pipeline ({candidates.length})</span>
          </button>

          <button
            onClick={() => setDashboardTab('analytics')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              dashboardTab === 'analytics'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-orange-400" />
            <span>Hiring Metrics & Analytics</span>
            <span className="rounded bg-orange-950 px-1.5 py-0.5 text-[10px] font-bold text-orange-300 border border-orange-800/60">
              Recharts
            </span>
          </button>

          <button
            onClick={() => setDashboardTab('emailConfig')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              dashboardTab === 'emailConfig'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="h-4 w-4 text-emerald-400" />
            <span>Email Configuration</span>
            <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/60">
              {emailConfig.mode === 'default' ? 'airev.pk' : emailConfig.provider.toUpperCase()}
            </span>
          </button>
        </div>
      </div>

      {/* Render Analytics or Email Config or Candidate Pipeline Tab */}
      {dashboardTab === 'analytics' ? (
        <HiringAnalytics candidates={candidates} jobs={jobs} />
      ) : dashboardTab === 'emailConfig' ? (
        <EmailConfigurationPanel
          config={emailConfig}
          onSaveConfig={onSaveEmailConfig}
          onSendTestEmail={onSendTestEmail}
        />
      ) : (
        /* Render Candidate Pipeline Tab */
        <>
          {/* Top summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Candidates</span>
                <Users className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{totalCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">On-site Karachi vacancies</div>
            </div>

            <div className="rounded-xl border border-emerald-950/60 bg-emerald-950/20 p-5">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>AI Shortlisted</span>
                <Award className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-300 mt-2">{shortlistedCount}</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">Qualified for round 2 on-site</div>
            </div>

            <div className="rounded-xl border border-indigo-950/60 bg-indigo-950/20 p-5">
              <div className="flex items-center justify-between text-xs text-indigo-400">
                <span>Active Screenings</span>
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-300 mt-2">{inScreeningCount}</div>
              <div className="text-[11px] text-indigo-400/80 mt-1">Autonomous assessments in progress</div>
            </div>

            <div className="rounded-xl border border-sky-950/60 bg-sky-950/20 p-5">
              <div className="flex items-center justify-between text-xs text-sky-400">
                <span>Interviews Booked</span>
                <Calendar className="h-4 w-4 text-sky-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-sky-300 mt-2">{scheduledCount}</div>
              <div className="text-[11px] text-sky-400/80 mt-1">Confirmed calendar invites</div>
            </div>
          </div>

          {/* Filter and Candidate Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            {/* Table header controls with prominent text-based search bar */}
            <div className="p-4 sm:p-6 border-b border-slate-800 space-y-4 bg-gradient-to-b from-slate-900/90 to-slate-950/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <span>Candidate Screening Pipeline</span>
                    <span className="rounded-full bg-blue-500/20 text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-500/40">
                      Showing {filteredCandidates.length} of {candidates.length} Applicants
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search and filter applicants by candidate name, verified email address, or applied job title
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 self-start sm:self-auto"
                  >
                    <span>Clear Search</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Text-Based Search Input Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search applicants by name (e.g. Bilal), email (e.g. candidate@domain.com), or job role (e.g. AI Systems)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    title="Clear search text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Segmented Filter Bar and Quick Search Chips */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                {/* Status Filter Tabs */}
                <div className="flex items-center overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-1">
                  {['All', 'Shortlisted', 'Evaluated', 'Hold', 'Scheduled', 'Rejected'].map((status) => {
                    const count = status === 'All' 
                      ? candidates.length 
                      : candidates.filter(c => c.status === status).length;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                          statusFilter === status
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{status}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          statusFilter === status ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Search Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
                  <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Quick Filter:</span>
                  {jobs.slice(0, 3).map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSearchQuery(job.title.split(' ')[0])}
                      className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 hover:border-slate-700 hover:text-white transition-colors shrink-0 truncate max-w-[130px]"
                      title={`Filter by ${job.title}`}
                    >
                      {job.title}
                    </button>
                  ))}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] text-orange-400 hover:underline shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Candidate</th>
                    <th className="py-3.5 px-4 font-semibold">Applied Role</th>
                    <th className="py-3.5 px-4 font-semibold">Overall Match</th>
                    <th className="py-3.5 px-4 font-semibold">Technical Score</th>
                    <th className="py-3.5 px-4 font-semibold">AI Recommendation</th>
                    <th className="py-3.5 px-4 font-semibold">Pipeline Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Manager Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 px-4 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
                            <Search className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="text-sm font-bold text-white">
                            No applicants found matching &ldquo;{searchQuery || statusFilter}&rdquo;
                          </div>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Try searching with partial candidate name, email address, or job title keywords.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('All');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset Search & Filters</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => {
                      const scorecard = candidate.scorecard;
                      return (
                        <tr
                          key={candidate.id}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setRecruiterNoteText(candidate.recruiterNotes || '');
                          }}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{candidate.fullName}</div>
                            <div className="text-[11px] text-slate-400">{candidate.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200">{getJobTitle(candidate.jobId)}</div>
                            <div className="text-[11px] text-slate-500">{candidate.yearsOfExperience} yrs exp</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {scorecard ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {scorecard.overallScore}%
                                </span>
                                <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${scorecard.overallScore}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Screening...</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {scorecard ? (
                              <span className="font-semibold text-emerald-400">
                                {scorecard.technicalScore}%
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {scorecard ? (
                              <span className={`font-semibold ${
                                scorecard.recommendation === 'SHORTLIST'
                                  ? 'text-emerald-400'
                                  : (scorecard.recommendation === 'HOLD' ? 'text-amber-400' : 'text-rose-400')
                              }`}>
                                {scorecard.recommendation}
                              </span>
                            ) : (
                              <span className="text-slate-500">In Progress</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`font-medium px-2 py-0.5 rounded text-[11px] ${
                              candidate.status === 'Shortlisted' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                              candidate.status === 'Scheduled' ? 'bg-sky-950 text-sky-300 border border-sky-800/60' :
                              candidate.status === 'Rejected' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {candidate.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setRecruiterNoteText(candidate.recruiterNotes || '');
                                }}
                                className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                              >
                                Manage Dossier
                              </button>

                              {onDeleteCandidate && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Portal Manager Confirmation:\nAre you sure you want to permanently delete candidate ${candidate.fullName} from Firestore?`)) {
                                      onDeleteCandidate(candidate.id);
                                    }
                                  }}
                                  title="Delete candidate from Firestore"
                                  className="rounded p-1 text-slate-500 hover:bg-rose-950 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Selected Candidate Detailed Modal / Drawer with Manager Controls */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              {/* Header profile info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{selectedCandidate.fullName}</h2>
                    <span className="rounded bg-blue-950 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-800/60">
                      {selectedCandidate.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-y-1 gap-x-3">
                    <span>{selectedCandidate.email}</span>
                    <span>·</span>
                    <span>{selectedCandidate.phone}</span>
                    <span>·</span>
                    <span className="text-blue-400">{getJobTitle(selectedCandidate.jobId)}</span>
                    <span>·</span>
                    <span className="text-orange-400">Applied {new Date(selectedCandidate.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Manager Quick Override Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      onUpdateCandidateStatus(selectedCandidate.id, 'Shortlisted', recruiterNoteText);
                      setSelectedCandidate({ ...selectedCandidate, status: 'Shortlisted', recruiterNotes: recruiterNoteText });
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() => onScheduleInterview(selectedCandidate)}
                    className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    Schedule Round 2
                  </button>

                  <button
                    onClick={() => {
                      onUpdateCandidateStatus(selectedCandidate.id, 'Hold', recruiterNoteText);
                      setSelectedCandidate({ ...selectedCandidate, status: 'Hold', recruiterNotes: recruiterNoteText });
                    }}
                    className="rounded-lg bg-amber-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
                  >
                    Hold
                  </button>

                  <button
                    onClick={() => {
                      onUpdateCandidateStatus(selectedCandidate.id, 'Rejected', recruiterNoteText);
                      setSelectedCandidate({ ...selectedCandidate, status: 'Rejected', recruiterNotes: recruiterNoteText });
                    }}
                    className="rounded-lg bg-rose-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
                  >
                    Reject
                  </button>

                  {onDeleteCandidate && (
                    <button
                      onClick={() => {
                        if (confirm(`Permanently remove ${selectedCandidate.fullName} from Firestore?`)) {
                          onDeleteCandidate(selectedCandidate.id);
                          setSelectedCandidate(null);
                        }
                      }}
                      className="rounded-lg border border-rose-800 bg-rose-950/80 p-1.5 text-rose-300 hover:bg-rose-900 transition-colors"
                      title="Delete Candidate Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dossier Tabs */}
              <div className="flex items-center gap-4 border-b border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('scorecard')}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeTab === 'scorecard'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Scorecard Evaluation
                </button>
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeTab === 'transcript'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interview Transcript ({selectedCandidate.transcript?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeTab === 'resume'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Resume & AI Intelligence Brief
                </button>
              </div>

              {/* Tab 1: AI Scorecard */}
              {activeTab === 'scorecard' && (
                <div className="space-y-6">
                  {selectedCandidate.scorecard ? (
                    <>
                      {/* Metric Scores */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                          <div className="text-[11px] uppercase tracking-wider text-slate-400">Overall Match</div>
                          <div className="text-2xl font-bold text-white mt-1">
                            {selectedCandidate.scorecard.overallScore}%
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                          <div className="text-[11px] uppercase tracking-wider text-slate-400">Technical Depth</div>
                          <div className="text-2xl font-bold text-emerald-400 mt-1">
                            {selectedCandidate.scorecard.technicalScore}%
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                          <div className="text-[11px] uppercase tracking-wider text-slate-400">Problem Solving</div>
                          <div className="text-2xl font-bold text-sky-400 mt-1">
                            {selectedCandidate.scorecard.problemSolvingScore}%
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                          <div className="text-[11px] uppercase tracking-wider text-slate-400">Recommendation</div>
                          <div className={`text-xl font-bold mt-1.5 ${
                            selectedCandidate.scorecard.recommendation === 'SHORTLIST'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}>
                            {selectedCandidate.scorecard.recommendation}
                          </div>
                        </div>
                      </div>

                      {/* Executive Summary */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          AI Executive Assessment
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {selectedCandidate.scorecard.executiveSummary}
                        </p>
                      </div>

                      {/* Strengths and Risks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Key Strengths
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {selectedCandidate.scorecard.strengths.map((str, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Identified Risks / Watchpoints
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {selectedCandidate.scorecard.risks.map((risk, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-400 font-bold">•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Suggested Human Interviewer Follow-ups */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Recommended Round 2 Human Interview Questions
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {selectedCandidate.scorecard.recommendedHumanQuestions.map((q, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">{idx + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Scorecard has not been generated for this candidate yet.
                    </div>
                  )}

                  {/* Recruiter Notes Section */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Portal Manager Notes & Evaluation Log
                    </h4>
                    <textarea
                      rows={3}
                      value={recruiterNoteText}
                      onChange={(e) => setRecruiterNoteText(e.target.value)}
                      placeholder="Add private evaluation notes for the Karachi hiring committee..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          onUpdateCandidateStatus(selectedCandidate.id, selectedCandidate.status, recruiterNoteText);
                          alert('Manager notes saved to Firestore successfully.');
                        }}
                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        Save Notes to Firestore
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Transcript */}
              {activeTab === 'transcript' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => downloadTranscript(selectedCandidate)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export JSON Transcript</span>
                    </button>
                  </div>

                  {selectedCandidate.transcript && selectedCandidate.transcript.length > 0 ? (
                    selectedCandidate.transcript.map((turn, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                        <div className="text-xs font-semibold text-blue-400">
                          Question {idx + 1} · {turn.category}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-white">{turn.question}</div>
                        <div className="rounded-lg bg-slate-900 p-3 text-xs text-slate-200 border border-slate-800/80">
                          <span className="text-[11px] text-slate-500 font-bold block mb-1">Candidate Answer</span>
                          {turn.answer}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No interview turns recorded yet. Candidate has not started or completed the AI screening.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Resume & AI Brief */}
              {activeTab === 'resume' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">{selectedCandidate.resumeFileName}</div>
                        <div className="text-[11px] text-slate-400">{selectedCandidate.resumeFileSize} · Uploaded {new Date(selectedCandidate.appliedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* AI Resume Intelligence Brief */}
                  {selectedCandidate.resumeAiSummary && (
                    <div className="rounded-xl border border-blue-900/80 bg-blue-950/30 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                        <span>AI-Generated Resume Intelligence Brief</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        {selectedCandidate.resumeAiSummary.executiveSnapshot}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Key Relevant Competencies:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCandidate.resumeAiSummary.relevantSkills.map((sk, idx) => (
                            <span key={idx} className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-blue-200 border border-slate-700/60">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Scaling Milestones:
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {selectedCandidate.resumeAiSummary.scaleAndMilestones.map((ms, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{ms}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
                        <div>
                          <span className="text-slate-400">Education: </span>
                          <span className="text-white font-medium">{selectedCandidate.resumeAiSummary.educationAndCredentials}</span>
                        </div>
                        <div className="text-blue-300 font-semibold">
                          Verdict: {selectedCandidate.resumeAiSummary.recruiterQuickVerdict}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {selectedCandidate.resumeText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post New Karachi Vacancy Modal (Portal Manager Control) */}
      {isAddJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <button
              onClick={() => setIsAddJobOpen(false)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleCreateJob} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <PlusCircle className="h-4 w-4" />
                  <span>Portal Manager Action</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Post New Karachi On-Site Vacancy</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish a new position offering 100K - 150K PKR with corporate ethics rubric
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior AI Systems Engineer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department</label>
                  <select
                    value={newJobDept}
                    onChange={(e) => setNewJobDept(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Artificial Intelligence & Emerging Systems">AI & Emerging Systems</option>
                    <option value="Web Engineering & Core Platform">Web Engineering</option>
                    <option value="Growth Infrastructure & Data Operations">Growth & Deliverability</option>
                    <option value="Machine Learning Quality Assurance">AI Quality Assurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Salary Package *</label>
                  <input
                    type="text"
                    required
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Required Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newJobTech}
                  onChange={(e) => setNewJobTech(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role Brief & Objectives</label>
                <textarea
                  rows={3}
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Describe the technical challenges and on-site expectations in Karachi..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddJobOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Publish Role Immediately</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
