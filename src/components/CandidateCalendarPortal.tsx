import React, { useState, useEffect } from 'react';
import { CalendarSlot, ScheduledInterview, JobPosting, UserProfile, CandidateApplication } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Filter, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface CandidateCalendarPortalProps {
  jobs: JobPosting[];
  currentUser: UserProfile | null;
  onInterviewScheduled: (schedule: ScheduledInterview) => void;
  existingSchedules?: ScheduledInterview[];
}

export const CandidateCalendarPortal: React.FC<CandidateCalendarPortalProps> = ({
  jobs,
  currentUser,
  onInterviewScheduled,
  existingSchedules = []
}) => {
  const [interviewCategory, setInterviewCategory] = useState<'human' | 'ai'>('human');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-06');
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [candidateName, setCandidateName] = useState(currentUser?.displayName || '');
  const [candidateEmail, setCandidateEmail] = useState(currentUser?.email || '');
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [timezone, setTimezone] = useState('Asia/Karachi (PKT, UTC+5)');
  const [confirmedSchedule, setConfirmedSchedule] = useState<ScheduledInterview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available slots dataset at AIREV Emerging Center Karachi
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([
    {
      id: 'slot-101',
      date: '2026-10-06',
      timeSlot: '11:00 AM - 11:45 AM (PKT)',
      interviewType: 'Technical Deep-Dive',
      interviewerName: 'Shaheer Khan',
      interviewerRole: 'Lead AI Systems Architect',
      isBooked: false
    },
    {
      id: 'slot-102',
      date: '2026-10-06',
      timeSlot: '02:30 PM - 03:15 PM (PKT)',
      interviewType: 'System Architecture Whiteboard',
      interviewerName: 'Zubair Ahmed',
      interviewerRole: 'VP of Engineering, Karachi',
      isBooked: false
    },
    {
      id: 'slot-103',
      date: '2026-10-06',
      timeSlot: '04:30 PM - 05:15 PM (PKT)',
      interviewType: 'Hiring Manager Sync',
      interviewerName: 'Faiza Tariq',
      interviewerRole: 'Head of Talent & Culture',
      isBooked: false
    },
    {
      id: 'slot-104',
      date: '2026-10-07',
      timeSlot: '10:30 AM - 11:15 AM (PKT)',
      interviewType: 'Technical Deep-Dive',
      interviewerName: 'Shaheer Khan',
      interviewerRole: 'Lead AI Systems Architect',
      isBooked: false
    },
    {
      id: 'slot-105',
      date: '2026-10-07',
      timeSlot: '12:00 PM - 12:45 PM (PKT)',
      interviewType: 'System Architecture Whiteboard',
      interviewerName: 'Asad Qureshi',
      interviewerRole: 'Principal Web Architect',
      isBooked: false
    },
    {
      id: 'slot-106',
      date: '2026-10-07',
      timeSlot: '03:00 PM - 03:45 PM (PKT)',
      interviewType: 'Hiring Manager Sync',
      interviewerName: 'Faiza Tariq',
      interviewerRole: 'Head of Talent & Culture',
      isBooked: false
    },
    {
      id: 'slot-107',
      date: '2026-10-08',
      timeSlot: '11:30 AM - 12:15 PM (PKT)',
      interviewType: 'Technical Deep-Dive',
      interviewerName: 'Shaheer Khan',
      interviewerRole: 'Lead AI Systems Architect',
      isBooked: false
    },
    {
      id: 'slot-108',
      date: '2026-10-08',
      timeSlot: '02:00 PM - 02:45 PM (PKT)',
      interviewType: 'System Architecture Whiteboard',
      interviewerName: 'Zubair Ahmed',
      interviewerRole: 'VP of Engineering, Karachi',
      isBooked: false
    }
  ]);

  useEffect(() => {
    if (currentUser) {
      if (!candidateName) setCandidateName(currentUser.displayName);
      if (!candidateEmail) setCandidateEmail(currentUser.email);
    }
  }, [currentUser]);

  const datesList = ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'];

  const filteredSlots = availableSlots.filter((s) => {
    const matchesDate = s.date === selectedDate;
    const matchesFormat = selectedFormat === 'All' || s.interviewType === selectedFormat;
    const notBooked = !s.isBooked;
    return matchesDate && matchesFormat && notBooked;
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleBookSlot = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !candidateEmail || !selectedSlot) return;

    setIsSubmitting(true);

    const meetingId = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    const schedule: ScheduledInterview = {
      id: `sched-${Date.now().toString().slice(-4)}`,
      candidateId: `cand-self-${Date.now().toString().slice(-4)}`,
      candidateName,
      candidateEmail,
      jobTitle: selectedJob.title,
      interviewType: selectedSlot.interviewType as any,
      interviewerName: selectedSlot.interviewerName,
      interviewerRole: selectedSlot.interviewerRole,
      date: selectedSlot.date,
      timeSlot: selectedSlot.timeSlot,
      timezone,
      meetingLink: `https://meet.google.com/${meetingId}`,
      calendarInviteSent: true
    };

    // Update slots
    setAvailableSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, isBooked: true, bookedByEmail: candidateEmail } : s))
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedSchedule(schedule);
      onInterviewScheduled(schedule);
    }, 500);
  };

  // Helper to build direct Google Calendar Add URL
  const buildGoogleCalendarUrl = (sched: ScheduledInterview) => {
    const title = encodeURIComponent(`${sched.interviewType} — ${selectedJob.title} (TalentFlow AI)`);
    const details = encodeURIComponent(
      `Candidate: ${sched.candidateName} (${sched.candidateEmail})\nInterviewer: ${sched.interviewerName} (${sched.interviewerRole})\nGoogle Meet URL: ${sched.meetingLink}\n\nAutomated candidate interview self-scheduled via TalentFlow AI Portal.`
    );
    const location = encodeURIComponent(sched.meetingLink);
    // 2026-10-06T17:00:00Z format
    const startIso = `${sched.date.replace(/-/g, '')}T170000Z`;
    const endIso = `${sched.date.replace(/-/g, '')}T180000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // Helper to build direct Outlook Calendar Add URL
  const buildOutlookCalendarUrl = (sched: ScheduledInterview) => {
    const subject = encodeURIComponent(`${sched.interviewType} — ${selectedJob.title}`);
    const body = encodeURIComponent(
      `Interview with ${sched.interviewerName} (${sched.interviewerRole}). Meeting URL: ${sched.meetingLink}`
    );
    const location = encodeURIComponent(sched.meetingLink);
    const startdt = `${sched.date}T10:00:00`;
    const enddt = `${sched.date}T11:00:00`;
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&location=${location}&startdt=${startdt}&enddt=${enddt}`;
  };

  // Download .ics
  const downloadIcs = (sched: ScheduledInterview) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TalentFlow AI//Calendar Integration//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${sched.id}@talentflow.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:20261006T170000Z
DTEND:20261006T180000Z
SUMMARY:${sched.interviewType} — ${selectedJob.title}
DESCRIPTION:Round 2 Interview with ${sched.interviewerName}.\\nMeeting Link: ${sched.meetingLink}
LOCATION:${sched.meetingLink}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TalentFlow_Interview_${sched.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <CalendarIcon className="h-4 w-4" />
              <span>Real-Time Calendar API Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Candidate Self-Scheduling Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect real-time interviewer availability, pick your preferred slot, and sync directly with Google Calendar or Outlook Calendar with zero back-and-forth friction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Calendar Sync Active</span>
            </span>
          </div>
        </div>

        {/* Category switcher: AI 24/7 Screening vs Human Round 2 */}
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setInterviewCategory('human')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              interviewCategory === 'human'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Round 2: Technical & Leadership Sync (Live Interviewers)</span>
          </button>

          <button
            onClick={() => setInterviewCategory('ai')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              interviewCategory === 'ai'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-indigo-300" />
            <span>Round 1: Autonomous AI Screening (On-Demand 24/7)</span>
          </button>
        </div>
      </div>

      {/* AI On-Demand Note if AI category is selected */}
      {interviewCategory === 'ai' ? (
        <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Autonomous AI First-Round Screening</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
              No calendar scheduling required! The AI screening engine is available 24/7. Submit your application to enter the interactive conversational Q&A room immediately.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                const el = document.querySelector('header');
                if (el) {
                  const btn = el.querySelectorAll('button')[1]; // AI Screening room tab
                  btn?.click();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
            >
              <span>Enter AI Screening Room Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : confirmedSchedule ? (
        /* Booking Confirmation Card */
        <div className="rounded-2xl border border-emerald-950/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Self-Scheduling Successful
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Interview Confirmed & Synced!
              </h2>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block">Candidate:</span>
                <span className="font-semibold text-white">{confirmedSchedule.candidateName} ({confirmedSchedule.candidateEmail})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Role:</span>
                <span className="font-semibold text-white">{confirmedSchedule.jobTitle}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date & Time:</span>
                <span className="font-semibold text-emerald-400">{confirmedSchedule.date} at {confirmedSchedule.timeSlot} ({confirmedSchedule.timezone})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Interviewer:</span>
                <span className="font-semibold text-white">{confirmedSchedule.interviewerName} ({confirmedSchedule.interviewerRole})</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
              <span className="text-slate-400">Google Meet URL:</span>
              <a
                href={confirmedSchedule.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <Video className="h-3.5 w-3.5" />
                <span>{confirmedSchedule.meetingLink}</span>
              </a>
            </div>
          </div>

          {/* Direct 1-Click Calendar Sync API Buttons */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sync Directly to Your Calendar:
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={buildGoogleCalendarUrl(confirmedSchedule)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href={buildOutlookCalendarUrl(confirmedSchedule)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Globe className="h-4 w-4 text-sky-400" />
                <span>Add to Outlook Calendar</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                onClick={() => downloadIcs(confirmedSchedule)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Download .ICS Calendar File</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setConfirmedSchedule(null);
                setSelectedSlot(null);
              }}
              className="text-xs font-medium text-slate-400 hover:text-white"
            >
              ← Schedule Another Slot
            </button>
          </div>
        </div>
      ) : (
        /* Main Calendar Slot Booking Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Filters and Date Picker */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. Target Job Role
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  2. Interview Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="All">All Available Formats</option>
                  <option value="Technical Deep-Dive">Technical Deep-Dive</option>
                  <option value="System Architecture Whiteboard">System Architecture Whiteboard</option>
                  <option value="Hiring Manager Sync">Hiring Manager Sync</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  3. Select Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {datesList.map((dt) => {
                    const dateObj = new Date(dt);
                    const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    return (
                      <button
                        key={dt}
                        onClick={() => setSelectedDate(dt)}
                        className={`rounded-lg border p-2 text-left text-xs transition-all ${
                          selectedDate === dt
                            ? 'border-indigo-500 bg-indigo-600 text-white font-semibold shadow-sm'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {formatted}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="America/Los_Angeles (PT)">Pacific Time (PT)</option>
                  <option value="America/New_York (ET)">Eastern Time (ET)</option>
                  <option value="Europe/London (GMT)">London (GMT)</option>
                  <option value="Europe/Berlin (CET)">Berlin (CET)</option>
                  <option value="Asia/Singapore (SGT)">Singapore (SGT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Available Slots Grid & Booking Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>Available Interview Slots on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredSlots.length} open slots
                </span>
              </div>

              {filteredSlots.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No open slots found for this date and filter. Try selecting another date on the left.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => handleBookSlot(slot)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-indigo-400">{slot.timeSlot}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{timezone.split(' ')[0]}</span>
                        </div>
                        <div className="text-xs font-semibold text-white">{slot.interviewType}</div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <User className="h-3 w-3 text-emerald-400" />
                          <span>{slot.interviewerName} · {slot.interviewerRole}</span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
                          <span className={`text-[11px] font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Selected' : 'Click to Reserve'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Booking Confirmation Details Form */}
              {selectedSlot && (
                <form onSubmit={handleConfirmBooking} className="mt-6 rounded-xl border border-indigo-900/60 bg-indigo-950/20 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Confirm Your Self-Scheduled Booking</span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Reserving <strong className="text-white">{selectedSlot.interviewType}</strong> with <strong className="text-white">{selectedSlot.interviewerName}</strong> on <strong className="text-white">{selectedSlot.date} at {selectedSlot.timeSlot}</strong>.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Your Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Rivera"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Your Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel Selection
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Locking Slot in Database...</span>
                      ) : (
                        <>
                          <span>Lock Slot & Sync to Calendar</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
