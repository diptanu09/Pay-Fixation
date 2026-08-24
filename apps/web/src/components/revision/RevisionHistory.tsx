import React from 'react';
import type { RevisionCase } from '../../types/api';
import { History, Calendar, ArrowRight } from 'lucide-react';

interface RevisionHistoryProps {
  revisions: RevisionCase[];
  onSelectRevision: (rev: RevisionCase) => void;
  onOpenNewRevision: () => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({ revisions, onSelectRevision, onOpenNewRevision }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Immutable Revision Chain & Version History</h3>
            <p className="text-[11px] text-slate-400">Non-destructive calculation history linked to original snapshot</p>
          </div>
        </div>

        <button
          onClick={onOpenNewRevision}
          className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow transition"
        >
          <span>Initiate New Revision</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Revision Chain Timeline */}
      <div className="space-y-3">
        {/* Original Base Case Node */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold flex items-center justify-center text-[10px]">
              BASE
            </div>
            <div>
              <p className="font-bold text-slate-200">Original Case Calculation Package</p>
              <p className="text-[11px] text-slate-400">Initial Superannuation Pension Sanction · Immutable Base Snapshot</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px]">
            SEALED BASE ✓
          </span>
        </div>

        {/* Revisions List */}
        {revisions.map((rev) => (
          <div
            key={rev.revision_id}
            onClick={() => onSelectRevision(rev)}
            className="bg-slate-950 border border-slate-800 hover:border-blue-500/60 transition cursor-pointer rounded-lg p-3.5 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold flex items-center justify-center text-[10px]">
                {rev.revision_number}
              </div>
              <div>
                <p className="font-bold text-slate-100 flex items-center space-x-2">
                  <span>Revision {rev.revision_number}: {rev.reason}</span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Effective From: {rev.effective_date}</span>
                  <span>· Requested by {rev.requested_by}</span>
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded font-bold text-[10px]">
              {rev.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
