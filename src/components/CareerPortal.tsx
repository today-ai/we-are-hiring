import React, { useState } from 'react';
import { JobPosting } from '../types';
import { AirevLogo } from './AirevLogo';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Search,
  Filter,
  X,
  Building2,
  Cpu,
  Coffee,
  HeartHandshake,
  CheckCircle
} from 'lucide-react';

interface CareerPortalProps {
  jobs: JobPosting[];
  onSelectJobToApply: (job: JobPosting) => void;
  onExploreDemoScreening: () => void;
  onOpenPrepHub?: (jobId: string) => void;
}

export const CareerPortal: React.FC<CareerPortalProps> = ({
  jobs,
  onSelectJobToApply,
  onExploreDemoScreening,
  onOpenPrepHub
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobPosting | null>(null);

  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.domainCompetencies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Hero section with AIREV Emerging Center Branding */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-10 lg:p-14">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Logo Badge in Hero */}
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-2.5 shadow-lg shadow-black/40 border border-slate-200">
            <AirevLogo size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-400">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span>Karachi, Pakistan · On-Site Vacancies</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">100,000 – 150,000 PKR / Month</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            Shape the Future of AI. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-orange-400">
              AIREV Emerging Center Careers.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
            Join our cutting-edge on-site engineering team in Karachi. We offer competitive salaries ranging from 
            <strong className="text-emerald-400"> 100K to 150K PKR/month</strong>, an uncompromising culture of 
            <strong className="text-white"> corporate ethics, meritocracy, and transparent accountability</strong>, and direct autonomous AI first-round screening so your technical skills get evaluated immediately without delays.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#open-roles"
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <span>View {jobs.length} On-Site Karachi Roles</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>

            <button
              onClick={onExploreDemoScreening}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-slate-800 hover:text-white"
            >
              <Zap className="mr-2 h-4 w-4 text-orange-400" />
              <span>Try Live AI Screening Demo</span>
            </button>
          </div>

          {/* Quick value proposition */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>On-Site Emerging Center, Karachi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-400 shrink-0" />
              <span>Corporate Job Ethics & NDA Integrity</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>100K – 150K PKR Salary Package</span>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Job Ethics & Culture Spotlight Section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4" />
              <span>Workplace Standards</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              AIREV Corporate Job Ethics & Culture
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Professional excellence & mutual respect at our Karachi Emerging Center
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-950 text-blue-400 border border-blue-900/50">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Professional Integrity & NDA Ethics</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We uphold strict confidentiality, client data privacy, and intellectual property ethics. Every team member works with transparent accountability and non-negotiable honesty.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-950 text-orange-400 border border-orange-900/50">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Dedicated On-Site Karachi Facility</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modern air-conditioned center equipped with uninterrupted 24/7 standby generator power, high-speed dual fiber broadband, ergonomic workstations, and collaborative breakout zones.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900/50">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Guaranteed Punctual Payroll & Perks</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prompt salary bank transfers on the 1st of every month (100k - 150k PKR band), annual Eid bonuses, comprehensive health coverage, and bi-annual merit review cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section id="open-roles" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Current Openings in Karachi</h2>
            <p className="text-sm text-slate-400 mt-1">
              Showing {filteredJobs.length} active on-site positions with packages between 100,000 – 150,000 PKR / month
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search jobs, tech, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Department segmented filter buttons */}
            <div className="flex items-center overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/70 p-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {dept.length > 20 ? dept.split('&')[0] : dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/60 p-6 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90"
            >
              <div className="space-y-4">
                {/* Meta details header */}
                <div className="flex flex-wrap items-center gap-y-1 text-xs text-slate-400">
                  <span className="font-semibold text-blue-400">{job.department}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-orange-400 font-semibold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-slate-300 font-medium">{job.type}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-slate-400">{job.experienceLevel}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  {job.title}
                </h3>

                {/* Salary in PKR */}
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <span className="rounded bg-emerald-950/60 px-2.5 py-0.5 border border-emerald-800/60">
                    {job.salaryRange}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">On-Site Karachi</span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {job.shortDescription}
                </p>

                {/* Competency tags */}
                <div className="pt-2">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                    Core Technical Competencies
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
                    {job.domainCompetencies.slice(0, 3).map((comp, idx) => (
                      <span key={idx} className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700/50">
                        {comp}
                      </span>
                    ))}
                    {job.domainCompetencies.length > 3 && (
                      <span className="text-[11px] text-slate-500 self-center pl-1">
                        +{job.domainCompetencies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedJobDetails(job)}
                    className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Ethics & Rubric</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  {onOpenPrepHub && (
                    <button
                      onClick={() => onOpenPrepHub(job.id)}
                      className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Prep Kit</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectJobToApply(job)}
                  className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-600"
                >
                  <span>Apply & Screen</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Details Modal / Drawer */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setSelectedJobDetails(null)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                  <span>AIREV Emerging Center</span>
                  <span>·</span>
                  <span className="text-orange-400">{selectedJobDetails.location}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {selectedJobDetails.title}
                </h2>
                <div className="mt-2 text-sm font-extrabold text-emerald-400">
                  {selectedJobDetails.salaryRange}
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedJobDetails.shortDescription}
              </p>

              {/* Responsibilities */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Key Responsibilities
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedJobDetails.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">›</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements & Ethics */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Candidate Requirements & Ethics
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedJobDetails.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">›</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Perks & Workplace Culture */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Karachi Emerging Center Benefits & Culture
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedJobDetails.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal footer CTA */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedJobDetails(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const job = selectedJobDetails;
                    setSelectedJobDetails(null);
                    onSelectJobToApply(job);
                  }}
                  className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  <span>Apply For This Position</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
