import React from 'react';
import { EmailDispatchLog } from '../types';
import { Mail, CheckCircle2, Clock, X, ExternalLink } from 'lucide-react';

interface EmailPreviewModalProps {
  email: EmailDispatchLog;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ email, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Transactional Dispatch Preview (Resend/SendGrid API)</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">
          Automated Candidate Notification
        </h3>

        {/* Email Header Metadata */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-300 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">To:</span>
            <span className="font-semibold text-white">{email.recipientName} &lt;{email.to}&gt;</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">From:</span>
            <span className="text-slate-300">Talent Acquisition &lt;hiring@company.ai&gt;</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Subject:</span>
            <span className="font-semibold text-indigo-300">{email.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sent:</span>
            <span className="text-slate-400">{new Date(email.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-900">
            <span className="text-slate-500">Delivery Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Delivered via TLS (250 OK)
            </span>
          </div>
        </div>

        {/* Email Body Content */}
        <div 
          className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-200 leading-relaxed font-sans space-y-4"
          dangerouslySetInnerHTML={{ __html: email.contentHtml }}
        />

        <div className="pt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
