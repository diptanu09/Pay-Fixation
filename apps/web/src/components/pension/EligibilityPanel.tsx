import React from 'react';
import { CheckCircle2, ShieldCheck, Link2 } from 'lucide-react';

interface EligibilityPanelProps {
  lastPay: number;
  payFixationId?: string;
}

export const EligibilityPanel: React.FC<EligibilityPanelProps> = ({ lastPay, payFixationId = 'CALC-000123' }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Pension Eligibility & Pay Fixation Integration</h3>
          <p className="text-[11px] text-slate-400 font-medium">Automatic data linkage with verified pay fixation snapshot</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3" />
          <span>ELIGIBLE FOR PENSION ✓</span>
        </span>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="font-bold text-slate-200">Last Emoluments Obtained from Verified Pay Fixation</p>
            <p className="text-[10px] text-slate-400">Calculation Snapshot ID: <span className="font-mono text-blue-400 font-semibold">{payFixationId}</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">Verified Last Basic Pay</p>
          <p className="text-base font-black text-emerald-400 font-mono">₹{lastPay.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Valid retirement event (Superannuation)</span>
        </div>
        <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>58 Half-Year Qualifying Periods</span>
        </div>
        <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>TRIPURA-PENSION-2026.01 Rule Set</span>
        </div>
      </div>
    </div>
  );
};
