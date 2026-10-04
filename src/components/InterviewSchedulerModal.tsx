import React, { useState } from 'react';
import { CandidateApplication, ScheduledInterview } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  CheckCircle2, 
  Download, 
  X, 
  Mail, 
  Sparkles,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface InterviewSchedulerModalProps {
  candidate: CandidateApplication;
  jobTitle: string;
  onClose: () => void;
  onInterviewScheduled: (scheduled: ScheduledInterview) => void;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  candidate,
  jobTitle,
  onClose,
  onInterviewScheduled
}) => {
  const [interviewType, setInterviewType] = useState<ScheduledInterview['interviewType']>('Technical Deep-Dive');
  const [interviewer, setInterviewer] = useState({
    name: 'Shaheer Khan',
    role: 'Lead AI Systems Architect',
    email: 'shaheer.khan@airev.pk'
  });
  const [selectedDate, setSelectedDate] = useState('2026-10-08');
  const [selectedTime, setSelectedTime] = useState('14:30');
  const [timezone, setTimezone] = useState('Asia/Karachi (PKT, UTC+5)');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdSchedule, setCreatedSchedule] = useState<ScheduledInterview | null>(null);

  const availableSlots = [
    '10:30 AM (PKT)',
    '12:00 PM (PKT)',
    '02:30 PM (PKT)',
    '04:00 PM (PKT)',
    '05:30 PM (PKT)'
  ];

  const interviewersList = [
    { name: 'Shaheer Khan', role: 'Lead AI Systems Architect', email: 'shaheer.khan@airev.pk' },
    { name: 'Zubair Ahmed', role: 'VP of Engineering, Karachi', email: 'zubair.ahmed@airev.pk' },
    { name: 'Faiza Tariq', role: 'Head of Talent & Culture', email: 'faiza.tariq@airev.pk' },
    { name: 'Asad Qureshi', role: 'Principal Web Architect', email: 'asad.qureshi@airev.pk' }
  ];

  const handleConfirmBooking = () => {
    const meetingCode = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    const schedule: ScheduledInterview = {
      id: `sched-${Date.now().toString().slice(-4)}`,
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      jobTitle,
      interviewType,
      interviewerName: interviewer.name,
      interviewerRole: interviewer.role,
      date: selectedDate,
      timeSlot: selectedTime,
      timezone,
      meetingLink: `https://meet.google.com/${meetingCode}`,
      calendarInviteSent: true
    };

    setCreatedSchedule(schedule);
    setIsSuccess(true);
    onInterviewScheduled(schedule);
  };

  const downloadIcsCalendar = () => {
    if (!createdSchedule) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TalentFlow AI//Hiring Portal//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${createdSchedule.id}@talentflow.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:20261008T210000Z
DTEND:20261008T220000Z
SUMMARY:${createdSchedule.interviewType} — ${candidate.fullName} & ${createdSchedule.interviewerName}
DESCRIPTION:Technical Round 2 interview for ${jobTitle}.\\nMeeting Link: ${createdSchedule.meetingLink}
LOCATION:${createdSchedule.meetingLink}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_${candidate.fullName.replace(/\s+/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSuccess ? (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>Effortless Interview Scheduling</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Schedule Round 2 Human Interview
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Candidate: <strong className="text-white font-medium">{candidate.fullName}</strong> ({candidate.email}) · Role: <strong className="text-slate-200">{jobTitle}</strong>
              </div>
            </div>

            {/* Select Interview Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Select Interview Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { type: 'Technical Deep-Dive', desc: 'Architecture, codebase walkthrough & past scale' },
                  { type: 'System Architecture Whiteboard', desc: 'Scalability, failover & DNS/SMTP clusters' },
                  { type: 'Hiring Manager Sync', desc: 'Team goals, roadmap ownership & delivery velocity' },
                  { type: 'Culture & Values', desc: 'Collaboration, working style & values alignment' }
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setInterviewType(item.type as any)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      interviewType === item.type
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.type}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Interviewer */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Assign Lead Interviewer
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {interviewersList.map((inv) => (
                  <button
                    key={inv.name}
                    type="button"
                    onClick={() => setInterviewer(inv)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      interviewer.name === inv.name
                        ? 'border-emerald-500 bg-emerald-950/30 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold">{inv.name}</div>
                        <div className="text-[11px] text-slate-400">{inv.role}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="America/Los_Angeles (PST)">Pacific Time (PT)</option>
                  <option value="America/New_York (EST)">Eastern Time (ET)</option>
                  <option value="Europe/London (GMT)">London (GMT)</option>
                  <option value="Europe/Berlin (CET)">Central European (CET)</option>
                </select>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Available Time Slots
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedTime === slot
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all gap-2"
              >
                <span>Confirm & Dispatch Calendar Invite</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Interview Confirmed & Dispatched
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                Calendar Invite Successfully Created!
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5">
                We have emailed candidate <strong className="text-slate-200">{candidate.fullName}</strong> and <strong className="text-slate-200">{interviewer.name}</strong> with calendar synchronization details.
              </p>
            </div>

            {/* Details card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left space-y-2 text-xs text-slate-300 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold text-white">{interviewType}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-semibold text-white">{selectedDate} at {selectedTime} ({timezone})</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Interviewer:</span>
                <span className="font-semibold text-white">{interviewer.name} ({interviewer.role})</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Meeting Video Link:</span>
                <a
                  href={createdSchedule?.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Google Meet Room</span>
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={downloadIcsCalendar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .ICS Calendar Event</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
