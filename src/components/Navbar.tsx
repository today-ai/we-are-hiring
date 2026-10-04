import React, { useState } from 'react';
import { 
  Menu,
  X,
  Briefcase, 
  Bot, 
  Users, 
  Calendar, 
  Cpu, 
  LogOut, 
  BookOpen,
  Phone,
  Shield,
  Edit3,
  Smartphone,
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { AirevLogo } from './AirevLogo';

export type ActiveTab = 'jobs' | 'interview' | 'admin' | 'scheduler' | 'resources' | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  candidateCount: number;
  openRolesCount: number;
  isInterviewActive: boolean;
  currentUser: UserProfile | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  candidateCount,
  openRolesCount,
  isInterviewActive,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  onOpenProfile
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsDrawerOpen(false);
  };

  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'jobs': return 'Karachi Vacancies';
      case 'interview': return 'AI Screening Room';
      case 'resources': return 'Prep & Resource Hub';
      case 'scheduler': return 'Interview Calendar';
      case 'admin': return 'Recruiter Pipeline';
      case 'architecture': return 'System Architecture';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left section: Hamburger Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex items-center justify-center rounded-xl p-2 text-slate-300 hover:bg-slate-900 hover:text-white border border-slate-800 transition-colors shadow-sm"
            >
              <Menu className="h-5 w-5 text-slate-200" />
            </button>

            <div 
              onClick={() => handleNavClick('jobs')}
              className="flex cursor-pointer items-center transition-opacity hover:opacity-90"
            >
              <AirevLogo size="sm" />
            </div>

            {/* Current Active Tab Pill on Mobile & Tablet */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-bold text-blue-300">
                {getTabLabel(activeTab)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                · Karachi On-Site (100k–150k PKR)
              </span>
            </div>
          </div>

          {/* Right section: Profile Pill / Google Sign-In */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Clickable Profile Pill */}
                <button
                  onClick={onOpenProfile}
                  title="Manage Profile & Contact Number"
                  className={`flex items-center gap-2 border rounded-xl p-1.5 pr-2.5 text-left transition-all hover:border-blue-500/60 shadow-sm ${
                    currentUser.isPortalManager || currentUser.role === 'admin'
                      ? 'bg-blue-950/40 border-blue-600/40 hover:bg-blue-950/60'
                      : 'bg-slate-900/90 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="block text-left text-xs max-w-[130px] sm:max-w-[170px] truncate">
                    <div className="font-bold text-white leading-tight flex items-center gap-1.5 truncate">
                      <span className="truncate">{currentUser.displayName}</span>
                      {currentUser.isPortalManager && (
                        <span className="rounded bg-blue-500/20 text-blue-300 px-1 py-0.2 text-[8px] font-extrabold uppercase border border-blue-500/40 shrink-0">
                          Manager
                        </span>
                      )}
                    </div>
                    {/* Display Contact Number if saved */}
                    <div className="text-[10px] text-orange-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                      {currentUser.phoneNumber ? (
                        <>
                          <Phone className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{currentUser.phoneNumber}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Add Contact #</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-850 hover:text-rose-400 border border-slate-800/80 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInWithGoogle}
                title="Sign in with Google"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-100 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* LEFT-OPENING RESPONSIVE OFF-CANVAS DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Left Navigation Panel */}
          <div className="relative flex w-full max-w-xs sm:max-w-sm flex-1 flex-col bg-slate-950 border-r border-slate-800 text-slate-100 shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <AirevLogo size="sm" />
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Quick Card in Drawer */}
            <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/40 to-slate-950">
              {currentUser ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500 shrink-0 shadow-md"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-white truncate">
                        {currentUser.displayName}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                    </div>
                  </div>

                  {/* Contact Number & Location Display */}
                  <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Smartphone className="h-3 w-3 text-orange-400" />
                        <span>Contact Number:</span>
                      </span>
                      {currentUser.phoneNumber ? (
                        <span className="font-bold text-emerald-400 font-mono text-[11px]">
                          {currentUser.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px] font-semibold">Not Set</span>
                      )}
                    </div>
                    {currentUser.city && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-300 font-medium">{currentUser.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Edit Trigger Button */}
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenProfile?.();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950/80 border border-blue-600/50 py-2 text-xs font-bold text-blue-300 hover:bg-blue-900/60 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Manage Profile & Contact Number</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 space-y-2.5 text-center">
                  <div className="text-xs font-bold text-white">Join AIREV Emerging Center</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sign in to track your applications, manage contact info, and schedule on-site interviews.
                  </p>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onSignInWithGoogle();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition-colors"
                  >
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Links List (Touch-Friendly min 48px height) */}
            <div className="p-3 space-y-1.5 flex-1">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Portal Sections
              </div>

              {/* 1. Careers Portal */}
              <button
                onClick={() => handleNavClick('jobs')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'jobs'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                  <span>Careers & Vacancies</span>
                </div>
                <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-xs text-orange-400 font-bold border border-slate-800">
                  {openRolesCount} Open
                </span>
              </button>

              {/* 2. AI Screening Room */}
              <button
                onClick={() => handleNavClick('interview')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'interview'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-orange-400" />
                  <span>AI Screening Room</span>
                </div>
                {isInterviewActive && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {/* 3. Prep & Resource Hub */}
              <button
                onClick={() => handleNavClick('resources')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'resources'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                  <span>Candidate Prep Hub</span>
                </div>
                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 font-bold border border-emerald-800/60">
                  AI Kits
                </span>
              </button>

              {/* 4. Calendar Scheduling */}
              <button
                onClick={() => handleNavClick('scheduler')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'scheduler'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-sky-400" />
                  <span>Interview Calendar</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              {/* 5. Recruiter Pipeline & Analytics */}
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span>Recruiter Pipeline</span>
                </div>
                <span className="rounded-md bg-purple-950 px-2 py-0.5 text-xs text-purple-300 font-bold border border-purple-800/60">
                  {candidateCount}
                </span>
              </button>

              {/* 6. System Architecture */}
              <button
                onClick={() => handleNavClick('architecture')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                  <span>System Architecture</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Drawer Footer Information */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Building2 className="h-4 w-4 text-orange-400" />
                <span>AIREV Emerging Center Karachi</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Shahrah-e-Faisal / Clifton, Karachi.
                <br />
                Office hours: 9:30 AM – 6:00 PM PKT
              </p>

              {currentUser && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onSignOut();
                  }}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:border-rose-800/50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
