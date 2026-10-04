import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/firebase';
import { 
  X, 
  Phone, 
  User, 
  Mail, 
  MapPin, 
  Linkedin, 
  Globe, 
  Shield, 
  CheckCircle2, 
  MessageSquare, 
  Save, 
  RefreshCw, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface ProfileManagementModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedUser: UserProfile) => void;
}

export const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [whatsappAvailable, setWhatsappAvailable] = useState<boolean>(user.whatsappAvailable ?? true);
  const [city, setCity] = useState(user.city || 'Karachi');
  const [linkedInUrl, setLinkedInUrl] = useState(user.linkedInUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhoneNumber(user.phoneNumber || '');
      setWhatsappAvailable(user.whatsappAvailable ?? true);
      setCity(user.city || 'Karachi');
      setLinkedInUrl(user.linkedInUrl || '');
      setPortfolioUrl(user.portfolioUrl || '');
      setBio(user.bio || '');
      setSaveSuccess(false);
    }
  }, [user]);

  if (!isOpen) return null;

  // Detect Pakistani Network Carrier by prefix (0300 Jazz, 0345 Telenor, 0312 Zong, 0333 Ufone)
  const getPakistaniCarrier = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('9230') || clean.startsWith('030')) return { name: 'Jazz / Mobilink', color: 'text-red-400 bg-red-950/60 border-red-800/60' };
    if (clean.startsWith('9234') || clean.startsWith('034')) return { name: 'Telenor 4G', color: 'text-sky-400 bg-sky-950/60 border-sky-800/60' };
    if (clean.startsWith('9231') || clean.startsWith('031')) return { name: 'Zong 4G', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
    if (clean.startsWith('9233') || clean.startsWith('033')) return { name: 'Ufone 4G', color: 'text-orange-400 bg-orange-950/60 border-orange-800/60' };
    if (clean.startsWith('9232') || clean.startsWith('032')) return { name: 'Warid / Jazz', color: 'text-blue-400 bg-blue-950/60 border-blue-800/60' };
    return null;
  };

  const carrier = getPakistaniCarrier(phoneNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedFields: Partial<UserProfile> & { uid: string } = {
        uid: user.uid,
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        whatsappAvailable,
        city,
        linkedInUrl: linkedInUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        bio: bio.trim()
      };

      await saveUserProfile(updatedFields);

      const mergedProfile: UserProfile = {
        ...user,
        ...updatedFields
      };

      onProfileUpdated(mergedProfile);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500 shadow-md"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-md">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-none">
                  Profile & Contact Management
                </h3>
                {user.isPortalManager && (
                  <span className="rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.5 text-[9px] font-extrabold uppercase border border-blue-500/40">
                    Manager
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-700/80 p-3 text-xs text-emerald-300 font-semibold animate-in fade-in duration-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Profile & Contact Number saved successfully to Cloud Firestore!</span>
            </div>
          )}

          {/* PRIMARY FOCUS: Contact Number (Cell Phone) */}
          <div className="rounded-xl border border-blue-500/40 bg-gradient-to-b from-blue-950/40 to-slate-950 p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                <Smartphone className="h-4 w-4 text-orange-400" />
                <span>Contact Number (Pakistani Mobile) *</span>
              </label>

              {carrier && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${carrier.color}`}>
                  {carrier.name}
                </span>
              )}
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="+92 300 1234567 or 0300-1234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAvailable}
                  onChange={(e) => setWhatsappAvailable(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp active on this number (Recommended for alerts)</span>
                </span>
              </label>

              <span className="text-[11px] text-slate-500">
                Auto-fills in applications & scheduling
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
              💡 <em>Why we need this:</em> AIREV HR uses your cell phone for instant interview calendar invites, WhatsApp assessment reminders, and Karachi security gate passes for Round 2.
            </p>
          </div>

          {/* Full Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City / Location in Pakistan
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Karachi">Karachi (AIREV Emerging Center On-Site)</option>
                  <option value="Lahore">Lahore (Willing to relocate)</option>
                  <option value="Islamabad">Islamabad / Rawalpindi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Other">Other Pakistani City</option>
                </select>
              </div>
            </div>
          </div>

          {/* LinkedIn & Portfolio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub / Portfolio URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bio / Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Professional Summary / Headline
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Senior Full-Stack & AI Systems Practitioner with 4+ years building high-throughput pipelines in Node.js and Python..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Portal Permissions & Account Tier */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <div>
                <span className="text-slate-400">Account Privilege: </span>
                <span className="font-bold text-white capitalize">{user.role}</span>
              </div>
            </div>

            <span className="text-slate-500 text-[11px]">
              ID: {user.uid.slice(0, 8)}...
            </span>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile & Number</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
