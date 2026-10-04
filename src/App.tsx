import React, { useState, useEffect } from 'react';
import { 
  JobPosting, 
  CandidateApplication, 
  ScheduledInterview, 
  EmailDispatchLog, 
  CandidateScorecard, 
  InterviewTurn,
  UserProfile 
} from './types';
import { OPEN_JOBS } from './data/jobs';
import { INITIAL_CANDIDATES, SAMPLE_RESUME_PROFILES } from './data/seedCandidates';
import { Navbar, ActiveTab } from './components/Navbar';
import { CareerPortal } from './components/CareerPortal';
import { ApplicationModal } from './components/ApplicationModal';
import { InterviewScreeningRoom } from './components/InterviewScreeningRoom';
import { AdminDashboard } from './components/AdminDashboard';
import { InterviewSchedulerModal } from './components/InterviewSchedulerModal';
import { CandidateCalendarPortal } from './components/CandidateCalendarPortal';
import { CandidateResourceCenter } from './components/CandidateResourceCenter';
import { ArchitectureBlueprint } from './components/ArchitectureBlueprint';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signOutUser, 
  persistCandidateApplication, 
  deleteCandidateApplication,
  fetchAllCandidateApplications,
  persistScheduledInterview,
  fetchAllScheduledInterviews
} from './services/firebase';
import { 
  Bot, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Award,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>(OPEN_JOBS);
  const [candidates, setCandidates] = useState<CandidateApplication[]>(INITIAL_CANDIDATES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);

  // Application & Screening Room states
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
  const [activeScreeningApplication, setActiveScreeningApplication] = useState<CandidateApplication | null>(null);
  const [activeScreeningJob, setActiveScreeningJob] = useState<JobPosting>(OPEN_JOBS[0]);

  // Recruiter Scheduler Modal state
  const [schedulingCandidate, setSchedulingCandidate] = useState<CandidateApplication | null>(null);
  const [prepTargetJobId, setPrepTargetJobId] = useState<string>(OPEN_JOBS[0].id);

  // Transactional email preview
  const [previewEmail, setPreviewEmail] = useState<EmailDispatchLog | null>(null);
  const [latestNotification, setLatestNotification] = useState<{ title: string; subtitle: string; email?: EmailDispatchLog } | null>(null);

  // Subscribe to Firebase Auth and fetch persistent Firestore data on mount
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    // Hydrate candidates and schedules from Firestore
    async function loadFirestoreData() {
      try {
        const firestoreCandidates = await fetchAllCandidateApplications();
        if (firestoreCandidates.length > 0) {
          // Merge with initial seed candidates without duplicates
          const firestoreIds = new Set(firestoreCandidates.map((c) => c.id));
          const merged = [
            ...firestoreCandidates,
            ...INITIAL_CANDIDATES.filter((c) => !firestoreIds.has(c.id))
          ];
          setCandidates(merged);
        }

        const firestoreSchedules = await fetchAllScheduledInterviews();
        if (firestoreSchedules.length > 0) {
          setScheduledInterviews(firestoreSchedules);
        }
      } catch (err) {
        console.warn('Could not load Firestore data:', err);
      }
    }
    loadFirestoreData();

    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        setCurrentUser(profile);
        setLatestNotification({
          title: `Welcome, ${profile.displayName}!`,
          subtitle: `Signed in as ${profile.role} with Google via Firebase Auth.`
        });
      }
    } catch (err: any) {
      setLatestNotification({
        title: 'Sign In Notice',
        subtitle: err?.message || 'Could not complete Google Sign-In popup.'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setLatestNotification({
        title: 'Signed Out',
        subtitle: 'You have been signed out from Firebase Auth.'
      });
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
  };

  // Handle new candidate submission
  const handleApplicationSubmitSuccess = async (newApp: CandidateApplication) => {
    // 1. Add to local state & persist to Firestore
    setCandidates((prev) => [newApp, ...prev]);
    setApplyingJob(null);
    await persistCandidateApplication(newApp);

    // 2. Formulate automated acknowledgement email
    const matchedJob = jobs.find((j) => j.id === newApp.jobId) || OPEN_JOBS[0];
    const ackEmail: EmailDispatchLog = {
      id: `email-${Date.now()}`,
      to: newApp.email,
      recipientName: newApp.fullName,
      subject: `Application Received: ${matchedJob.title} at AIREV Emerging Center`,
      type: 'application_acknowledgement',
      timestamp: new Date().toISOString(),
      status: 'Delivered',
      contentHtml: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">Hi ${newApp.fullName},</h2>
          <p>Thank you for submitting your application for the <strong>${matchedJob.title}</strong> role at <strong>AIREV Emerging Center (Karachi, Pakistan)</strong>.</p>
          <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Application Reference:</strong> ${newApp.id.toUpperCase()}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Position:</strong> ${matchedJob.title} (${matchedJob.department})</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Location & Work Mode:</strong> On-Site (Karachi Emerging Center)</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Compensation Band:</strong> ${matchedJob.salaryRange}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Attached CV:</strong> ${newApp.resumeFileName} (${newApp.resumeFileSize})</p>
          </div>
          ${newApp.resumeAiSummary ? `
            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 10px 14px; margin: 14px 0; font-size: 12px;">
              <strong style="color: #1e40af;">AIREV AI Resume Summary:</strong> ${newApp.resumeAiSummary.executiveSnapshot}
            </div>
          ` : ''}
          <p>As part of our commitment to transparent and ethical hiring, your profile has unlocked the <strong>Autonomous AI First-Round Technical Screening</strong>.</p>
          <p style="font-size: 13px; color: #64748b;">Our system has calibrated domain questions tailored to your experience. Your answers will be reviewed by our engineering leads in Karachi.</p>
          <p style="margin-top: 24px; font-size: 13px;">Best regards,<br/><strong>Talent Acquisition & People Operations</strong><br/>AIREV Emerging Center, Karachi</p>
        </div>
      `
    };

    setLatestNotification({
      title: 'Application Saved to Firestore & Email Dispatched!',
      subtitle: `Acknowledgement sent to ${newApp.email}. Initializing AI Screening Room...`,
      email: ackEmail
    });

    // 3. Immediately launch the AI screening room for this candidate
    setActiveScreeningApplication(newApp);
    setActiveScreeningJob(matchedJob);
    setActiveTab('interview');
  };

  // Launch a demo screening directly from hero button
  const handleLaunchDemoScreening = () => {
    const demoJob = OPEN_JOBS[0]; // Lead Growth & Deliverability Engineer
    const demoProfile = SAMPLE_RESUME_PROFILES[0];
    const demoApp: CandidateApplication = {
      id: `cand-demo-${Date.now().toString().slice(-4)}`,
      candidateUid: currentUser?.uid,
      jobId: demoJob.id,
      fullName: demoProfile.name,
      email: demoProfile.email,
      phone: demoProfile.phone,
      linkedinUrl: demoProfile.linkedinUrl,
      portfolioUrl: demoProfile.portfolioUrl,
      yearsOfExperience: demoProfile.yearsOfExperience,
      resumeFileName: demoProfile.resumeFileName,
      resumeFileSize: demoProfile.resumeFileSize,
      resumeText: demoProfile.resumeText,
      appliedAt: new Date().toISOString(),
      status: 'Screening'
    };

    setActiveScreeningApplication(demoApp);
    setActiveScreeningJob(demoJob);
    setActiveTab('interview');
  };

  // Screening completed handler
  const handleScreeningCompleted = async (
    updatedApp: CandidateApplication,
    scorecard: CandidateScorecard,
    transcript: InterviewTurn[]
  ) => {
    const finalApp = { ...updatedApp, scorecard, transcript };
    setCandidates((prev) =>
      prev.map((c) => (c.id === updatedApp.id ? finalApp : c))
    );

    // Persist to Firestore
    await persistCandidateApplication(finalApp);

    setLatestNotification({
      title: 'Autonomous Screening Complete!',
      subtitle: `Scorecard saved to Firestore · Overall Match: ${scorecard.overallScore}% · Recommendation: ${scorecard.recommendation}`
    });
  };

  // Update candidate status from recruiter dashboard
  const handleUpdateCandidateStatus = async (
    candidateId: string,
    newStatus: CandidateApplication['status'],
    notes?: string
  ) => {
    let updatedTarget: CandidateApplication | null = null;
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          updatedTarget = { ...c, status: newStatus, ...(notes !== undefined ? { recruiterNotes: notes } : {}) };
          return updatedTarget;
        }
        return c;
      })
    );

    if (updatedTarget) {
      await persistCandidateApplication(updatedTarget);
    }
  };

  // Portal Manager deletion power
  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteCandidateApplication(candidateId);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      setLatestNotification({
        title: 'Candidate Record Permanently Deleted',
        subtitle: `Candidate ${candidateId} was removed from Firestore by Portal Manager.`
      });
    } catch (err) {
      console.warn('Error deleting candidate from Firestore:', err);
    }
  };

  // Portal Manager job creation power
  const handleAddNewJob = (newJob: JobPosting) => {
    setJobs((prev) => [newJob, ...prev]);
    setLatestNotification({
      title: 'New Karachi Vacancy Published!',
      subtitle: `${newJob.title} is now active on the careers portal (${newJob.salaryRange}).`
    });
  };

  // Schedule interview triggers
  const handleStartScheduling = (candidate: CandidateApplication) => {
    setSchedulingCandidate(candidate);
  };

  const handleInterviewScheduled = async (scheduled: ScheduledInterview) => {
    setScheduledInterviews((prev) => [scheduled, ...prev]);

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === scheduled.candidateId || c.email === scheduled.candidateEmail) {
          const updated = { ...c, status: 'Scheduled' as const, scheduledInterview: scheduled };
          persistCandidateApplication(updated);
          return updated;
        }
        return c;
      })
    );

    // Save schedule in Firestore
    await persistScheduledInterview(scheduled);

    // Formulate scheduled calendar email
    const schedEmail: EmailDispatchLog = {
      id: `email-sched-${Date.now()}`,
      to: scheduled.candidateEmail,
      recipientName: scheduled.candidateName,
      subject: `Confirmed: ${scheduled.interviewType} with ${scheduled.interviewerName}`,
      type: 'interview_confirmed',
      timestamp: new Date().toISOString(),
      status: 'Delivered',
      contentHtml: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h2 style="color: #059669; margin-bottom: 8px;">Interview Confirmed & Calendar Synced!</h2>
          <p>Hi ${scheduled.candidateName},</p>
          <p>Your Round 2 interview for the <strong>${scheduled.jobTitle}</strong> position has been successfully scheduled.</p>
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Format:</strong> ${scheduled.interviewType}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Interviewer:</strong> ${scheduled.interviewerName} (${scheduled.interviewerRole})</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Date & Time:</strong> ${scheduled.date} at ${scheduled.timeSlot} (${scheduled.timezone})</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Venue:</strong> AIREV Emerging Center Conference Room, Shahrah-e-Faisal / Clifton, Karachi (or Google Meet: <a href="${scheduled.meetingLink}">${scheduled.meetingLink}</a>)</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">You can sync this directly to your Google Calendar or Outlook Calendar via the candidate portal link.</p>
          <p style="margin-top: 24px; font-size: 13px;">We look forward to meeting you,<br/><strong>Engineering & People Operations Leadership</strong><br/>AIREV Emerging Center, Karachi</p>
        </div>
      `
    };

    setLatestNotification({
      title: 'Interview Saved to Firestore & Calendar Ready!',
      subtitle: `Meeting invitation dispatched to ${scheduled.candidateEmail} & ${scheduled.interviewerName}.`,
      email: schedEmail
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        candidateCount={candidates.length}
        openRolesCount={jobs.length}
        isInterviewActive={Boolean(activeScreeningApplication)}
        currentUser={currentUser}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Floating Notification Toast */}
      {latestNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-xl border border-indigo-900/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-xs font-bold text-white">{latestNotification.title}</div>
              <div className="text-[11px] text-slate-400">{latestNotification.subtitle}</div>
              {latestNotification.email && (
                <button
                  onClick={() => setPreviewEmail(latestNotification.email || null)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  <Mail className="h-3 w-3" />
                  <span>Inspect Dispatched Email</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setLatestNotification(null)}
              className="text-slate-500 hover:text-slate-300 text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: Careers Portal */}
        {activeTab === 'jobs' && (
          <CareerPortal
            jobs={jobs}
            onSelectJobToApply={(job) => setApplyingJob(job)}
            onExploreDemoScreening={handleLaunchDemoScreening}
            onOpenPrepHub={(jobId) => {
              setPrepTargetJobId(jobId);
              setActiveTab('resources');
            }}
          />
        )}

        {/* TAB 2: Autonomous AI Screening Room */}
        {activeTab === 'interview' && (
          <InterviewScreeningRoom
            application={activeScreeningApplication}
            job={activeScreeningJob}
            onScreeningCompleted={handleScreeningCompleted}
            onScheduleInterview={handleStartScheduling}
          />
        )}

        {/* TAB 3: Recruiter Admin Dashboard & Pipeline */}
        {activeTab === 'admin' && (
          <AdminDashboard
            candidates={candidates}
            jobs={jobs}
            currentUser={currentUser}
            onUpdateCandidateStatus={handleUpdateCandidateStatus}
            onScheduleInterview={handleStartScheduling}
            onDeleteCandidate={handleDeleteCandidate}
            onAddNewJob={handleAddNewJob}
          />
        )}

        {/* TAB 4: Candidate Calendar Portal & Self-Scheduling (Google & Outlook Sync) */}
        {activeTab === 'scheduler' && (
          <CandidateCalendarPortal
            jobs={jobs}
            currentUser={currentUser}
            onInterviewScheduled={handleInterviewScheduled}
            existingSchedules={scheduledInterviews}
          />
        )}

        {/* TAB 5: Candidate Resource Center & Interview Prep Hub */}
        {activeTab === 'resources' && (
          <CandidateResourceCenter
            jobs={jobs}
            initialJobId={prepTargetJobId}
            onNavigateToScreening={() => {
              const matchedJob = jobs.find((j) => j.id === prepTargetJobId) || jobs[0];
              setActiveScreeningJob(matchedJob);
              setActiveTab('interview');
            }}
            onNavigateToJobs={() => setActiveTab('jobs')}
          />
        )}

        {/* TAB 6: Architecture & Tech Stack (Chief AI Engineer Deliverable) */}
        {activeTab === 'architecture' && <ArchitectureBlueprint />}
      </main>

      {/* Application Modal with AI Resume Summarization */}
      {applyingJob && (
        <ApplicationModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSubmitSuccess={handleApplicationSubmitSuccess}
          currentUserId={currentUser?.uid}
          currentUserEmail={currentUser?.email}
          currentUserName={currentUser?.displayName}
        />
      )}

      {/* Recruiter Interview Scheduler Modal */}
      {schedulingCandidate && (
        <InterviewSchedulerModal
          candidate={schedulingCandidate}
          jobTitle={jobs.find((j) => j.id === schedulingCandidate.jobId)?.title || 'Open Role'}
          onClose={() => setSchedulingCandidate(null)}
          onInterviewScheduled={handleInterviewScheduled}
        />
      )}

      {/* Transactional Email Preview Modal */}
      {previewEmail && (
        <EmailPreviewModal
          email={previewEmail}
          onClose={() => setPreviewEmail(null)}
        />
      )}
    </div>
  );
}
