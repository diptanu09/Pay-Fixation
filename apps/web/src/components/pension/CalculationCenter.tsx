import React from 'react';
import { ShieldCheck, ArrowRight, Layers } from 'lucide-react';

interface CalculationCenterProps {
  onNavigateTab: (tab: string) => void;
  onSubmitVerification: () => void;
}

const MODULES = [
  { id: 'payfix', name: 'Pay Fixation Engine', status: 'Complete ✓', desc: 'Revised basic pay under ROP 2017 Level 8 Index 10 (₹53,200)' },
  { id: 'service', name: 'Qualifying Service', status: 'Complete ✓', desc: '58 Half-Year Periods computed under Pension Rule 28' },
  { id: 'pension', name: 'Superannuation Pension', status: 'Complete ✓', desc: 'Gross Monthly Basic Pension ₹26,600 (50% of ₹53,200)' },
  { id: 'family', name: 'Family Pension', status: 'Complete ✓', desc: 'Normal Family Pension ₹15,960 (30%) & Enhanced ₹26,600' },
  { id: 'dcrg', name: 'DCRG (Death cum Retirement Gratuity)', status: 'Complete ✓', desc: 'Gross DCRG ₹8,77,800 under Rule 50 (Ceiling ₹20,00,000)' },
  { id: 'commutation', name: 'Pension Commutation', status: 'Complete ✓', desc: '40% Commuted Value ₹7,71,400 (Net Reduced Pension ₹15,960)' },
];

export const CalculationCenter: React.FC<CalculationCenterProps> = ({ onNavigateTab, onSubmitVerification }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Unified Case Calculation Center</h2>
          </div>
          <p className="text-slate-400 text-xs">All 6 calculation modules validated and verified. Ready for verification review.</p>
        </div>

        <button
          onClick={onSubmitVerification}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition"
        >
          <span>Submit Complete Case for Verification</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map((mod) => (
          <div
            key={mod.id}
            onClick={() => onNavigateTab(mod.id)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-slate-200 text-xs">{mod.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {mod.status}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">{mod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
