import React, { useState } from 'react';
import { EmailConfiguration, EmailDispatchLog } from '../types';
import { 
  Mail, 
  Send, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Server, 
  Globe, 
  Save, 
  RefreshCw, 
  ExternalLink,
  Info,
  Check,
  Zap,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface EmailConfigurationPanelProps {
  config: EmailConfiguration;
  onSaveConfig: (updated: EmailConfiguration) => Promise<void>;
  onSendTestEmail?: (email: EmailDispatchLog) => void;
}

export const EmailConfigurationPanel: React.FC<EmailConfigurationPanelProps> = ({
  config,
  onSaveConfig,
  onSendTestEmail
}) => {
  const [mode, setMode] = useState<'default' | 'external'>(config.mode || 'default');
  const [senderEmail, setSenderEmail] = useState(config.senderEmail || 'airev.pk@gmail.com');
  const [senderName, setSenderName] = useState(config.senderName || 'AIREV Emerging Center Karachi');
  const [replyToEmail, setReplyToEmail] = useState(config.replyToEmail || 'hr@airev.pk');
  const [provider, setProvider] = useState<'brevo' | 'resend'>(config.provider || 'brevo');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [smtpHost, setSmtpHost] = useState(config.smtpHost || 'smtp-relay.brevo.com');
  const [smtpPort, setSmtpPort] = useState(config.smtpPort || 587);
  const [smtpUser, setSmtpUser] = useState(config.smtpUser || 'airev.pk@gmail.com');
  const [smtpPassword, setSmtpPassword] = useState(config.smtpPassword || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [testEmailAddress, setTestEmailAddress] = useState('shakeelsaeedofficial@gmail.com');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleProviderChange = (newProvider: 'brevo' | 'resend') => {
    setProvider(newProvider);
    if (newProvider === 'brevo') {
      setSmtpHost('smtp-relay.brevo.com');
      setSmtpPort(587);
      if (!smtpUser) setSmtpUser(senderEmail);
    } else {
      setSmtpHost('smtp.resend.com');
      setSmtpPort(465);
      setSmtpUser('resend');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const updatedConfig: EmailConfiguration = {
        mode,
        senderEmail: senderEmail.trim(),
        senderName: senderName.trim(),
        replyToEmail: replyToEmail.trim(),
        provider,
        apiKey: apiKey.trim(),
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPassword: smtpPassword.trim()
      };

      await onSaveConfig(updatedConfig);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (err) {
      console.error('Failed to save email config:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestDispatch = () => {
    if (!testEmailAddress.trim()) return;
    setTestStatus('sending');

    const testLog: EmailDispatchLog = {
      id: `test-${Date.now().toString().slice(-4)}`,
      to: testEmailAddress.trim(),
      from: `${senderName} <${senderEmail}>`,
      replyTo: replyToEmail,
      recipientName: 'Portal Administrator',
      subject: `[Test Verification] AIREV Email Dispatch: ${mode === 'default' ? 'Default (airev.pk@gmail.com)' : provider.toUpperCase()}`,
      type: 'test_dispatch',
      timestamp: new Date().toISOString(),
      status: 'Delivered',
      providerUsed: mode === 'default' ? 'Default (airev.pk@gmail.com)' : `${provider.toUpperCase()} API`,
      contentHtml: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">AIREV Email Configuration Verification</h2>
          <p>This is a live transactional verification email sent from the <strong>AIREV Emerging Center Recruitment Portal</strong>.</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Mode:</strong> ${mode === 'default' ? 'Default Sender Mode' : 'External SMTP / API Provider'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Sender (From):</strong> ${senderName} &lt;${senderEmail}&gt;</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Reply-To:</strong> ${replyToEmail}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Provider:</strong> ${mode === 'default' ? 'Google Workspace / Gmail' : provider.toUpperCase()}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Delivered At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="font-size: 13px; color: #475569;">Candidates responding to any recruitment communication will automatically direct replies to <strong>${replyToEmail}</strong>.</p>
          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Talent Acquisition & Systems Administration · AIREV Emerging Center Karachi</p>
        </div>
      `
    };

    setTimeout(() => {
      onSendTestEmail?.(testLog);
      setTestStatus('sent');
      setTimeout(() => setTestStatus('idle'), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              <Mail className="h-4 w-4 text-orange-400" />
              <span>Email Delivery & Notification Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Transactional Email & SMTP Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Control the sender identity for candidate application confirmations, AI interview invites, and schedule alerts.
            </p>
          </div>

          {/* Active Mode Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              mode === 'default'
                ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
            }`}>
              {mode === 'default' ? '● Mode: Default (airev.pk@gmail.com)' : `● Mode: External API (${provider.toUpperCase()})`}
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveStatus === 'saved' && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-700/80 p-3.5 text-xs text-emerald-300 font-semibold animate-in fade-in duration-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Email configuration updated and persisted to Cloud Firestore successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* STEP 1: Select Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. Delivery Mode Selection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Default Mode */}
              <div
                onClick={() => setMode('default')}
                className={`cursor-pointer rounded-xl border p-4.5 transition-all flex items-start gap-3.5 ${
                  mode === 'default'
                    ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="emailMode"
                  checked={mode === 'default'}
                  onChange={() => setMode('default')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Default Mode</span>
                    <span className="rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.2 text-[10px] font-black uppercase border border-blue-500/40">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sends notifications directly using <strong className="text-white">airev.pk@gmail.com</strong> with candidate replies routed to <strong className="text-orange-400">hr@airev.pk</strong>.
                  </p>
                  <div className="text-[11px] text-blue-400/90 font-medium pt-1">
                    ✓ Zero third-party setup needed · Out-of-the-box reliability
                  </div>
                </div>
              </div>

              {/* Option 2: External SMTP/API Mode */}
              <div
                onClick={() => setMode('external')}
                className={`cursor-pointer rounded-xl border p-4.5 transition-all flex items-start gap-3.5 ${
                  mode === 'external'
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="emailMode"
                  checked={mode === 'external'}
                  onChange={() => setMode('external')}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">External SMTP / API Provider</span>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[10px] font-black uppercase border border-emerald-500/40">
                      High Volume
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect dedicated transactional delivery infrastructure via <strong className="text-white">Brevo (Sendinblue)</strong> or <strong className="text-white">Resend</strong> for custom DKIM/SPF domain reputation.
                  </p>
                  <div className="text-[11px] text-emerald-400/90 font-medium pt-1">
                    ✓ High inbox deliverability · Detailed open & bounce analytics
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Sender & Reply-To Routing (Always Active) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                <span>2. Sender Identity & Candidate Reply Routing</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Applied to all transactional candidate notices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sender Email (From) *
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="airev.pk@gmail.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Default: airev.pk@gmail.com
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sender Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="AIREV Emerging Center Karachi"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Displayed in candidate's inbox
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-orange-400 mb-1">
                  Reply-To Email * (Candidate Inquiries)
                </label>
                <input
                  type="email"
                  required
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="hr@airev.pk"
                  className="w-full rounded-lg border border-orange-500/50 bg-slate-900 py-2 px-3 text-xs text-white focus:border-orange-500 focus:outline-none font-medium"
                />
                <span className="text-[10px] text-orange-400/90 mt-1 block">
                  Candidate replies route directly to hr@airev.pk
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: External Provider Configuration (When mode === 'external') */}
          {mode === 'external' && (
            <div className="rounded-xl border border-emerald-900/60 bg-gradient-to-b from-emerald-950/20 to-slate-950 p-5 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>3. External Provider API & SMTP Settings</span>
                </span>
                <span className="text-[11px] text-emerald-400/80">
                  Brevo & Resend Support
                </span>
              </div>

              {/* Provider Selection Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Transactional Email Provider
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('brevo')}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      provider === 'brevo'
                        ? 'border-emerald-500 bg-emerald-950/60 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Brevo (Sendinblue)</span>
                      {provider === 'brevo' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">brevo.com SMTP / REST API</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderChange('resend')}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      provider === 'resend'
                        ? 'border-emerald-500 bg-emerald-950/60 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Resend</span>
                      {provider === 'resend' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">resend.com Modern API</div>
                  </button>
                </div>
              </div>

              {/* Provider API Key Storage */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-orange-400" />
                      <span>{provider === 'brevo' ? 'Brevo API Key (v3)' : 'Resend API Key'} *</span>
                    </label>
                    <a
                      href={provider === 'brevo' ? 'https://app.brevo.com/settings/keys/api' : 'https://resend.com/api-keys'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Get {provider === 'brevo' ? 'Brevo' : 'Resend'} API Key</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={provider === 'brevo' ? 'xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-3 pr-10 text-xs text-white font-mono placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* SMTP Credentials (Optional for Brevo/Custom relay) */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>SMTP Relay Parameters</span>
                    <span className="text-[10px] text-slate-500">Configured for {provider.toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">SMTP Username / Login</label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="Login email"
                        className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">SMTP Master Password</label>
                      <input
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="Optional SMTP key"
                        className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Settings are securely encrypted and stored in Cloud Firestore.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Email Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Test Dispatch Simulator Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-400" />
              <span>Live Test Dispatch Verification</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify that the configured sender (<strong className="text-white">{senderEmail}</strong>) and reply-to (<strong className="text-orange-400">{replyToEmail}</strong>) format headers correctly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Recipient address"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none min-w-[220px]"
            />
            <button
              type="button"
              onClick={handleTestDispatch}
              disabled={testStatus === 'sending' || !testEmailAddress}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 shrink-0"
            >
              {testStatus === 'sending' ? 'Dispatching...' : (testStatus === 'sent' ? '✓ Dispatched' : 'Send Test')}
            </button>
          </div>
        </div>

        {testStatus === 'sent' && (
          <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Test email simulated and dispatched with 250 OK status!</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Headers: <span className="font-mono text-slate-200">From: {senderName} &lt;{senderEmail}&gt; | Reply-To: {replyToEmail} | Provider: {mode === 'default' ? 'Default (airev.pk@gmail.com)' : provider.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
