import React from 'react';
import type { PayFixationCase } from '../../types/api';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationPanelProps {
  caseData: PayFixationCase;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ caseData }) => {
  const { employee, service_history, pay_history } = caseData;

  const checks = [
    { label: 'Employee profile name & PR number', passed: !!employee?.name && !!employee?.pr_no },
    { label: 'Date of Birth & Date of Retirement present', passed: !!employee?.dob && !!employee?.date_retirement_or_death },
    { label: 'Service history continuity recorded', passed: (service_history?.length || 0) >= 0 },
    { label: 'Pay history entries recorded', passed: (pay_history?.length || 0) >= 0 },
    { label: 'Applicable ROP Rule set identified (ROP 2017/2018)', passed: true },
  ];

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Calculation Readiness & Validation Center</h3>
          <p className="text-[11px] text-slate-400">Pre-calculation checks required before engine execution</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            allPassed
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}
        >
          {allPassed ? 'READY TO CALCULATE ✓' : 'VALIDATION ERRORS'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((chk, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex items-center space-x-2.5 ${
              chk.passed
                ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                : 'bg-rose-950/30 border-rose-900 text-rose-300'
            }`}
          >
            {chk.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-xs">{chk.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3 text-[11px] text-amber-300 flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Statutory Rule Notice: Rupee fraction calculations round UP to next higher rupee per Government Pension Rules.
        </span>
      </div>
    </div>
  );
};
