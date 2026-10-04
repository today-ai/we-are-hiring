import React from 'react';
import { 
  Briefcase, 
  Bot, 
  Users, 
  Calendar, 
  Cpu, 
  ArrowUpRight,
  LogOut,
  BookOpen
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  candidateCount,
  openRolesCount,
  isInterviewActive,
  currentUser,
  onSignInWithGoogle,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onTabChange('jobs')}
            className="flex cursor-pointer items-center transition-opacity hover:opacity-90"
          >
            <AirevLogo size="sm" />
          </div>

          <div className="hidden xl:flex items-center text-xs text-slate-400">
            <span className="h-4 w-px bg-slate-800 mx-3" />
            <span className="text-orange-400 font-semibold">Karachi (On-Site)</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-slate-300 font-medium">{openRolesCount} Open Positions</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">100k – 150k PKR</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onTabChange('jobs')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'jobs'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Careers Portal</span>
          </button>

          <button
            onClick={() => onTabChange('interview')}
            className={`relative flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'interview'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>AI Screening Room</span>
            {isInterviewActive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'admin'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Recruiter Pipeline</span>
          </button>

          <button
            onClick={() => onTabChange('scheduler')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'scheduler'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Calendar Scheduling</span>
            <span className="md:hidden">Calendar</span>
          </button>

          <button
            onClick={() => onTabChange('resources')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'text-white border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4 text-orange-400" />
            <span className="hidden md:inline">Prep & Resource Hub</span>
            <span className="md:hidden">Prep Hub</span>
          </button>

          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'text-indigo-300 border-b-2 border-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span className="hidden lg:inline">Architecture & Tech Stack</span>
            <span className="lg:hidden">Architecture</span>
          </button>
        </nav>

        {/* User Auth & Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className={`flex items-center gap-2.5 border rounded-lg p-1.5 pr-2.5 shadow-sm transition-all ${
              currentUser.isPortalManager || currentUser.role === 'admin'
                ? 'bg-gradient-to-r from-blue-950/90 via-slate-900 to-slate-900 border-blue-500/60 ring-1 ring-blue-500/30'
                : 'bg-slate-900 border-slate-800'
            }`}>
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className={`h-6 w-6 rounded-full object-cover ${
                    currentUser.isPortalManager || currentUser.role === 'admin'
                      ? 'ring-2 ring-blue-500'
                      : 'ring-1 ring-slate-600'
                  }`}
                />
              ) : (
                <div className={`h-6 w-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  currentUser.isPortalManager || currentUser.role === 'admin'
                    ? 'bg-blue-600'
                    : 'bg-slate-700'
                }`}>
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                  <span>{currentUser.displayName}</span>
                  {(currentUser.isPortalManager || currentUser.role === 'admin') && (
                    <span className="rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.2 text-[9px] font-black uppercase border border-blue-500/40">
                      Portal Manager
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-orange-400 font-medium truncate max-w-[130px]">
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-rose-400 ml-1 p-1 rounded transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInWithGoogle}
              title="Sign in with Google (Authorized Portal Managers: airev.pk@gmail.com & shakeelsaeedofficial@gmail.com)"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('jobs')}
            className="hidden md:flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
          >
            <span>Apply Now</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
