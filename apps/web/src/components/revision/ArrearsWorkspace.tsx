import React, { useState } from 'react';
import type { ArrearCalculationResult } from '../../types/api';
import { calculateArrearsApi } from '../../lib/api';
import { Calculator } from 'lucide-react';

interface ArrearsWorkspaceProps {
  revisionId: string;
}

export const ArrearsWorkspace: React.FC<ArrearsWorkspaceProps> = ({ revisionId }) => {
  const [oldPay, setOldPay] = useState(25600);
  const [revisedPay, setRevisedPay] = useState(26600);
  const [effectiveDate, setEffectiveDate] = useState('2024-04-01');
  const [calcDate, setCalcDate] = useState('2026-03-31');

  const [result, setResult] = useState<ArrearCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunArrears = async () => {
    setLoading(true);
    try {
      const data = await calculateArrearsApi(revisionId, oldPay, revisedPay, effectiveDate, calcDate);
      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Arrear calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Period-Wise Pension Arrears Calculation Engine</h3>
              <p className="text-[11px] text-slate-400">Month-by-month differential pension calculation across effective period</p>
            </div>
          </div>

          <button
            onClick={handleRunArrears}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow transition"
          >
            <span>{loading ? 'Calculating...' : 'Run Arrears Engine'}</span>
          </button>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Old Monthly Pension (₹)</label>
            <input
              type="number"
              value={oldPay}
              onChange={(e) => setOldPay(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono font-bold text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Revised Monthly Pension (₹)</label>
            <input
              type="number"
              value={revisedPay}
              onChange={(e) => setRevisedPay(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono font-bold text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Calculation Date</label>
            <input
              type="date"
              value={calcDate}
              onChange={(e) => setCalcDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-200"
            />
          </div>
        </div>

        {/* Arrears Summary Result Cards */}
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Payable Months</p>
                <p className="text-xl font-bold text-slate-100 font-mono mt-1">{result.periods.length} Months</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Gross Arrears</p>
                <p className="text-xl font-bold text-blue-400 font-mono mt-1">₹{result.gross_arrears.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950 border border-emerald-800 p-3.5 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-emerald-400">Net Payable Arrears</p>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{result.net_arrears_payable.toLocaleString()}</p>
              </div>
            </div>

            {/* Month-by-Month Periods Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-semibold">
                    <th className="py-2.5 px-3">Pay Period</th>
                    <th className="py-2.5 px-3">Old Monthly Pension</th>
                    <th className="py-2.5 px-3">Revised Monthly Pension</th>
                    <th className="py-2.5 px-3 text-right">Monthly Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {result.periods.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-900/40 transition">
                      <td className="py-2 px-3 font-semibold text-slate-200">{p.year_month}</td>
                      <td className="py-2 px-3 text-slate-400">₹{p.old_monthly_amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-300">₹{p.revised_monthly_amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">+₹{p.monthly_difference.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
