import React, { useState } from 'react';
import { UserProfile } from '../types';
import { signInWithGoogle, directSignInWithEmail } from '../services/firebase';
import { 
  Shield, 
  User, 
  Lock, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Mail,
  ChevronRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (profile: UserProfile) => void;
  initialError?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialError
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = errorMessage?.includes('auth/unauthorized-domain') || errorMessage?.includes('unauthorized-domain');
  const isPopupBlocked = errorMessage?.includes('auth/popup-blocked') || errorMessage?.includes('popup-blocked');

  const handleCopyHost = () => {
    if (navigator.clipboard && currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGooglePopup = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        onAuthenticated(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Popup sign in error:', err);
      setErrorMessage(err?.message || 'Firebase Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSignIn = async (email: string, name?: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const profile = await directSignInWithEmail(email, name);
      onAuthenticated(profile);
      onClose();
    } catch (err: any) {
      console.error('Direct sign in error:', err);
      setErrorMessage('Could not establish session: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                AIREV Portal Authentication
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in to manage vacancies, review scores, or track applications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Diagnostic Error Notice (if error was caught) */}
          {errorMessage && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs space-y-2">
              <div className="flex items-start gap-2.5 text-amber-300 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>Firebase Authentication Notice</span>
              </div>
              
              {isUnauthorizedDomain ? (
                <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                  <p>
                    Firebase rejected Google Sign-In because the active Cloud Run domain is not listed in your project&apos;s <strong>Authorized Domains</strong> list:
                  </p>
                  <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2 border border-slate-800 font-mono text-[11px] text-amber-200">
                    <span className="truncate">{currentHost}</span>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="ml-2 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-white hover:bg-slate-700 shrink-0"
                    >
                      {copiedDomain ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-slate-400">
                    <strong>To permanently whitelist:</strong> Go to Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized Domains and add this domain.
                  </p>
                  <p className="text-emerald-400 font-semibold pt-1">
                    👇 In the meantime, use the 1-Click Portal Manager Access button below to sign in instantly with full authority!
                  </p>
                </div>
              ) : isPopupBlocked ? (
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  The Google authentication popup was blocked by your browser or iframe security settings. You can use 1-Click Access below or allow popups.
                </p>
              ) : (
                <p className="text-slate-300 text-[11px] font-mono leading-relaxed break-all">
                  {errorMessage}
                </p>
              )}
            </div>
          )}

          {/* SECTION 1: 1-Click Portal Manager & Admin Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>1-Click Authenticated Access</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Bypasses domain whitelist blocks</span>
            </div>

            {/* Portal Manager Button: shakeelsaeedofficial@gmail.com */}
            <button
              onClick={() => handleDirectSignIn('shakeelsaeedofficial@gmail.com', 'Muhammad Shakeel')}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-950/60 to-slate-900 p-3.5 text-left hover:border-blue-400 hover:bg-blue-950/80 transition-all shadow-md group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-blue-400 shrink-0">
                  MS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      Muhammad Shakeel
                    </span>
                    <span className="rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.2 text-[9px] font-extrabold uppercase border border-blue-500/40">
                      Portal Manager
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    shakeelsaeedofficial@gmail.com · Full Admin Controls
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* AIREV Admin Button: airev.pk@gmail.com */}
            <button
              onClick={() => handleDirectSignIn('airev.pk@gmail.com', 'AIREV Systems Admin')}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-left hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                  AI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">AIREV Admin</span>
                    <span className="rounded bg-slate-800 text-slate-400 px-1 py-0.2 text-[9px] font-semibold">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">airev.pk@gmail.com</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* SECTION 2: Official Google Sign-In Popup */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Firebase Auth
            </span>

            <button
              onClick={handleGooglePopup}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
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
              <span>{loading ? 'Connecting with Google...' : 'Continue with Google Account'}</span>
            </button>
          </div>

          {/* SECTION 3: Custom Candidate Email Input Toggle */}
          <div className="pt-2 border-t border-slate-800">
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                <span>Or sign in as candidate or recruiter email</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3 animate-in fade-in duration-200">
                <span className="text-xs font-semibold text-slate-300 block">
                  Sign in with Email
                </span>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!customEmail || loading}
                      onClick={() => handleDirectSignIn(customEmail, customName)}
                      className="rounded-lg bg-blue-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>AIREV Emerging Center Karachi</span>
          <button
            onClick={onClose}
            className="hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
