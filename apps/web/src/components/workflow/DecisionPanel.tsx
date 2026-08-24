import React, { useState } from 'react';
import { CheckCircle2, FileCheck, ShieldCheck, CornerDownLeft } from 'lucide-react';

interface DecisionPanelProps {
  currentStatus: string;
  onAction: (action: string, notes: string) => void;
  loading?: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ currentStatus, onAction, loading }) => {
  const [comment, setComment] = useState('');

  const handleExecute = (action: string) => {
    if (!comment.trim()) {
      alert('Official review comment is required prior to executing workflow decision');
      return;
    }
    onAction(action, comment);
    setComment('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <ShieldCheck className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Official Workflow Decision Panel</h3>
          <p className="text-[11px] text-slate-400">Formal administrative decision recording with mandatory audit comment</p>
        </div>
      </div>

      <div>
        <label className="block text-slate-400 mb-1 font-medium">Official Review Comment / Audit Note *</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter statutory audit remarks, verification notes, or approval rationale..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <button
          onClick={() => handleExecute('reject')}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg font-bold transition"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          <span>Return for Correction</span>
        </button>

        {currentStatus === 'VERIFICATION' && (
          <button
            onClick={() => handleExecute('verify')}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify Calculation</span>
          </button>
        )}

        {currentStatus === 'APPROVAL' && (
          <button
            onClick={() => handleExecute('approve')}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Approve Case Package</span>
          </button>
        )}

        {currentStatus === 'AUTHORIZATION' && (
          <button
            onClick={() => handleExecute('authorize')}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition shadow"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorize & Issue Sanction Order</span>
          </button>
        )}
      </div>
    </div>
  );
};
