import React from 'react';

interface ServiceBreakdownProps {
  nonQualifyingDays: number;
}

export const QualifyingServiceVisualizer: React.FC<ServiceBreakdownProps> = ({ nonQualifyingDays }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-100">Qualifying Service Visualizer & Breakdown</h3>
        <p className="text-[11px] text-slate-400">Rule 28 calculation of net half-year periods for full pension entitlement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-slate-400">Gross Service</p>
          <p className="text-base font-bold text-slate-200 mt-1">29Y 0M 27D</p>
          <p className="text-[10px] text-slate-500 mt-0.5">1997-03-05 → 2026-03-31</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-slate-400">Non-Qualifying Deductions</p>
          <p className="text-base font-bold text-amber-400 font-mono mt-1">{nonQualifyingDays} Days</p>
          <p className="text-[10px] text-slate-500 mt-0.5">LWA / Unauthorized Absence</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-slate-400">Net Qualifying Service</p>
          <p className="text-base font-bold text-slate-100 mt-1">29Y 0M {27 - nonQualifyingDays}D</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Rule 28 Net Result</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-slate-400">Applicable Half-Years</p>
          <p className="text-base font-black text-emerald-400 font-mono mt-1">58 Periods</p>
          <p className="text-[10px] text-emerald-400/80 mt-0.5 font-bold">100% Full Pension (&gt;= 33Y)</p>
        </div>
      </div>
    </div>
  );
};
