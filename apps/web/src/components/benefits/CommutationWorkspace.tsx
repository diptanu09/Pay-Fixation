import React, { useState } from 'react';


interface CommutationWorkspaceProps {
  basicPension: number;
}

const COMMUTATION_TABLE: Record<number, { factor2017: number; factorLegacy: number }> = {
  55: { factor2017: 8.771, factorLegacy: 8.771 },
  56: { factor2017: 8.665, factorLegacy: 8.665 },
  57: { factor2017: 8.557, factorLegacy: 8.557 },
  58: { factor2017: 8.446, factorLegacy: 8.471 },
  59: { factor2017: 8.371, factorLegacy: 8.371 },
  60: { factor2017: 8.287, factorLegacy: 8.287 },
  61: { factor2017: 8.194, factorLegacy: 8.194 },
  62: { factor2017: 8.093, factorLegacy: 8.093 },
  63: { factor2017: 7.982, factorLegacy: 7.982 },
  64: { factor2017: 7.862, factorLegacy: 7.862 },
  65: { factor2017: 7.731, factorLegacy: 7.731 },
};

export const CommutationWorkspace: React.FC<CommutationWorkspaceProps> = ({ basicPension = 26600 }) => {
  const [commutationPct, setCommutationPct] = useState(40);
  const [ageNextBirthday, setAgeNextBirthday] = useState(61);
  const [ruleVersion, setRuleVersion] = useState<'Rop2017' | 'Legacy'>('Rop2017');

  const row = COMMUTATION_TABLE[ageNextBirthday] || { factor2017: 8.194, factorLegacy: 8.194 };
  const factor = ruleVersion === 'Rop2017' ? row.factor2017 : row.factorLegacy;

  const commutedMonthly = Math.ceil((basicPension * commutationPct) / 100);
  const commutedLumpSum = Math.ceil(commutedMonthly * 12 * factor);
  const reducedMonthlyPension = basicPension - commutedMonthly;

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Dynamic Commutation Factor Lookup Table</h3>
            <p className="text-[11px] text-slate-400">Reconciled age-factor table matching official Tripura Finance Department orders</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Rule Version:</span>
            <select
              value={ruleVersion}
              onChange={(e) => setRuleVersion(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="Rop2017">TRIPURA ROP 2017 / 2018 Table (Age 58 = 8.446)</option>
              <option value="Legacy">Legacy ROP Table (Age 58 = 8.471)</option>
            </select>
          </div>
        </div>

        {/* 3-Column Commutation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COL 1: INPUT CONTEXT */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs">01. Commutation Parameters</h4>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Gross Monthly Basic Pension</label>
              <input
                type="number"
                disabled
                value={basicPension}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Commutation Fraction (%)</label>
              <select
                value={commutationPct}
                onChange={(e) => setCommutationPct(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value={40}>40% (Maximum Permitted)</option>
                <option value={30}>30%</option>
                <option value={20}>20%</option>
                <option value={0}>0% (No Commutation)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Age Next Birthday</label>
              <select
                value={ageNextBirthday}
                onChange={(e) => setAgeNextBirthday(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              >
                {Object.keys(COMMUTATION_TABLE).map((age) => (
                  <option key={age} value={age}>
                    Age {age} (Factor: {ruleVersion === 'Rop2017' ? COMMUTATION_TABLE[Number(age)].factor2017 : COMMUTATION_TABLE[Number(age)].factorLegacy})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* COL 2: STEP TRACE & FORMULA */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs">02. Formula & Table Reasoning</h4>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="font-bold text-blue-400 text-xs">1. Table Factor Match</span>
              <p className="text-slate-400 text-[11px]">Age Next Birthday: <span className="font-mono text-slate-200 font-bold">{ageNextBirthday}</span></p>
              <p className="font-mono text-emerald-400 font-bold text-xs text-right">Resolved Factor: {factor}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="font-bold text-blue-400 text-xs">2. Commuted Portion Calculation</span>
              <p className="font-mono text-[10px] text-amber-400/90">({basicPension} × {commutationPct}%)</p>
              <p className="font-mono text-emerald-400 font-bold text-xs text-right">₹{commutedMonthly.toLocaleString()} / month</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="font-bold text-blue-400 text-xs">3. Lump Sum Formula</span>
              <p className="font-mono text-[10px] text-amber-400/90">{commutedMonthly} × 12 × {factor}</p>
              <p className="font-mono text-emerald-400 font-bold text-xs text-right">₹{commutedLumpSum.toLocaleString()}</p>
            </div>
          </div>

          {/* COL 3: COMMUTATION RESULT CARDS */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs">03. Commutation Lump Sum</h4>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Commuted Lump Sum Value</p>
              <p className="text-3xl font-black text-amber-400 font-mono">₹{commutedLumpSum.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Statutory One-time Lump Sum Disbursement</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Reduced Monthly Pension:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">₹{reducedMonthlyPension.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
