import React, { useState } from 'react';
import { Award, AlertTriangle, Bookmark } from 'lucide-react';

interface DcrgWorkspaceProps {
  lastEmoluments: number;
  halfYears: number;
}

export const DcrgWorkspace: React.FC<DcrgWorkspaceProps> = ({ lastEmoluments = 53200, halfYears = 58 }) => {
  const [alreadyPaid, setAlreadyPaid] = useState(0);
  const [recoveries, setRecoveries] = useState(0);

  const rawGross = (lastEmoluments / 4) * Math.min(halfYears, 66);
  const ceiling = 2000000;
  const ceilingApplied = rawGross > ceiling;
  const grossDcrg = Math.min(rawGross, ceiling);
  const netDcrg = Math.max(0, grossDcrg - alreadyPaid - recoveries);

  return (
    <div className="space-y-6 text-xs">
      {/* Ceiling Warning Notice */}
      {ceilingApplied && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Statutory Ceiling Applied (Rule 50)</p>
              <p className="text-[11px] text-amber-300">
                Calculated Gross DCRG (₹{rawGross.toLocaleString()}) exceeded maximum permitted statutory ceiling of ₹{ceiling.toLocaleString()}. Automatically capped.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-900 border border-amber-700 text-amber-300 rounded font-bold text-[10px]">
            CAPPED AT ₹20,00,000
          </span>
        </div>
      )}

      {/* 3-Column DCRG Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COL 1: INPUT CONTEXT */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">01. DCRG Inputs</h3>
              <p className="text-[11px] text-slate-400">Emoluments & Service Parameters</p>
            </div>
            <Bookmark className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Last Emoluments (Basic Pay)</label>
              <input
                type="number"
                disabled
                value={lastEmoluments}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Qualifying Half-Years (Capped at 66)</label>
              <input
                type="number"
                disabled
                value={Math.min(halfYears, 66)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Amount Already Paid (₹)</label>
              <input
                type="number"
                value={alreadyPaid}
                onChange={(e) => setAlreadyPaid(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Government Recoveries / Deductions (₹)</label>
              <input
                type="number"
                value={recoveries}
                onChange={(e) => setRecoveries(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* COL 2: STEP TRACE */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm">02. Statutory DCRG Trace</h3>
            <p className="text-[11px] text-slate-400">Rule 50 Execution Reasoning</p>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-xs">1. Emoluments Base</span>
                <span className="text-[10px] font-mono text-slate-500">TRIPURA-DCRG-RULE-50</span>
              </div>
              <p className="text-slate-400 text-[11px]">Last Basic Pay obtained from Pay Fixation</p>
              <p className="font-bold text-emerald-400 font-mono text-right text-xs">₹{lastEmoluments.toLocaleString()}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-xs">2. Raw Gratuity Formula</span>
              </div>
              <p className="font-mono text-[10px] text-amber-400/90">(emoluments / 4) * min(half_years, 66)</p>
              <p className="font-bold text-emerald-400 font-mono text-right text-xs">₹{rawGross.toLocaleString()}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-xs">3. Statutory Ceiling Check</span>
                <span className="text-[10px] font-mono text-slate-500">ROP 2018 Amendment</span>
              </div>
              <p className="text-slate-400 text-[11px]">Ceiling Cap: ₹{ceiling.toLocaleString()}</p>
              <p className="font-bold text-emerald-400 font-mono text-right text-xs">Capped: ₹{grossDcrg.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* COL 3: DCRG RESULT CARD */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">03. DCRG Authorization</h3>
              <p className="text-[11px] text-slate-400">Final Payable Gratuity</p>
            </div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400">Gross Authorized DCRG</p>
            <p className="text-3xl font-black text-emerald-400 font-mono">₹{grossDcrg.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">Statutory Maximum Limit: ₹{ceiling.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Already Paid:</span>
              <span className="font-mono text-slate-300">₹{alreadyPaid.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Recoveries / Deductions:</span>
              <span className="font-mono text-amber-400">₹{recoveries.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 border border-emerald-800 rounded-lg p-3 flex items-center justify-between">
              <span className="text-slate-200 font-bold">Net DCRG Payable:</span>
              <span className="font-mono font-black text-emerald-400 text-base">₹{netDcrg.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
